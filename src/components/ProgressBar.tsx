type ProgressBarProps = {
  value: number;
  label: string;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const width = clampPercent(value);

  return (
    <div className="progress-bar" aria-label={`${label}: ${value}%`}>
      <div className="progress-bar__track" aria-hidden="true">
        <div className="progress-bar__fill" style={{ width: `${width}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  );
}
