import { CalendarDays, Flame, Lightbulb, TrendingUp } from "lucide-react";
import type { EnvironmentalInsights } from "../types";
import { Card } from "./ui/Card";

interface Props {
  insights: EnvironmentalInsights;
}

export function Insights({ insights }: Props) {
  const cards = [
    {
      icon: <Lightbulb className="h-5 w-5" aria-hidden="true" />,
      label: "Key insight",
      text: insights.key,
      tone: "bg-primary/10 text-primary",
    },
    {
      icon: <TrendingUp className="h-5 w-5" aria-hidden="true" />,
      label: "Trend",
      text: insights.trend,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      icon: <Flame className="h-5 w-5" aria-hidden="true" />,
      label: "Risk outlook",
      text: insights.risk,
      tone: "bg-orange-100 text-orange-700",
    },
    {
      icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
      label: "Forecast outlook",
      text: insights.forecast,
      tone: "bg-violet-100 text-violet-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((c) => (
        <Card key={c.label} className="p-5">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tone}`}>{c.icon}</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {c.label}
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{c.text}</p>
        </Card>
      ))}
    </div>
  );
}
