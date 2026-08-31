import type {
  CurrentConditions,
  ForecastDay,
  ForecastIcon,
  HourlyPoint,
  LocationMeta,
  RawSnapshot,
} from "../types";

/**
 * temperatureService — the data layer of the demo.
 *
 * It pretends to be a temperature-sensor ingestion service. Data is fully
 * deterministic (same location => same readings every time), generated from a
 * realistic diurnal temperature curve plus an injected afternoon spike for
 * anomaly-detection demos. Each call simulates a short network latency so the
 * UI's loading and error states are exercised for real.
 *
 * Swapping this module for a live API (e.g. a Supabase Edge Function reading
 * real sensors) is a drop-in replacement as long as the returned shape stays
 * a `RawSnapshot`.
 */

export interface LocationConfig extends LocationMeta {
  /** Daily mean of the smooth diurnal curve, in °C. */
  mean: number;
  /** Half the diurnal swing, in °C. */
  amp: number;
  humidity: number;
  feelsOffset: number;
  condition: string;
  /** Typical afternoon value used as the anomaly baseline. */
  historicalAverage: number;
  /** Hour of the injected spike, or -1 for none. */
  spikeHour: number;
  /** How many °C the spike adds, or 0 for none. */
  spikeAmount: number;
  updatedMinutesAgo: number;
  /** 7 x [max, min, condition, icon]. */
  forecast: Array<[number, number, string, ForecastIcon]>;
}

export const LOCATIONS: LocationConfig[] = [
  {
    id: "faisalabad",
    name: "Faisalabad",
    country: "Pakistan",
    mean: 25,
    amp: 5,
    humidity: 58,
    feelsOffset: 4,
    condition: "Hot",
    historicalAverage: 30,
    spikeHour: 14,
    spikeAmount: 4.2,
    updatedMinutesAgo: 2,
    forecast: [
      [35, 24, "Sunny", "sun"],
      [37, 26, "Sunny", "sun"],
      [36, 25, "Partly Cloudy", "partly"],
      [34, 24, "Hazy", "haze"],
      [33, 23, "Cloudy", "cloud"],
      [35, 25, "Thunderstorm", "storm"],
      [37, 26, "Sunny", "sun"],
    ],
  },
  {
    id: "lahore",
    name: "Lahore",
    country: "Pakistan",
    mean: 27,
    amp: 4,
    humidity: 62,
    feelsOffset: 3,
    condition: "Hot",
    historicalAverage: 31,
    spikeHour: 14,
    spikeAmount: 2,
    updatedMinutesAgo: 7,
    forecast: [
      [34, 25, "Sunny", "sun"],
      [33, 24, "Partly Cloudy", "partly"],
      [32, 23, "Light Rain", "rain"],
      [34, 25, "Partly Cloudy", "partly"],
      [35, 26, "Sunny", "sun"],
      [36, 27, "Sunny", "sun"],
      [34, 25, "Cloudy", "cloud"],
    ],
  },
  {
    id: "islamabad",
    name: "Islamabad",
    country: "Pakistan",
    mean: 22,
    amp: 5,
    humidity: 45,
    feelsOffset: 1,
    condition: "Pleasant",
    historicalAverage: 27,
    spikeHour: -1,
    spikeAmount: 0,
    updatedMinutesAgo: 4,
    forecast: [
      [28, 19, "Sunny", "sun"],
      [29, 20, "Sunny", "sun"],
      [27, 18, "Partly Cloudy", "partly"],
      [26, 17, "Light Rain", "rain"],
      [25, 17, "Thunderstorm", "storm"],
      [27, 18, "Partly Cloudy", "partly"],
      [28, 19, "Sunny", "sun"],
    ],
  },
  {
    id: "karachi",
    name: "Karachi",
    country: "Pakistan",
    mean: 28,
    amp: 4,
    humidity: 70,
    feelsOffset: 4,
    condition: "Humid",
    historicalAverage: 32,
    spikeHour: -1,
    spikeAmount: 0,
    updatedMinutesAgo: 11,
    forecast: [
      [33, 27, "Hazy", "haze"],
      [32, 26, "Hazy", "haze"],
      [31, 26, "Partly Cloudy", "partly"],
      [32, 27, "Sunny", "sun"],
      [33, 27, "Hazy", "haze"],
      [32, 26, "Cloudy", "cloud"],
      [31, 25, "Partly Cloudy", "partly"],
    ],
  },
  {
    id: "multan",
    name: "Multan",
    country: "Pakistan",
    mean: 29,
    amp: 7,
    humidity: 50,
    feelsOffset: 2,
    condition: "Very Hot",
    historicalAverage: 36,
    spikeHour: 14,
    spikeAmount: 3.5,
    updatedMinutesAgo: 3,
    forecast: [
      [41, 28, "Sunny", "sun"],
      [42, 29, "Sunny", "sun"],
      [41, 28, "Partly Cloudy", "partly"],
      [40, 27, "Hazy", "haze"],
      [39, 26, "Cloudy", "cloud"],
      [41, 28, "Sunny", "sun"],
      [43, 30, "Sunny", "sun"],
    ],
  },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Smooth diurnal curve: coolest ~02:00, warmest ~14:00. */
function curveTemp(hour: number, mean: number, amp: number): number {
  const wave = Math.cos(((hour - 14) / 24) * 2 * Math.PI);
  return round1(mean + amp * wave);
}

function buildHourlySeries(cfg: LocationConfig, includeSpike: boolean): HourlyPoint[] {
  const points: HourlyPoint[] = [];
  for (let hour = 0; hour < 24; hour++) {
    let t = curveTemp(hour, cfg.mean, cfg.amp);
    if (includeSpike && cfg.spikeHour === hour && cfg.spikeAmount) {
      t = round1(t + cfg.spikeAmount);
    }
    points.push({ hour, time: `${String(hour).padStart(2, "0")}:00`, temperature: t });
  }
  return points;
}

function resolveCurrentTemp(cfg: LocationConfig): number {
  const hour = cfg.spikeHour >= 0 ? cfg.spikeHour : 14;
  let t = curveTemp(hour, cfg.mean, cfg.amp);
  if (cfg.spikeHour === hour && cfg.spikeAmount) t = round1(t + cfg.spikeAmount);
  return Math.round(t);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nextSevenDays(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now.getTime() + i * 86_400_000);
    out.push(DAY_NAMES[d.getDay()]);
  }
  return out;
}

