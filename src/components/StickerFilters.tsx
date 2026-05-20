export type StickerFilterState = {
  query: string;
  team: string;
  status: "all" | "owned" | "missing" | "duplicates" | "cracks";
};

type StickerFiltersProps = {
  filters: StickerFilterState;
  teams: string[];
  onChange: (filters: StickerFilterState) => void;
};

const statuses: Array<{ value: StickerFilterState["status"]; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "owned", label: "Tengo" },
  { value: "missing", label: "Faltantes" },
  { value: "duplicates", label: "Repetidas" },
  { value: "cracks", label: "Cracks" }
];

export function StickerFilters({ filters, teams, onChange }: StickerFiltersProps) {
  return (
    <form className="filters">
      <input
        aria-label="Buscar sticker"
        placeholder="Buscar por codigo, jugador o equipo"
        value={filters.query}
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
      />
      <select
        aria-label="Filtrar por equipo"
        value={filters.team}
        onChange={(event) => onChange({ ...filters, team: event.target.value })}
      >
        <option value="">Todos los equipos</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
      <select
        aria-label="Filtrar por estado"
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value as StickerFilterState["status"] })}
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </form>
  );
}
