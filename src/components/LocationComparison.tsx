import { BarChart3, Flame, MapPin } from "lucide-react";
import type { ComparisonRow } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { RiskBadge } from "./ui/RiskBadge";
import { cn } from "../lib/cn";

interface Props {
  comparison: ComparisonRow[];
  selectedId: string;
  hottest: string;
}

export function LocationComparison({ comparison, selectedId, hottest }: Props) {
  const selected = comparison.find((c) => c.id === selectedId) ?? comparison[0];
  const others = comparison
    .filter((c) => c.id !== selected.id)
    .sort((a, b) => b.temperature - a.temperature)
    .slice(0, 2);
  const rows = [selected, ...others];
  const maxTemp = Math.max(...rows.map((r) => r.temperature));

  return (
    <Card className="p-6">
      <CardHeader
        eyebrow="Location comparison"
        title="How hot is it elsewhere?"
        description={`Live comparison across monitored US states. Hottest right now: ${hottest}.`}
        icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
      />

      <ul className="mt-6 space-y-3">
        {rows.map((row) => {
          const isSelected = row.id === selectedId;
          const isHottest = row.name === hottest;
          const pct = maxTemp > 0 ? (row.temperature / maxTemp) * 100 : 0;
          return (
            <li
              key={row.id}
              className={cn(
                "rounded-2xl border p-4",
                isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-background",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{row.name}</span>
                  {isSelected ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      Selected
                    </span>
                  ) : null}
                  {isHottest ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                      <Flame className="h-3 w-3" aria-hidden="true" /> Hottest
                    </span>
                  ) : null}
                </div>
                <RiskBadge level={row.level} />
              </div>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {row.temperature}°C
                  </span>
                  <span className="text-xs text-muted-foreground">feels like {row.feelsLike}°C</span>
                </div>
                <span className="text-xs text-muted-foreground">{row.humidity}% humidity</span>
              </div>

              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    isHottest ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-primary/50",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        Showing your selected state plus the two hottest others. Switch location in the navbar to compare.
      </p>
    </Card>
  );
}
