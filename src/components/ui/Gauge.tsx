interface GaugeProps {
  value: number; // 0–100
  color: string;
  label: string;
}

/** Semicircular gauge used to visualise the 0–100 heat-risk score. */
export function Gauge({ value, color, label }: GaugeProps) {
  const radius = 78;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const arc = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  return (
    <div className="relative w-full max-w-[230px]">
      <svg viewBox="0 0 200 114" className="w-full" role="img" aria-label={`${label}: ${value} out of 100`}>
        <path d={arc} fill="none" stroke="var(--color-muted)" strokeWidth={14} strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 700ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center gap-1">
        <span className="font-heading text-4xl font-bold tracking-tight" style={{ color }}>
          {value}
        </span>
        <span className="text-sm font-medium text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
