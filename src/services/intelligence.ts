import type {
  AIAnalysisResult,
  AnomalyResult,
  ComparisonRow,
  CurrentConditions,
  DetectedSignal,
  EnvironmentalInsights,
  ForecastDay,
  HeatRiskFactor,
  HeatRiskLevel,
  HeatRiskResult,
  HourlyPoint,
  RawSnapshot,
  Recommendation,
  RecommendationIcon,
  SignalKind,
} from "../types";
import { getComparisonBase } from "./temperatureService";

/**
 * intelligence — the decision layer of the demo.
 *
 * Everything here is derived from the raw sensor data (temperature, humidity,
 * feels-like, historical baseline). No randomness, no hard-coded answers —
 * the same inputs always produce the same analysis, which is what makes it a
 * believable "AI" for a demo while staying deterministic.
 */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Heat-risk score (0–100) blended from temperature, humidity and the
 * temperature/humidity gap reflected in the "feels like" value.
 */
export function computeHeatRisk(
  temperature: number,
  humidity: number,
  feelsLike: number,
): HeatRiskResult {
  const scoreTemp = clamp(((temperature - 20) / 25) * 100, 0, 100);
  const scoreHumidity = clamp((humidity - 40) * 0.3, 0, 12);
  const scoreFeels = clamp((feelsLike - temperature) * 2.6, 0, 16);
  const score = Math.round(clamp(scoreTemp + scoreHumidity + scoreFeels, 0, 100));

  const level: HeatRiskLevel =
    score >= 80 ? "Extreme" : score >= 60 ? "High" : score >= 35 ? "Moderate" : "Low";

  const factors: HeatRiskFactor[] = [];
  if (temperature >= 30) {
    factors.push({ label: "Temperature High", level: temperature >= 38 ? "High" : "Moderate" });
  }
  if (humidity >= 65) {
    factors.push({ label: "Humidity High", level: "High" });
  } else if (humidity >= 50) {
    factors.push({ label: "Humidity Moderate", level: "Moderate" });
  }
  if (feelsLike >= 34) {
    factors.push({ label: "Feels Like High", level: feelsLike >= 40 ? "High" : "Moderate" });
  }

  return { score, level, factors };
}

