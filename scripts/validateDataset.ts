import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { cracks } from "../src/data/cracks";
import { validateDataset } from "../src/domain/datasetValidation";
import type { Sticker } from "../src/domain/types";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const stickersPath = path.join(root, "src", "data", "stickers.json");

const stickers = JSON.parse(await readFile(stickersPath, "utf8")) as Sticker[];
const report = validateDataset(stickers, cracks);

console.log(JSON.stringify(report, null, 2));

if (report.total === 0 || report.duplicateCodes.length > 0) {
  process.exitCode = 1;
}
