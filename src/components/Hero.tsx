import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { CurrentConditions, HeatRiskResult, HourlyPoint, LocationMeta } from "../types";
import type { DashboardStatus } from "../hooks/useDashboardData";
import { RiskBadge } from "./ui/RiskBadge";
import { Skeleton } from "./ui/Skeleton";

interface HeroProps {
  status: DashboardStatus;
  location: LocationMeta | null;
  current: CurrentConditions | null;
  heatRisk: HeatRiskResult | null;
  series: HourlyPoint[] | null;
  onAnalyze: () => void;
}

export function Hero({ status, location, current, heatRisk, series, onAnalyze }: HeroProps) {
  const ready = status === "ready" && location && current && heatRisk;

  return (
    <section id="dashboard" className="bg-hero-glow relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            AI · Temperature intelligence
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Understand the heat.
            <br />
            <span className="text-primary">Before it hits.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            ThermoSense AI turns raw temperature and humidity readings into heat-risk scores,
            anomaly alerts and 7-day forecasts — with plain-English insights you can actually act on.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!ready}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 ease-out hover:bg-primary/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Analyze Temperature
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
            <a
              href="#forecast"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40"
            >
              7-day forecast
              <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live sensor stream · {ready ? `${location!.name}, ${location!.country}` : "Arizona, United States"}
          </p>
        </div>

        {ready ? (
          <div className="animate-fade-up">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Live reading · {location!.name}
                  </p>
                  <p className="mt-3 font-heading text-6xl font-bold tracking-tight">
                    {Math.round(current!.temperature)}
                    <span className="align-top text-3xl">°C</span>
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {current!.condition} · feels like {Math.round(current!.feelsLike)}°C
                  </p>
                </div>
                <RiskBadge level={heatRisk!.level} />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <HeroStat label="Feels like" value={`${Math.round(current!.feelsLike)}°`} />
                <HeroStat label="Humidity" value={`${current!.humidity}%`} />
                <HeroStat label="Heat risk" value={`${heatRisk!.score}/100`} />
              </div>

              <div className="mt-5" aria-hidden="true">
                <div className="h-14 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={series!.map((p) => ({ time: p.time, t: p.temperature }))}
                      margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="t"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        fill="url(#heroSpark)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-1 text-center text-[11px] text-muted-foreground">
                  Today's trend · {series![0].time} → {series![series!.length - 1].time}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Updated {current!.updatedMinutesAgo} min ago
                </span>
                <span className="font-heading">{location!.country}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-5 h-16 w-40" />
            <Skeleton className="mt-4 h-4 w-52" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
            <Skeleton className="mt-6 h-6 w-full" />
          </div>
        )}
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
