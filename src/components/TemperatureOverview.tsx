import { Droplets, Flame, Thermometer, Wind } from "lucide-react";
import type { CurrentConditions, HeatRiskResult } from "../types";
import { Card } from "./ui/Card";
import { RiskBadge } from "./ui/RiskBadge";

interface Props {
  current: CurrentConditions;
  heatRisk: HeatRiskResult;
}

export function TemperatureOverview({ current, heatRisk }: Props) {
  const stats = [
    {
      icon: <Thermometer className="h-5 w-5" aria-hidden="true" />,
      label: "Temperature",
      value: `${Math.round(current.temperature)}°C`,
      sub: `Historical avg ${current.historicalAverage}°C`,
      tone: "text-primary",
    },
    {
      icon: <Droplets className="h-5 w-5" aria-hidden="true" />,
      label: "Humidity",
      value: `${current.humidity}%`,
      sub: current.humidity >= 60 ? "High humidity" : current.humidity >= 45 ? "Moderate" : "Dry air",
      tone: "text-sky-600",
    },
    {
      icon: <Wind className="h-5 w-5" aria-hidden="true" />,
      label: "Feels like",
      value: `${Math.round(current.feelsLike)}°C`,
      sub: `Thermometer reads ${Math.round(current.temperature)}°C`,
      tone: "text-violet-600",
    },
    {
      icon: <Flame className="h-5 w-5" aria-hidden="true" />,
      label: "Heat risk",
      value: `${heatRisk.score}/100`,
      sub: <RiskBadge level={heatRisk.level} />,
      tone: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-5 transition-shadow duration-200 hover:shadow-popover">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className={s.tone}>{s.icon}</span>
            <span className="text-sm font-medium">{s.label}</span>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
          <div className="mt-2 text-xs text-muted-foreground">{s.sub}</div>
        </Card>
      ))}
    </div>
  );
}
