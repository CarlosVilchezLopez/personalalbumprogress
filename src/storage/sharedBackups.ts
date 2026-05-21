export type SharedBackupSummary = {
  id: string;
  createdAt: string;
};

export type SharedBackupService = {
  save: (backup: string) => Promise<SharedBackupSummary>;
  list: () => Promise<SharedBackupSummary[]>;
  load: (id: string) => Promise<string>;
};

const DEV_BACKUP_ERROR = "Los respaldos compartidos solo estan disponibles con npm run dev.";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(DEV_BACKUP_ERROR);
  }

  return (await response.json()) as T;
}

export async function saveSharedBackup(backup: string): Promise<SharedBackupSummary> {
  const response = await fetch("/api/backups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ backup })
  });

  return readJson<SharedBackupSummary>(response);
}

export async function listSharedBackups(): Promise<SharedBackupSummary[]> {
  const response = await fetch("/api/backups");
  const data = await readJson<{ backups: SharedBackupSummary[] }>(response);

  return data.backups;
}

export async function loadSharedBackup(id: string): Promise<string> {
  const response = await fetch(`/api/backups/${encodeURIComponent(id)}`);
  const data = await readJson<{ backup: string }>(response);

  return data.backup;
}

export const sharedBackupService: SharedBackupService = {
  save: saveSharedBackup,
  list: listSharedBackups,
  load: loadSharedBackup
};
