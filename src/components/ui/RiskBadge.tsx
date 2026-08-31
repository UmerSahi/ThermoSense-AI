import type { HeatRiskLevel } from "../../types";
import { cn } from "../../lib/cn";

const RISK_BADGE: Record<HeatRiskLevel, { badge: string; dot: string }> = {
  Low: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Moderate: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  High: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  Extreme: { badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export const RISK_COLOR: Record<HeatRiskLevel, string> = {
  Low: "var(--color-heat-low)",
  Moderate: "var(--color-heat-moderate)",
  High: "var(--color-heat-high)",
  Extreme: "var(--color-heat-extreme)",
};

export function RiskBadge({ level, className }: { level: HeatRiskLevel; className?: string }) {
  const s = RISK_BADGE[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        s.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />
      {level}
    </span>
  );
}
