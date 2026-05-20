import { useState } from "react";
import { datasetMeta } from "../data/datasetMeta";

type AjustesPageProps = {
  onExport: () => string;
  onImport: (json: string) => void;
  onReset: () => void;
};

export function AjustesPage({ onExport, onImport, onReset }: AjustesPageProps) {
  const [backup, setBackup] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="settings-panel">
      <p>Dataset: {datasetMeta.version}</p>
      <button type="button" onClick={() => setBackup(onExport())}>Generar respaldo</button>
      <textarea value={backup} onChange={(event) => setBackup(event.target.value)} rows={10} />
      <button
        type="button"
        onClick={() => {
          try {
            onImport(backup);
            setMessage("Respaldo importado.");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "No se pudo importar el respaldo.");
          }
        }}
      >
        Importar respaldo
      </button>
      <button type="button" onClick={onReset}>Reiniciar progreso</button>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
