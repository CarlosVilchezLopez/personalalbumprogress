import { StatTile } from "../components/StatTile";
import { TeamProgressTable } from "../components/TeamProgressTable";
import type { CollectionState, Sticker, TeamProgress as TeamProgressType } from "../domain/types";
import { getOverallProgress } from "../domain/progress";

type DashboardPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  teams: TeamProgressType[];
  onSelectTeam: (team: string) => void;
};

export function DashboardPage({ stickers, collection, teams, onSelectTeam }: DashboardPageProps) {
  const progress = getOverallProgress(stickers, collection);

  return (
    <section className="page-stack">
      <div className="stats-grid">
        <StatTile label="Avance" value={`${progress.completionPercent}%`} detail={`${progress.owned}/${progress.total} stickers`} />
        <StatTile label="Faltantes" value={progress.missing} />
        <StatTile label="Repetidas" value={progress.duplicates} />
        <StatTile label="Cracks" value={`${progress.cracksOwned}/${progress.cracksTotal}`} detail={`${progress.cracksCompletionPercent}%`} />
      </div>
      <TeamProgressTable teams={teams} onSelectTeam={onSelectTeam} />
    </section>
  );
}
