import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const collectionUrl = "https://www.worldtradingcards.com/collections/panini-fifa-world-cup-2026-stickers/products.json";
const PAGE_LIMIT = 250;
const MAX_PAGES = 20;

const SPECIAL_CODE_MAP = {
  PL000: "00"
};

function normalizeRemoteCode(remoteCode) {
  if (SPECIAL_CODE_MAP[remoteCode]) return SPECIAL_CODE_MAP[remoteCode];
  const match = remoteCode.match(/^([A-Z]+)(\d+)$/);
  if (!match) return remoteCode;
  const [, prefix, digits] = match;
  return `${prefix}${Number(digits)}`;
}

function extractCodeFromTitle(title) {
  const match = title.match(/^#([A-Z0-9]+)/);
  return match ? match[1] : null;
}

const BADGE_NAME_TOKENS = ["Emblem", "Team Logo", "Team Badge"];
const PHOTO_NAME_TOKENS = ["Team Photo"];

function parseProductTitle(title) {
  const parts = title.split("|").map((s) => s.trim());
  return {
    name: parts[4] ?? "",
    team: parts[5] ?? "",
    rarity: parts[6] ?? ""
  };
}

function deriveCategory(name, currentCategory) {
  if (BADGE_NAME_TOKENS.includes(name)) return "Team Badge";
  if (PHOTO_NAME_TOKENS.includes(name)) return "Team Photo";
  if (currentCategory === "Brand / Emblem" || currentCategory === "Host / Tournament" || currentCategory === "FIFA Museum") {
    return currentCategory;
  }
  return "Player";
}

function cleanImageUrl(src) {
  if (!src) return "";
  return src.split("?")[0];
}

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json,*/*" }
    });
    if (response.ok) return response;
    if (response.status === 429 || response.status >= 500) {
      const backoff = 1500 * (i + 1);
      console.log(`HTTP ${response.status}, retry in ${backoff}ms`);
      await sleep(backoff);
      continue;
    }
    throw new Error(`HTTP ${response.status} on ${url}`);
  }
  throw new Error(`Exhausted retries on ${url}`);
}

async function fetchAllProducts() {
  const map = new Map();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${collectionUrl}?limit=${PAGE_LIMIT}&page=${page}`;
    process.stdout.write(`Fetching page ${page}... `);
    const response = await fetchWithRetry(url);
    const { products } = await response.json();
    if (!products.length) {
      console.log("empty, stopping");
      break;
    }
    let added = 0;
    for (const product of products) {
      const code = extractCodeFromTitle(product.title);
      if (!code) continue;
      const image = cleanImageUrl(product.images?.[0]?.src);
      if (!image) continue;
      const normalized = normalizeRemoteCode(code);
      if (!map.has(normalized)) {
        const meta = parseProductTitle(product.title);
        map.set(normalized, { image, ...meta });
        added++;
      }
    }
    console.log(`${products.length} products, ${added} new image mappings`);
    if (products.length < PAGE_LIMIT) break;
    await sleep(1200);
  }
  return map;
}

async function main() {
  const imageMap = await fetchAllProducts();
  console.log(`\nTotal image mappings: ${imageMap.size}`);

  const stickersPath = path.join(root, "src", "data", "stickers.json");
  const raw = await readFile(stickersPath, "utf8");
  const stickers = JSON.parse(raw);

  let updated = 0;
  let nameChanges = 0;
  let categoryChanges = 0;
  let missing = [];

  const next = stickers.map((sticker) => {
    const entry = imageMap.get(sticker.code);
    if (!entry) {
      missing.push(sticker.code);
      return sticker;
    }
    updated++;
    const nextName = entry.name || sticker.name;
    const nextCategory = deriveCategory(nextName, sticker.category);
    const nextRarity = entry.rarity || sticker.rarity;
    if (nextName !== sticker.name) nameChanges++;
    if (nextCategory !== sticker.category) categoryChanges++;
    return {
      ...sticker,
      name: nextName,
      category: nextCategory,
      rarity: nextRarity,
      imageUrl: entry.image
    };
  });

  await writeFile(stickersPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`Updated ${updated} of ${stickers.length} stickers.`);
  console.log(`Name changes: ${nameChanges}, category changes: ${categoryChanges}`);
  if (missing.length) {
    console.log(`Missing entry for ${missing.length} stickers:`);
    console.log(missing.slice(0, 30).join(", "), missing.length > 30 ? `... (+${missing.length - 30} more)` : "");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
