import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SOURCE_URL = "https://paniniwm2026sticker.com/missing-stickers-list";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const stickersPath = path.join(root, "src", "data", "stickers.json");

const rarityMarkers = ["Base", "Foil", "Special", "Gold", "Silver", "Parallel", "Holo", "Shiny"];

const knownCracks = new Set([
  "argentina|lionel messi",
  "brazil|vinicius junior",
  "united states|christian pulisic",
  "egypt|mohamed salah",
  "france|kylian mbappe",
  "england|harry kane",
  "norway|erling haaland",
  "portugal|cristiano ronaldo",
  "spain|lamine yamal",
  "uruguay|federico valverde"
]);

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function stripHtml(text) {
  return decodeEntities(text)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "\n")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "\n")
    .replace(/<!--[\s\S]*?-->/g, "\n")
    .replace(/<\/?(?:address|article|aside|blockquote|br|dd|div|dl|dt|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "\n");
}

function codePattern() {
  return "(?:[A-Z]{2,4}\\d{1,3}|00)";
}

function codeLineRegex() {
  return new RegExp(`^(${codePattern()})\\s+(.+)$`);
}

function needLineRegex(code) {
  return new RegExp(`^${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+Need\\s+(${rarityMarkers.join("|")})$`, "i");
}

function nextUsefulLine(lines, startIndex, stopCode) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.match(codeLineRegex())?.[1] === stopCode) continue;
    if (line.match(codeLineRegex())) return "";
    return line;
  }

  return "";
}

function titleWithoutTeam(title, team) {
  const suffix = new RegExp(`\\s+-\\s+${team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  return title.replace(/^#+\s*/, "").replace(suffix, "").trim();
}

function textFromHtml(html) {
  return stripHtml(html).replace(/\s+/g, " ").trim();
}

function firstClassText(html, className) {
  const match = html.match(new RegExp(`<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, "i"));
  return match ? textFromHtml(match[1]) : "";
}

function parseArticleCard(html) {
  const code = firstClassText(html, "sticker-code");
  if (!code) return null;

  const team = firstClassText(html, "sticker-team");
  const detail = firstClassText(html, "sticker-player") || firstClassText(html, "sticker-category");
  const title = textFromHtml(html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "");
  const muted = textFromHtml(html.match(/<p[^>]+class=["'][^"']*muted[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");
  const badges = [...html.matchAll(/<span[^>]+class=["'][^"']*badge[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)].map((match) =>
    textFromHtml(match[1])
  );
  const needIndex = badges.findIndex((badge) => normalize(badge) === "need");
  const rarity = needIndex >= 0 ? badges[needIndex + 1] ?? "" : "";
  const metaParts = muted.split("·").map((part) => part.trim()).filter(Boolean);
  const category = metaParts[1] || (firstClassText(html, "sticker-category") ? detail : "Player");
  const name = metaParts[2] || titleWithoutTeam(title, team) || detail || category;
  const numberMatch = code.match(/(\d+)$/);

  if (!team || !category || !name || !rarity) return null;

  return {
    id: code.toLowerCase(),
    code,
    team,
    group: "",
    number: numberMatch ? Number(numberMatch[1]) : 0,
    category,
    rarity,
    name,
    isCrack: knownCracks.has(`${normalize(team)}|${normalize(name)}`),
    imageUrl: "",
    sourceUrl: SOURCE_URL
  };
}

function parseStickerBlock(lines, index) {
  const codeMatch = lines[index].match(codeLineRegex());
  if (!codeMatch) return null;

  const [, code, summary] = codeMatch;
  const needMatch = lines[index + 1]?.match(needLineRegex(code));
  if (!needMatch) return null;

  const rarity = needMatch[1];
  const title = nextUsefulLine(lines, index + 2, code);
  const meta = nextUsefulLine(lines, index + 3, code);
  const metaParts = meta.split("·").map((part) => part.trim()).filter(Boolean);
  const numberMatch = code.match(/(\d+)$/);

  let team = "";
  let category = "";
  let name = "";

  if (metaParts.length >= 2) {
    [team, category] = metaParts;
    name = metaParts[2] ?? titleWithoutTeam(title, team);
  } else {
    const summaryParts = summary.split(/\s+/);
    team = summaryParts[0] ?? "";
    category = summaryParts.slice(1).join(" ");
    name = title || category;
  }

  if (!team || !category || !name) return null;

  return {
    id: code.toLowerCase(),
    code,
    team,
    group: "",
    number: numberMatch ? Number(numberMatch[1]) : 0,
    category,
    rarity,
    name,
    isCrack: knownCracks.has(`${normalize(team)}|${normalize(name)}`),
    imageUrl: "",
    sourceUrl: SOURCE_URL
  };
}

function candidateLines(text) {
  return stripHtml(text)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function parseStickerText(text) {
  const stickersByCode = new Map();
  const articleMatches = text.match(/<article\b[\s\S]*?<\/article>/gi) ?? [];

  for (const article of articleMatches) {
    const sticker = parseArticleCard(article);
    if (sticker && !stickersByCode.has(sticker.code)) {
      stickersByCode.set(sticker.code, sticker);
    }
  }

  if (stickersByCode.size > 0) {
    return [...stickersByCode.values()].sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
  }

  const lines = candidateLines(text);

  for (let index = 0; index < lines.length; index += 1) {
    const sticker = parseStickerBlock(lines, index);
    if (sticker && !stickersByCode.has(sticker.code)) {
      stickersByCode.set(sticker.code, sticker);
    }
  }

  return [...stickersByCode.values()].sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
}

export async function extractFromSource(fetchImpl = fetch) {
  const response = await fetchImpl(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status} ${response.statusText ?? ""}`.trim());
  }

  const html = await response.text();
  const stickers = parseStickerText(html);

  if (stickers.length === 0) {
    const sample = stripHtml(html)
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 30)
      .join("\n");
    throw new Error(`No stickers parsed from ${SOURCE_URL}. Parser saw:\n${sample}`);
  }

  return stickers;
}

async function main() {
  const stickers = await extractFromSource();
  await writeFile(stickersPath, `${JSON.stringify(stickers, null, 2)}\n`, "utf8");
  console.log(`Extracted ${stickers.length} stickers to ${path.relative(root, stickersPath)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
