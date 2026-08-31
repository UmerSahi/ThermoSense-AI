import { useEffect, useRef, useState } from "react";
import { Brain, Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { AIAnalysisResult, LocationMeta } from "../types";
import { Card, CardHeader } from "./ui/Card";
import { SIGNAL_STYLES } from "../services/intelligence";
import { cn } from "../lib/cn";

interface Props {
  location: LocationMeta;
  analysis: AIAnalysisResult;
  /** Increment to trigger a fresh analysis run. */
  request: number;
}

const STEPS = [
  "Reading live sensor stream…",
  "Comparing to the 24h historical baseline…",
  "Computing heat-risk index…",
  "Cross-checking anomaly signals…",
  "Generating plain-English insights…",
];

type Phase = "idle" | "analyzing" | "done";

export function AIAnalysis({ location, analysis, request }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const prevRequest = useRef<number | null>(null);

  const run = (scroll: boolean) => {
    setPhase("analyzing");
    setStepIndex(0);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 1;
      if (i >= STEPS.length) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setStepIndex(STEPS.length - 1);
        window.setTimeout(() => {
          setPhase("done");
          if (scroll) {
            sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 420);
      } else {
        setStepIndex(i);
      }
    }, 430);
  };

  useEffect(() => {
    if (request <= 0) return;
    const isUserClick = prevRequest.current !== null && request !== prevRequest.current;
    prevRequest.current = request;
    run(isUserClick);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <Card className="p-6" ref={sectionRef}>
      <CardHeader
        eyebrow="AI analysis"
        title="What the data says"
        description={`Generated from live and historical data for ${location.name}.`}
        icon={<Brain className="h-5 w-5" aria-hidden="true" />}
      />

      <div className="mt-6">
        {phase === "idle" ? (
          <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-heading text-base font-bold text-foreground">
              Run the AI analysis
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              I'll read the sensor feed for {location.name}, compare it to the historical baseline and
              summarise what's happening in plain English.
            </p>
            <button
              type="button"
              onClick={() => run(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 ease-out hover:bg-primary/90 active:scale-[0.97]"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Run AI analysis
            </button>
          </div>
        ) : null}

        {phase === "analyzing" ? (
          <div className="rounded-2xl border border-border bg-background p-6" role="status" aria-live="polite">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
              Analyzing {location.name}…
            </p>
            <ul className="mt-4 space-y-3">
              {STEPS.map((step, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li key={step} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        done && "border-emerald-500 bg-emerald-500 text-white",
                        active && "border-primary bg-primary/10 text-primary",
                        !done && !active && "border-border text-transparent",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                      {active ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
                    </span>
                    <span
                      className={cn(
                        done ? "text-muted-foreground" : "text-foreground",
                        active && "font-medium",
                      )}
                    >
                      {step}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="animate-fade-up space-y-5">
            <p className="rounded-2xl border border-border bg-background p-5 text-sm leading-relaxed text-foreground">
              {analysis.summary}
            </p>

            <div className="flex flex-wrap gap-2">
              {analysis.signals.map((signal) => (
                <span
                  key={signal.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    SIGNAL_STYLES[signal.kind],
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {signal.label}
                </span>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Model confidence</span>
                <span className="font-heading font-bold text-foreground">{analysis.confidence}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-sky-500 transition-all duration-700 ease-out"
                  style={{ width: `${analysis.confidence}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => run(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40"
            >
              <RefreshCw className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Re-run analysis
            </button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