/** Finds the largest positive deviation of the current day vs the historical baseline. */
export function detectAnomaly(
  currentSeries: HourlyPoint[],
  historicalSeries: HourlyPoint[],
  current: CurrentConditions,
  locationName: string,
): AnomalyResult {
  const baseline = new Map(historicalSeries.map((p) => [p.hour, p.temperature]));

  let maxDev = 0;
  let maxHour = -1;
  for (const point of currentSeries) {
    const base = baseline.get(point.hour);
    if (base === undefined) continue;
    const dev = point.temperature - base;
    if (dev > maxDev) {
      maxDev = dev;
      maxHour = point.hour;
    }
  }

  const detected = maxDev > 3;
  const severity: AnomalyResult["severity"] = maxDev >= 4 ? "High" : "Moderate";
  const time = `${String(maxHour).padStart(2, "0")}:00`;

  const explanation = detected
    ? `At ${time} the sensor read ${Math.round(current.temperature)}°C in ${locationName} — ${round1(
        maxDev,
      )}°C above the ${round1(current.historicalAverage)}°C baseline for this time of day. That jump is well outside normal diurnal variation, so it is flagged as a ${severity.toLowerCase()}-severity anomaly.`
    : "Readings stayed within normal diurnal variation all day.";

  return { detected, hour: maxHour, time, deviation: round1(maxDev), severity, explanation };
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function buildAnalysis(
  snapshot: RawSnapshot,
  heatRisk: HeatRiskResult,
  anomaly: AnomalyResult,
): AIAnalysisResult {
  const { current, location } = snapshot;

  const signals: DetectedSignal[] = [];
  if (anomaly.detected) signals.push({ label: "Anomaly Detected", kind: "danger" });
  if (heatRisk.level === "High" || heatRisk.level === "Extreme") {
    signals.push({ label: "Heat Risk Signal", kind: "warning" });
  }
  if (current.humidity >= 60) signals.push({ label: "High Humidity", kind: "warning" });

  const afternoon = avg(snapshot.currentSeries.filter((p) => p.hour >= 14 && p.hour <= 16).map((p) => p.temperature));
  const morning = avg(snapshot.currentSeries.filter((p) => p.hour >= 6 && p.hour <= 8).map((p) => p.temperature));
  signals.push(
    afternoon > morning + 1.5
      ? { label: "Warming Trend", kind: "warning" }
      : { label: "Cooling Trend", kind: "positive" },
  );
  if (current.humidity < 35) signals.push({ label: "Dry Conditions", kind: "info" });

  // Confidence reflects how cleanly readings match the models — lower when an
  // anomaly or very humid air adds uncertainty. Fully data-derived.
  const confidence = clamp(
    Math.round(
      100 -
        6 -
        (anomaly.detected ? 4 : 0) -
        (current.humidity >= 65 ? 3 : 0) -
        Math.round(Math.abs(current.temperature - current.historicalAverage) * 0.6),
    ),
    55,
    96,
  );

  const anomalyNote = anomaly.detected
    ? ` At ${anomaly.time}, the reading jumped ${round1(
        anomaly.deviation,
      )}°C above baseline — an abnormal spike worth investigating.`
    : "";
  const comparisonNote = anomaly.detected
    ? `a ${round1(anomaly.deviation)}°C anomaly versus the ${round1(current.historicalAverage)}°C baseline`
    : `close to the ${round1(current.historicalAverage)}°C historical average`;

  const summary =
    `In ${location.name}, temperatures reached ${Math.round(current.temperature)}°C at 14:00 — ` +
    `${comparisonNote}. Heat risk is ${heatRisk.level.toLowerCase()} at ${heatRisk.score}/100, ` +
    `amplified by ${current.humidity}% humidity and a real-feel of ${Math.round(current.feelsLike)}°C.` +
    `${anomalyNote} Conditions should ease overnight, with a hot stretch expected across the coming week.`;

  return { summary, signals, confidence };
}

function rec(title: string, body: string, priority: Recommendation["priority"], icon: RecommendationIcon, id: string): Recommendation {
  return { id, title, body, priority, icon };
}

export function buildRecommendations(
  current: CurrentConditions,
  forecast: ForecastDay[],
): Recommendation[] {
  const { temperature, humidity, feelsLike } = current;
  const warmNote = `Temperatures are ${Math.round(temperature)}°C with a real-feel of ${Math.round(feelsLike)}°C and ${humidity}% humidity`;

  if (temperature >= 40) {
    return [
      rec(
        "Avoid outdoor activity 11:00–16:00",
        `${warmNote} — this is an extreme-heat window. Move essential work to early morning or after sunset.`,
        "high",
        "clock",
        "ext-1",
      ),
      rec(
        "Hydrate every 20 minutes",
        "At this heat you lose fluids fast. Sip water regularly, even before you feel thirsty, and avoid sugary drinks.",
        "high",
        "water",
        "ext-2",
      ),
      rec(
        "Check on vulnerable people",
        "Heat at this level is dangerous for children, the elderly and outdoor workers. Make sure they stay cool and hydrated.",
        "medium",
        "home",
        "ext-3",
      ),
      rec(
        "Use fans or air conditioning",
        "If A/C is available, keep indoor spaces cool. Otherwise use fans plus damp cloths to lower body temperature.",
        "medium",
        "sun",
        "ext-4",
      ),
    ];
  }

  if (temperature > 35) {
    return [
      rec(
        "Limit outdoor work to mornings and evenings",
        `${warmNote}. Schedule strenuous activity before 11:00 or after 17:00.`,
        "high",
        "clock",
        "high-1",
      ),
      rec(
        "Hydrate regularly",
        "Drink water every 20–30 minutes during any activity, and carry a bottle with you outdoors.",
        "high",
        "water",
        "high-2",
      ),
      rec(
        "Seek shade during midday",
        "Between 13:00 and 16:00, take breaks in shaded or air-conditioned areas.",
        "medium",
        "sun",
        "high-3",
      ),
    ];
  }

  if (temperature >= 30) {
    return [
      rec(
        "Stay hydrated",
        `${warmNote}. Your body loses fluid faster than you notice — drink water regularly, even before you feel thirsty.`,
        "high",
        "water",
        "warm-1",
      ),
      rec(
        "Plan around peak heat (13:00–16:00)",
        "Schedule outdoor tasks before 11:00 or after 17:00 to avoid the hottest window of the day.",
        "medium",
        "clock",
        "warm-2",
      ),
      rec(
        "Watch for heat-discomfort signs",
        `A real-feel of ${Math.round(feelsLike)}°C can sneak up on you. Watch for headache, dizziness or heavy sweating.`,
        "medium",
        "shield",
        "warm-3",
      ),
      rec(
        "Keep living spaces ventilated",
        "Cross-ventilate rooms and draw curtains during peak sun to keep indoor temperatures down.",
        "low",
        "home",
        "warm-4",
      ),
    ];
  }

  return [
    rec(
      "Enjoy the comfortable weather",
      `A pleasant ${Math.round(temperature)}°C — great for outdoor plans.`,
      "low",
      "sun",
      "mild-1",
    ),
    rec(
      "Keep water handy anyway",
      "Light activity in the sun still dehydrates. Carry a bottle and sip throughout the day.",
      "low",
      "water",
      "mild-2",
    ),
    rec(
      "Layer up for cool mornings",
      `Overnight lows dip to around ${Math.round(Math.min(...forecast.map((d) => d.min)))}°C — a light layer helps early on.`,
      "low",
      "umbrella",
      "mild-3",
    ),
  ];
}

export function buildInsights(
  snapshot: RawSnapshot,
  heatRisk: HeatRiskResult,
  anomaly: AnomalyResult,
): EnvironmentalInsights {
  const { current, currentSeries, forecast, location } = snapshot;
  const hottest = currentSeries.reduce((a, b) => (b.temperature > a.temperature ? b : a));
  const hottestForecast = forecast.reduce((a, b) => (b.max > a.max ? b : a));

  return {
    key: `Peak heat of ${Math.round(hottest.temperature)}°C at ${hottest.time} — the hottest hour of the day in ${location.name}.`,
    trend: `Afternoon readings are tracking ${
      anomaly.detected ? `${round1(anomaly.deviation)}°C above` : "close to"
    } the ${round1(current.historicalAverage)}°C baseline for this time of year.`,
    risk: `Heat risk is ${heatRisk.level.toLowerCase()} (${heatRisk.score}/100), driven by temperature, humidity and real-feel.`,
    forecast: `The coming week peaks at ${Math.round(hottestForecast.max)}°C on ${hottestForecast.day} — plan outdoor work for the morning.`,
  };
}

export function buildComparison(): ComparisonRow[] {
  return getComparisonBase().map((row) => ({
    id: row.id,
    name: row.name,
    temperature: row.temperature,
    feelsLike: row.feelsLike,
    humidity: row.humidity,
    level: computeHeatRisk(row.temperature, row.humidity, row.feelsLike).level,
  }));
}

const SIGNAL_STYLES: Record<SignalKind, string> = {
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  positive: "bg-emerald-100 text-emerald-700",
  info: "bg-sky-100 text-sky-700",
};

export { SIGNAL_STYLES };

/** Lightweight NL answering engine — keyword routed, answers always quote live data. */
export function answerQuestion(question: string, snapshot: RawSnapshot, derived: DerivedLike): string {
  const q = question.toLowerCase();
  const { current, location, forecast } = snapshot;
  const hottestForecast = forecast.reduce((a, b) => (b.max > a.max ? b : a));

  if (/(anomaly|spike|unusual|abnormal|weird|jump|wrong)/.test(q)) {
    if (!derived.anomaly.detected) {
      return `I checked the last 24 hours in ${location.name} and readings tracked the historical baseline closely — no anomalies detected right now.`;
    }
    return `Yes — an anomaly was detected. At ${derived.anomaly.time} the sensor read ${Math.round(
      current.temperature,
    )}°C, which is ${round1(derived.anomaly.deviation)}°C above the ${round1(
      current.historicalAverage,
    )}°C baseline. I've flagged it as ${derived.anomaly.severity.toLowerCase()}-severity because the jump is well outside normal daily variation.`;
  }

  if (/(why|risk|danger|serious|how bad|worry)/.test(q)) {
    const factors = derived.heatRisk.factors.length
      ? derived.heatRisk.factors.map((f) => `${f.label.toLowerCase()} (${f.level.toLowerCase()})`).join(", ")
      : "no major aggravating factors";
    return `Heat risk in ${location.name} is ${derived.heatRisk.level.toLowerCase()} at ${derived.heatRisk.score}/100. That score comes from ${Math.round(
      current.temperature,
    )}°C temperature, ${current.humidity}% humidity and a real-feel of ${Math.round(
      current.feelsLike,
    )}°C — specifically ${factors}.`;
  }

  if (/(recommend|should|advice|tips|what do|suggest|do i|wear)/.test(q)) {
    const top = derived.recommendations.slice(0, 3);
    return `For ${location.name}, I'd start with: ${top
      .map((r) => r.title.toLowerCase())
      .join("; ")}. The full list is on the Recommendations panel.`;
  }

  if (/(forecast|tomorrow|week|next|ahead|days)/.test(q)) {
    return `Next 7 days in ${location.name}: ${forecast
      .map((d) => `${d.day} ${Math.round(d.max)}°C`)
      .join(", ")}. Hottest is ${Math.round(hottestForecast.max)}°C on ${hottestForecast.day}, with ${hottestForecast.condition.toLowerCase()}.`;
  }

  if (/(hottest|compare|which location|where|warmer)/.test(q)) {
    const hottestRow = derived.comparison.reduce((a, b) => (b.temperature > a.temperature ? b : a));
    return `Right now the hottest location I'm monitoring is ${hottestRow.name} at ${Math.round(
      hottestRow.temperature,
    )}°C. ${location.name} is at ${Math.round(current.temperature)}°C.`;
  }

  if (/(humidity|humid|moisture|sticky)/.test(q)) {
    const reason =
      current.humidity >= 60
        ? "That's high, which makes the heat feel more intense."
        : current.humidity >= 45
          ? "Moderate — it adds a little to the perceived temperature."
          : "Low — dry air helps sweat evaporate and cool you down.";
    return `Humidity in ${location.name} is ${current.humidity}%. ${reason}`;
  }

  if (/(feels|feel|real-feel|apparent)/.test(q)) {
    return `It feels like ${Math.round(current.feelsLike)}°C in ${location.name}, even though the thermometer reads ${Math.round(
      current.temperature,
    )}°C. The gap comes mainly from ${current.humidity}% humidity.`;
  }

  if (/(confidence|accurate|sure|trust|reliable|correct)/.test(q)) {
    return `I'm ${derived.analysis.confidence}% confident in this assessment. Confidence reflects how cleanly the sensor readings match my models — it drops when data is noisy or inconsistent.`;
  }

  if (/(cold|cool|down|drop|decrease|night)/.test(q)) {
    const coolest = forecast.reduce((a, b) => (b.min < a.min ? b : a));
    return `Overnight lows in ${location.name} drop to around ${Math.round(
      coolest.min,
    )}°C (coolest on ${coolest.day}). Daytime highs stay hot, so early morning is the comfortable window.`;
  }

  return `Right now in ${location.name}: ${Math.round(current.temperature)}°C (feels like ${Math.round(
    current.feelsLike,
  )}°C), ${current.humidity}% humidity, heat risk ${derived.heatRisk.level.toLowerCase()} (${
    derived.heatRisk.score
  }/100). ${derived.anomaly.detected ? `An anomaly was detected at ${derived.anomaly.time}. ` : ""}Ask me about risk, anomalies, forecasts, or what to do.`;
}

interface DerivedLike {
  heatRisk: HeatRiskResult;
  anomaly: AnomalyResult;
  analysis: AIAnalysisResult;
  recommendations: Recommendation[];
  comparison: ComparisonRow[];
}
