import { promises as fs } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { Plugin } from "vite";

export type BackupSummary = {
  id: string;
  createdAt: string;
};

const BACKUP_ID_PATTERN = /^backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/;

function backupId(date: Date): string {
  return `backup-${date.toISOString().slice(0, 19).replace("T", "-").replaceAll(":", "-")}.json`;
}

function createdAtFromId(id: string): string {
  const match = /^backup-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})\.json$/.exec(id);
  if (!match) throw new Error("Respaldo invalido");

  const [, year, month, day, hour, minute, second] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))).toISOString();
}

function assertSafeBackupId(id: string): void {
  if (!BACKUP_ID_PATTERN.test(id)) {
    throw new Error("Respaldo invalido");
  }
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export function createBackupHandlers(backupsDir: string) {
  async function save(backup: string): Promise<BackupSummary> {
    JSON.parse(backup);
    await fs.mkdir(backupsDir, { recursive: true });

    const id = backupId(new Date());
    await fs.writeFile(path.join(backupsDir, id), backup, "utf8");

    return { id, createdAt: createdAtFromId(id) };
  }

  async function list(): Promise<BackupSummary[]> {
    await fs.mkdir(backupsDir, { recursive: true });

    const entries = await fs.readdir(backupsDir);
    return entries
      .filter((entry) => BACKUP_ID_PATTERN.test(entry))
      .map((id) => ({ id, createdAt: createdAtFromId(id) }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async function load(id: string): Promise<string> {
    assertSafeBackupId(id);
    return fs.readFile(path.join(backupsDir, id), "utf8");
  }

  return { save, list, load };
}

export function devBackupPlugin(backupsDir = path.resolve("backups")): Plugin {
  const handlers = createBackupHandlers(backupsDir);

  return {
    name: "panini-dev-backups",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/backups", async (req, res) => {
        try {
          const relativeUrl = req.url ?? "/";
          const requestUrl = new URL(relativeUrl, "http://localhost");

          if (req.method === "GET" && requestUrl.pathname === "/") {
            sendJson(res, 200, { backups: await handlers.list() });
            return;
          }

          if (req.method === "POST" && requestUrl.pathname === "/") {
            const body = JSON.parse(await readRequestBody(req)) as { backup?: unknown };
            if (typeof body.backup !== "string") {
              sendJson(res, 400, { error: "Respaldo invalido" });
              return;
            }

            sendJson(res, 201, await handlers.save(body.backup));
            return;
          }

          if (req.method === "GET") {
            const id = decodeURIComponent(requestUrl.pathname.replace(/^\//, ""));
            sendJson(res, 200, { backup: await handlers.load(id) });
            return;
          }

          sendJson(res, 405, { error: "Metodo no permitido" });
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : "No se pudo procesar el respaldo" });
        }
      });
    }
  };
}
