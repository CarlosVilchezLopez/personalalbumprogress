import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cracks } from "../src/data/cracks";
import { linkCracks } from "../src/domain/datasetValidation";
import type { Sticker } from "../src/domain/types";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const stickersPath = path.join(root, "src", "data", "stickers.json");

const stickers = JSON.parse(await readFile(stickersPath, "utf8")) as Sticker[];
const linked = linkCracks(stickers, cracks);

const linkedCount = linked.filter((sticker) => sticker.isCrack).length;
const unlinkedCracks = cracks.filter(
  (crack) => !linked.some((sticker) => sticker.isCrack && (
    (crack.code && sticker.code === crack.code) || sticker.name === crack.name
  ))
);

await writeFile(stickersPath, `${JSON.stringify(linked, null, 2)}\n`, "utf8");
console.log(`Linked ${linkedCount} stickers as cracks (defined: ${cracks.length}).`);
if (unlinkedCracks.length) {
  console.log(`Unlinked crack definitions (${unlinkedCracks.length}):`);
  unlinkedCracks.forEach((crack) => console.log(" ", crack.team, "-", crack.name, crack.code ?? ""));
}
