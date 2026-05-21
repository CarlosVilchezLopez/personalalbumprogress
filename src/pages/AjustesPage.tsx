import { useState } from "react";
import { datasetMeta } from "../data/datasetMeta";
import { sharedBackupService, type SharedBackupService, type SharedBackupSummary } from "../storage/sharedBackups";

type AjustesPageProps = {
  onExport: () => string;
  onImport: (json: string) => void;
  onReset: () => void;
  sharedBackups?: SharedBackupService;
};

export function AjustesPage({ onExport, onImport, onReset, sharedBackups = sharedBackupService }: AjustesPageProps) {
  const [backup, setBackup] = useState("");
  const [message, setMessage] = useState("");
  const [savedBackups, setSavedBackups] = useState<SharedBackupSummary[]>([]);

  async function handleGenerateBackup() {
    if (!window.confirm("Esto generara y guardara un respaldo compartido. Deseas continuar?")) return;

    try {
      const exportedBackup = onExport();
      setBackup(exportedBackup);
      const saved = await sharedBackups.save(exportedBackup);
      setMessage(`Respaldo guardado: ${saved.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el respaldo.");
    }
  }

  function handleImportBackup() {
    if (!window.confirm("Esto reemplazara el progreso actual con el respaldo pegado. Deseas continuar?")) return;

    try {
      onImport(backup);
      setMessage("Respaldo importado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo importar el respaldo.");
    }
  }

  async function handleListBackups() {
    try {
      const backups = await sharedBackups.list();
      setSavedBackups(backups);
      setMessage(backups.length > 0 ? "Respaldos encontrados." : "No hay respaldos guardados.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar los respaldos.");
    }
  }

  async function handleLoadBackup(id: string) {
    if (!window.confirm(`Esto reemplazara el progreso actual con ${id}. Deseas continuar?`)) return;

    try {
      const loadedBackup = await sharedBackups.load(id);
      setBackup(loadedBackup);
      onImport(loadedBackup);
      setMessage(`Respaldo cargado: ${id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el respaldo.");
    }
  }

  function handleReset() {
    if (!window.confirm("Esto borrara el progreso de este navegador. Deseas continuar?")) return;
    onReset();
    setMessage("Progreso reiniciado.");
  }

  return (
    <section className="settings-panel">
      <p>Dataset: {datasetMeta.version}</p>
      <button type="button" onClick={handleGenerateBackup}>Generar respaldo</button>
      <textarea value={backup} onChange={(event) => setBackup(event.target.value)} rows={10} />
      <button type="button" onClick={handleImportBackup}>Importar respaldo</button>
      <button type="button" onClick={handleListBackups}>Cargar respaldo</button>
      {savedBackups.length > 0 ? (
        <ul className="backup-list">
          {savedBackups.map((savedBackup) => (
            <li key={savedBackup.id}>
              <span>{new Date(savedBackup.createdAt).toLocaleString()}</span>
              <button type="button" onClick={() => void handleLoadBackup(savedBackup.id)}>
                Cargar {savedBackup.id}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <button type="button" onClick={handleReset}>Reiniciar progreso</button>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
