import type { KeyboardEvent } from "react";
import type { TeamProgress } from "../domain/types";
import { ProgressBar } from "./ProgressBar";

type TeamProgressTableProps = {
  teams: TeamProgress[];
  onSelectTeam: (team: string) => void;
};

function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, team: string, onSelectTeam: (team: string) => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelectTeam(team);
  }
}

export function TeamProgressTable({ teams, onSelectTeam }: TeamProgressTableProps) {
  return (
    <table className="team-table">
      <thead>
        <tr>
          <th>Equipo</th>
          <th>Album</th>
          <th>Cracks</th>
          <th>Repetidas</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr
            key={team.team}
            onClick={() => onSelectTeam(team.team)}
            onKeyDown={(event) => handleRowKeyDown(event, team.team, onSelectTeam)}
            tabIndex={0}
          >
            <td>{team.team}</td>
            <td>
              <ProgressBar value={team.completionPercent} label={`Avance de ${team.team}`} />
            </td>
            <td>
              {team.cracksOwned}/{team.cracksTotal}
            </td>
            <td>{team.duplicates}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
