import { beforeEach, describe, expect, it, vi } from "vitest";
import { listSharedBackups, loadSharedBackup, saveSharedBackup } from "./sharedBackups";

describe("sharedBackups", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("saves a backup through the dev server API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "backup-2026-05-21-15-30-00.json", createdAt: "2026-05-21T15:30:00.000Z" }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const saved = await saveSharedBackup("{\"collection\":{}}");

    expect(fetchMock).toHaveBeenCalledWith("/api/backups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backup: "{\"collection\":{}}" })
    });
    expect(saved.id).toBe("backup-2026-05-21-15-30-00.json");
  });

  it("lists and loads backups from the dev server API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ backups: [{ id: "backup-a.json", createdAt: "2026-05-21T15:30:00.000Z" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ backup: "{\"datasetVersion\":\"v1\",\"collection\":{}}" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(listSharedBackups()).resolves.toEqual([{ id: "backup-a.json", createdAt: "2026-05-21T15:30:00.000Z" }]);
    await expect(loadSharedBackup("backup-a.json")).resolves.toBe("{\"datasetVersion\":\"v1\",\"collection\":{}}");
  });

  it("shows a clear error when the dev server API is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Not found", { status: 404 })));

    await expect(listSharedBackups()).rejects.toThrow("Los respaldos compartidos solo estan disponibles con npm run dev.");
  });
});
