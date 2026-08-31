import { Flame } from "lucide-react";
import type { CurrentConditions, HeatRiskResult } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { Gauge } from "./ui/Gauge";
import { RISK_COLOR } from "./ui/RiskBadge";
import { cn } from "../lib/cn";

interface Props {
  heatRisk: HeatRiskResult;
  current: CurrentConditions;
}

const FACTOR_TONE: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
};

export function HeatRiskCard({ heatRisk, current }: Props) {
  const color = RISK_COLOR[heatRisk.level];

  return (
    <Card className="p-6">
      <CardHeader
        eyebrow="Heat risk index"
        title="How dangerous is the heat?"
        description="A 0–100 score blending temperature, humidity and real-feel for the selected location."
        icon={<Flame className="h-5 w-5" aria-hidden="true" />}
      />
      <div className="mt-6 grid items-center gap-8 sm:grid-cols-2">
        <div className="flex flex-col items-center">
          <Gauge value={heatRisk.score} color={color} label={`Heat risk ${heatRisk.level}`} />
          <p className="mt-1 font-heading text-sm font-semibold uppercase tracking-wider" style={{ color }}>
            {heatRisk.level} risk
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Contributing factors
          </h3>
          <ul className="mt-3 space-y-2.5">
            {heatRisk.factors.length ? (
              heatRisk.factors.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground">{f.label}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", FACTOR_TONE[f.level])}>
                    {f.level}
                  </span>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                No significant aggravating factors right now.
              </li>
            )}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {current.temperature}°C at {current.humidity}% humidity with a real-feel of{" "}
            {Math.round(current.feelsLike)}°C feeds this score.
          </p>
        </div>
      </div>
    </Card>
  );
}
