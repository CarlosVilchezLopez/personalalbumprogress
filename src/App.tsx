import { useMemo, useState } from "react";
import stickersData from "./data/stickers.json";
import { datasetMeta } from "./data/datasetMeta";
import { getTeamProgress } from "./domain/progress";
import type { CollectionState, Sticker } from "./domain/types";
import { clearCollection, clearImage, exportCollection, importCollection, loadCollection, setDuplicates, setImage, toggleOwned } from "./storage/collectionStorage";
import { AjustesPage } from "./pages/AjustesPage";
import { AlbumPage } from "./pages/AlbumPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FaltantesPage } from "./pages/FaltantesPage";
import { RepetidasPage } from "./pages/RepetidasPage";
import { TeamPage } from "./pages/TeamPage";

type Page = "dashboard" | "album" | "team" | "repetidas" | "faltantes" | "ajustes";

const stickers = stickersData as Sticker[];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedTeam, setSelectedTeam] = useState(stickers[0]?.team ?? "");
  const [collection, setCollection] = useState<CollectionState>(() => loadCollection());
  const teams = useMemo(() => getTeamProgress(stickers, collection), [collection]);

  function handleToggleOwned(code: string, owned: boolean) {
    setCollection(toggleOwned(code, owned));
  }

  function handleSetDuplicates(code: string, duplicates: number) {
    setCollection(setDuplicates(code, duplicates));
  }

  function handleSetImage(code: string, image: string) {
    try {
      setCollection(setImage(code, image));
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Error desconocido";
      alert(`No se pudo guardar la imagen: ${reason}. Probablemente excediste el cuota de localStorage.`);
    }
  }

  function handleClearImage(code: string) {
    setCollection(clearImage(code));
  }

  function openTeam(team: string) {
    setSelectedTeam(team);
    setPage("team");
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span>Album personal</span>
          <h1>Panini Mundial 2026</h1>
        </div>
        <nav>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("album")}>Album</button>
          <button onClick={() => setPage("repetidas")}>Repetidas</button>
          <button onClick={() => setPage("faltantes")}>Faltantes</button>
          <button onClick={() => setPage("ajustes")}>Ajustes</button>
        </nav>
      </header>

      {page === "dashboard" ? <DashboardPage stickers={stickers} collection={collection} teams={teams} onSelectTeam={openTeam} /> : null}
      {page === "album" ? <AlbumPage stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} onSetImage={handleSetImage} onClearImage={handleClearImage} /> : null}
      {page === "team" ? <TeamPage team={selectedTeam} stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} onSetImage={handleSetImage} onClearImage={handleClearImage} /> : null}
      {page === "repetidas" ? <RepetidasPage stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} onSetImage={handleSetImage} onClearImage={handleClearImage} /> : null}
      {page === "faltantes" ? <FaltantesPage stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} onSetImage={handleSetImage} onClearImage={handleClearImage} /> : null}
      {page === "ajustes" ? (
        <AjustesPage
          onExport={() => exportCollection(datasetMeta.version)}
          onImport={(json) => setCollection(importCollection(json))}
          onReset={() => {
            clearCollection();
            setCollection({});
          }}
        />
      ) : null}
    </main>
  );
}
