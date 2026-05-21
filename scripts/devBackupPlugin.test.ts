import { beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createBackupHandlers } from "./devBackupPlugin";

describe("devBackupPlugin", () => {
  let backupsDir: string;

  beforeEach(async () => {
    backupsDir = await fs.mkdtemp(path.join(os.tmpdir(), "panini-backups-"));
  });

  it("saves, lists, and reads shared backup files", async () => {
    const handlers = createBackupHandlers(backupsDir);

    const saved = await handlers.save("{\"datasetVersion\":\"v1\",\"collection\":{}}");
    const listed = await handlers.list();
    const loaded = await handlers.load(saved.id);

    expect(saved.id).toMatch(/^backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/);
    expect(listed).toEqual([saved]);
    expect(loaded).toBe("{\"datasetVersion\":\"v1\",\"collection\":{}}");
  });

  it("rejects unsafe backup ids", async () => {
    const handlers = createBackupHandlers(backupsDir);

    await expect(handlers.load("../secret.json")).rejects.toThrow("Respaldo invalido");
  });
});
