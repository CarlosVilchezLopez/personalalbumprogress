type StatTileProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <section className="stat-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </section>
  );
}
