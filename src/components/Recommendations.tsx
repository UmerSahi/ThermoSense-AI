import { Clock, Droplets, Home, Lightbulb, ShieldCheck, Sun, Umbrella } from "lucide-react";
import type { Recommendation, RecommendationIcon } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { cn } from "../lib/cn";

const ICONS: Record<RecommendationIcon, typeof Droplets> = {
  water: Droplets,
  clock: Clock,
  shield: ShieldCheck,
  sun: Sun,
  home: Home,
  umbrella: Umbrella,
};

const PRIORITY_STYLE: Record<Recommendation["priority"], string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

interface Props {
  recommendations: Recommendation[];
}

export function Recommendations({ recommendations }: Props) {
  return (
    <Card className="p-6">
      <CardHeader
        eyebrow="Recommendations"
        title="What you should do"
        description="Tailored, actionable advice generated from the current conditions."
        icon={<Lightbulb className="h-5 w-5" aria-hidden="true" />}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {recommendations.map((r) => {
          const Icon = ICONS[r.icon];
          return (
            <div
              key={r.id}
              className="flex gap-4 rounded-2xl border border-border bg-background p-4 transition-shadow duration-200 hover:shadow-popover"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      PRIORITY_STYLE[r.priority],
                    )}
                  >
                    {r.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