function buildForecast(cfg: LocationConfig): ForecastDay[] {
  const days = nextSevenDays();
  return cfg.forecast.map(([max, min, condition, icon], i) => ({
    day: days[i],
    max,
    min,
    condition,
    icon,
  }));
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function listLocations(): LocationMeta[] {
  return LOCATIONS.map(({ id, name, country }) => ({ id, name, country }));
}

export function getComparisonBase(): Array<{
  id: string;
  name: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
}> {
  return LOCATIONS.map((cfg) => ({
    id: cfg.id,
    name: cfg.name,
    temperature: resolveCurrentTemp(cfg),
    feelsLike: Math.round(resolveCurrentTemp(cfg) + cfg.feelsOffset),
    humidity: cfg.humidity,
  }));
}

/**
 * Fetches the full dataset for a location. Throws if `simulateOutage` is set,
 * which lets the demo exercise the error + retry path.
 */
export async function getSnapshot(
  locationId: string,
  simulateOutage = false,
): Promise<RawSnapshot> {
  await delay(480 + Math.random() * 260);

  if (simulateOutage) {
    throw new Error("Temperature sensor network is unreachable right now.");
  }

  const cfg = LOCATIONS.find((c) => c.id === locationId);
  if (!cfg) throw new Error(`Unknown location: ${locationId}`);

  const currentSeries = buildHourlySeries(cfg, true);
  const historicalSeries = buildHourlySeries(cfg, false);
  const temperature = resolveCurrentTemp(cfg);

  const current: CurrentConditions = {
    temperature,
    feelsLike: Math.round(temperature + cfg.feelsOffset),
    humidity: cfg.humidity,
    condition: cfg.condition,
    historicalAverage: cfg.historicalAverage,
    updatedMinutesAgo: cfg.updatedMinutesAgo,
  };

  return {
    location: { id: cfg.id, name: cfg.name, country: cfg.country },
    current,
    currentSeries,
    historicalSeries,
    forecast: buildForecast(cfg),
  };
}
