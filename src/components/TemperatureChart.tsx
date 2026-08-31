import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { AnomalyResult, HourlyPoint, LocationMeta } from "../types";

interface Props {
  currentSeries: HourlyPoint[];
  historicalSeries: HourlyPoint[];
  anomaly: AnomalyResult;
  location: LocationMeta;
}

interface Row {
  time: string;
  current: number;
  baseline: number;
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-popover">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="mt-0.5" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}°C
        </p>
      ))}
    </div>
  );
}

export function TemperatureChart({ currentSeries, historicalSeries, anomaly, location }: Props) {
  const baselineByHour = new Map(historicalSeries.map((p) => [p.hour, p.temperature]));
  const data: Row[] = currentSeries.map((p) => ({
    time: p.time,
    current: p.temperature,
    baseline: baselineByHour.get(p.hour) ?? p.temperature,
  }));

  const peakPoint = currentSeries.find((p) => p.hour === anomaly.hour && anomaly.detected);
  const peakTemp = peakPoint?.temperature ?? 0;

  return (
    <div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: -14 }}>
            <defs>
              <linearGradient id={`currentFill-${location.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 2", "dataMax + 2"]}
              unit="°"
              width={44}
            />
            <Tooltip content={ChartTooltip} />
            <Area
              type="monotone"
              dataKey="current"
              name="Current"
              stroke="none"
              fill={`url(#currentFill-${location.id})`}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="Current"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Historical avg"
              stroke="var(--color-muted-foreground)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
            {anomaly.detected ? (
              <>
                <ReferenceLine
                  x={anomaly.time}
                  stroke="var(--color-heat-high)"
                  strokeDasharray="4 4"
                  label={{ value: "Anomaly", position: "insideTopRight", fontSize: 11, fill: "var(--color-heat-high)" }}
                />
                <ReferenceDot
                  x={anomaly.time}
                  y={peakTemp}
                  r={6}
                  fill="var(--color-heat-high)"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </>
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-primary" aria-hidden="true" />
          Current (today)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-muted-foreground opacity-70" aria-hidden="true" />
          Historical average
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-heat-high" aria-hidden="true" />
          Anomaly point
        </span>
      </div>
    </div>
  );
}
