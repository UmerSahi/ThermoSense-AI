import { useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import { useDashboardData } from "./hooks/useDashboardData";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { Hero } from "./components/Hero";
import { TemperatureOverview } from "./components/TemperatureOverview";
import { TemperatureChart } from "./components/TemperatureChart";
import { HeatRiskCard } from "./components/HeatRiskCard";
import { AIAnalysis } from "./components/AIAnalysis";
import { AnomalyDetection } from "./components/AnomalyDetection";
import { Recommendations } from "./components/Recommendations";
import { Forecast } from "./components/Forecast";
import { LocationComparison } from "./components/LocationComparison";
import { AskAI } from "./components/AskAI";
import { Insights } from "./components/Insights";
import { About } from "./components/About";
import { ErrorState } from "./components/ErrorState";
import { Card, CardHeader } from "./components/ui/Card";
import { DashboardSkeleton } from "./components/ui/Skeleton";

const DEFAULT_LOCATION = "arizona";

export default function App() {
  const [locationId, setLocationId] = useState(DEFAULT_LOCATION);
  const [simulateOutage, setSimulateOutage] = useState(false);
  const [analyzeRequest, setAnalyzeRequest] = useState(0);

  const dash = useDashboardData(locationId, simulateOutage);
  const ready = dash.status === "ready" && dash.snapshot && dash.derived;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNavbar
        locations={dash.locations}
        selectedId={locationId}
        onSelect={setLocationId}
        simulateOutage={simulateOutage}
        onToggleOutage={() => setSimulateOutage((v) => !v)}
        status={dash.status}
      />

      <main>
        <Hero
          status={dash.status}
          location={dash.snapshot?.location ?? null}
          current={dash.snapshot?.current ?? null}
          heatRisk={dash.derived?.heatRisk ?? null}
          series={dash.snapshot?.currentSeries ?? null}
          onAnalyze={() => setAnalyzeRequest((r) => r + 1)}
        />

        {dash.status === "loading" ? <DashboardSkeleton /> : null}

        {dash.status === "error" ? (
          <ErrorState
            onRetry={dash.retry}
            simulateOutage={simulateOutage}
            onTurnOffOutage={() => setSimulateOutage(false)}
          />
        ) : null}

        {ready ? (
          <>
            <section id="overview" className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
              <TemperatureOverview current={dash.snapshot!.current} heatRisk={dash.derived!.heatRisk} />
            </section>

            <section id="trend" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
              <Card className="p-6">
                <CardHeader
                  eyebrow="24h trend"
                  title="Temperature trend"
                  description="Today's readings versus the historical average for the same hours."
                  icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
                />
                <div className="mt-6">
                  <TemperatureChart
                    currentSeries={dash.snapshot!.currentSeries}
                    historicalSeries={dash.snapshot!.historicalSeries}
                    anomaly={dash.derived!.anomaly}
                    location={dash.snapshot!.location}
                  />
                </div>
              </Card>
            </section>

            <section
              id="heat-risk"
              className="mx-auto grid max-w-7xl items-start gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-2"
            >
              <HeatRiskCard heatRisk={dash.derived!.heatRisk} current={dash.snapshot!.current} />
              <AIAnalysis
                location={dash.snapshot!.location}
                analysis={dash.derived!.analysis}
                request={analyzeRequest}
              />
            </section>

            <section
              id="anomaly"
              className="mx-auto grid max-w-7xl items-start gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-2"
            >
              <AnomalyDetection
                anomaly={dash.derived!.anomaly}
                currentSeries={dash.snapshot!.currentSeries}
                historicalSeries={dash.snapshot!.historicalSeries}
              />
              <Recommendations recommendations={dash.derived!.recommendations} />
            </section>

            <section id="forecast" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
              <Forecast forecast={dash.snapshot!.forecast} locationName={dash.snapshot!.location.name} />
            </section>

            <section
              id="comparison"
              className="mx-auto grid max-w-7xl items-start gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-2"
            >
              <LocationComparison
                comparison={dash.derived!.comparison}
                selectedId={locationId}
                hottest={dash.derived!.hottest}
              />
              <AskAI snapshot={dash.snapshot!} derived={dash.derived!} ready />
            </section>

            <section id="insights" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
              <Insights insights={dash.derived!.insights} />
            </section>

            <About />
          </>
        ) : null}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight">
              ThermoSense<span className="text-primary"> AI</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Temperature intelligence, built with NativelyAI.</p>
          <p className="text-xs text-muted-foreground">Demo build — sensor data is simulated.</p>
        </div>
      </footer>
    </div>
  );
}
