import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { AnomalyResult, HourlyPoint } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { cn } from "../lib/cn";

interface Props {
  anomaly: AnomalyResult;
  currentSeries: HourlyPoint[];
  historicalSeries: HourlyPoint[];
}

function MiniSpikeChart({ anomaly, currentSeries, historicalSeries }: Props) {
  const baselineByHour = new Map(historicalSeries.map((p) => [p.hour, p.temperature]));
  const data = currentSeries
    .filter((p) => p.hour >= 10 && p.hour <= 18)
    .map((p) => ({
      time: p.time,
      current: p.temperature,
      baseline: baselineByHour.get(p.hour) ?? p.temperature,
    }));

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -22 }}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={40}
            unit="°"
          />
          <ReferenceLine
            x={anomaly.time}
            stroke="var(--color-heat-high)"
            strokeDasharray="4 4"
            label={{ value: "Spike", position: "insideTopRight", fontSize: 10, fill: "var(--color-heat-high)" }}
          />
          <Line type="monotone" dataKey="current" name="Current" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="baseline"
            name="Baseline"
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AnomalyDetection({ anomaly, currentSeries, historicalSeries }: Props) {
  const detected = anomaly.detected;

  return (
    <Card className="p-6">
      <CardHeader
        eyebrow="Anomaly detection"
        title="Unexpected spikes"
        description="Every hourly reading is compared against the historical baseline for the same time of day."
        icon={
          detected ? (
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          )
        }
      />

      <div className="mt-6">
        {detected ? (
          <div
            className={cn(
              "rounded-2xl border p-5",
              anomaly.severity === "High" ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/60",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
                Anomaly detected at {anomaly.time}
              </p>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  anomaly.severity === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
                )}
              >
                {anomaly.severity} severity
              </span>
            </div>
            <p className="mt-3 font-heading text-3xl font-bold text-foreground">
              +{anomaly.deviation.toFixed(1)}°C
              <span className="ml-2 text-sm font-normal text-muted-foreground">vs baseline</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{anomaly.explanation}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              No anomalies in the last 24h
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every reading tracked the historical baseline closely. Nothing unusual — you can trust today's
              numbers.
            </p>
          </div>
        )}

        {detected ? (
          <div className="mt-5">
            <MiniSpikeChart anomaly={anomaly} currentSeries={currentSeries} historicalSeries={historicalSeries} />
            <p className="mt-2 text-xs text-muted-foreground">
              Zoomed view, 10:00–18:00 — the spike stands out clearly against the historical curve.
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
