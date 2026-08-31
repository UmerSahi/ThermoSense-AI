import { Activity, ArrowUpRight, Cpu, Database, Layers, Zap } from "lucide-react";

const STACK = [
  { icon: <Layers className="h-4 w-4" aria-hidden="true" />, label: "React + TypeScript" },
  { icon: <Zap className="h-4 w-4" aria-hidden="true" />, label: "Tailwind CSS v4" },
  { icon: <Cpu className="h-4 w-4" aria-hidden="true" />, label: "Recharts" },
  { icon: <Database className="h-4 w-4" aria-hidden="true" />, label: "Deterministic mock data" },
];

const STEPS = [
  {
    title: "Ingest",
    body: "Temperature, humidity and feels-like readings arrive from a live sensor stream every few minutes.",
  },
  {
    title: "Analyze",
    body: "The intelligence layer derives heat-risk scores, flags anomalies vs the baseline and builds forecasts.",
  },
  {
    title: "Act",
    body: "Plain-English insights and tailored recommendations tell you what to do — and when.",
  },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            About the project
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">
            Turning heat data into decisions
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            ThermoSense AI is a temperature-intelligence dashboard built as a hackathon demo. It shows how
            raw environmental data can be turned into heat-risk indices, anomaly alerts and actionable
            advice — the kind of system cities, farms and event organisers could use to keep people safe in
            extreme heat.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Sensor data is simulated and fully deterministic — every location returns the same readings on
            every visit, so the demo behaves predictably. Swapping in a live data source is a drop-in
            change.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {STACK.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {s.icon}
                {s.label}
              </span>
            ))}
          </div>

          <a
            href="#dashboard"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 ease-out hover:bg-primary/90 active:scale-[0.97]"
          >
            Back to the dashboard
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
