import { useEffect, useMemo, useState } from "react";
import type { DerivedData, RawSnapshot } from "../types";
import { getSnapshot, listLocations } from "../services/temperatureService";
import {
  buildAnalysis,
  buildComparison,
  buildInsights,
  buildRecommendations,
  computeHeatRisk,
  detectAnomaly,
} from "../services/intelligence";

export type DashboardStatus = "loading" | "ready" | "error";

export interface DashboardState {
  status: DashboardStatus;
  snapshot: RawSnapshot | null;
  derived: DerivedData | null;
  locations: ReturnType<typeof listLocations>;
  retry: () => void;
}

/**
 * Loads the raw snapshot for the selected location and derives all of the
 * intelligence-layer results (heat risk, anomaly, analysis, recommendations,
 * insights, comparison) from it. Returns `derived === null` until ready, so
 * consumers can render skeletons.
 */
export function useDashboardData(locationId: string, simulateOutage: boolean): DashboardState {
  const [snapshot, setSnapshot] = useState<RawSnapshot | null>(null);
  const [status, setStatus] = useState<DashboardStatus>("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setSnapshot(null);

    getSnapshot(locationId, simulateOutage)
      .then((next) => {
        if (cancelled) return;
        setSnapshot(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [locationId, simulateOutage, retryKey]);

  const derived = useMemo<DerivedData | null>(() => {
    if (!snapshot) return null;
    const { current, currentSeries, historicalSeries, location } = snapshot;

    const heatRisk = computeHeatRisk(current.temperature, current.humidity, current.feelsLike);
    const anomaly = detectAnomaly(currentSeries, historicalSeries, current, location.name);
    const analysis = buildAnalysis(snapshot, heatRisk, anomaly);
    const recommendations = buildRecommendations(current, snapshot.forecast);
    const insights = buildInsights(snapshot, heatRisk, anomaly);
    const comparison = buildComparison();
    const hottest = comparison.reduce((a, b) => (b.temperature > a.temperature ? b : a)).name;

    return { heatRisk, anomaly, analysis, recommendations, insights, comparison, hottest };
  }, [snapshot]);

  return {
    status,
    snapshot,
    derived,
    locations: listLocations(),
    retry: () => setRetryKey((k) => k + 1),
  };
}
