import { CalendarDays, Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Sun } from "lucide-react";
import type { ForecastDay, ForecastIcon } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { cn } from "../lib/cn";

const ICONS: Record<ForecastIcon, typeof Sun> = {
  sun: Sun,
  partly: CloudSun,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  haze: CloudFog,
};

interface Props {
  forecast: ForecastDay[];
  locationName: string;
}

export function Forecast({ forecast, locationName }: Props) {
  const hottest = forecast.reduce((a, b) => (b.max > a.max ? b : a));

  return (
    <Card className="p-6">
      <CardHeader
        eyebrow="Forecast"
        title={`7-day forecast · ${locationName}`}
        description="Daily highs, lows and conditions for the week ahead."
        icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="no-scrollbar mt-6 grid grid-flow-col auto-cols-[minmax(7.5rem,1fr)] gap-3 overflow-x-auto pb-1 sm:grid-cols-7 sm:auto-cols-auto sm:overflow-visible">
        {forecast.map((day) => {
          const Icon = ICONS[day.icon];
          const isPeak = day.day === hottest.day;
          return (
            <div
              key={day.day}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl border bg-background px-3 py-4",
                isPeak ? "border-orange-300 bg-orange-50/50" : "border-border",
              )}
            >
              {isPeak ? (
                <span className="absolute -top-2.5 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  Peak
                </span>
              ) : null}
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {day.day}
              </span>
              <Icon
                className={cn("h-7 w-7", day.icon === "sun" ? "text-amber-500" : "text-sky-500")}
                aria-hidden="true"
              />
              <span className="font-heading text-xl font-bold text-foreground">{day.max}°</span>
              <span className="text-xs text-muted-foreground">{day.min}°</span>
              <span className="text-[11px] leading-tight text-muted-foreground">{day.condition}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 rounded-xl bg-background px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Hottest day is <span className="font-semibold text-foreground">{hottest.day}</span> at{" "}
        <span className="font-semibold text-foreground">{hottest.max}°C</span> ({hottest.condition.toLowerCase()}).
        Plan outdoor work for the morning, when it's coolest.
      </p>
    </Card>
  );
}
