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
        map.set(normalized, image);
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
  let missing = [];
  const next = stickers.map((sticker) => {
    const image = imageMap.get(sticker.code);
    if (image) {
      updated++;
      return { ...sticker, imageUrl: image };
    }
    missing.push(sticker.code);
    return sticker;
  });

  await writeFile(stickersPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`Updated ${updated} of ${stickers.length} stickers with images.`);
  if (missing.length) {
    console.log(`Missing image for ${missing.length} stickers:`);
    console.log(missing.slice(0, 30).join(", "), missing.length > 30 ? `... (+${missing.length - 30} more)` : "");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
