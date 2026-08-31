# ThermoSense AI — AI Temperature Intelligence Dashboard

> Turn raw temperature and humidity sensor readings into heat-risk scores, anomaly alerts and 7-day forecasts — with plain-English insights you can actually act on.

**ThermoSense AI** is a modern, responsive analytics dashboard that ingests simulated temperature-sensor data from US states, derives a heat-risk score, detects anomalies, and presents everything with AI-style plain-language analysis, recommendations and forecasts.

![ThermoSense AI dashboard — full page](public/screenshots/dashboard.png)

---

## ✨ Features

- **Live sensor overview** — current temperature, "feels like", humidity and condition for the selected state, with a live-updating trend sparkline.
- **Heat-risk scoring** — a 0–100 risk score mapped to Low / Moderate / High / Extreme via an animated gauge and color-coded badges.
- **24-hour trend chart** — today's readings plotted against the historical average, with the anomaly window highlighted.
- **Anomaly detection** — automatically flags unexpected afternoon temperature spikes against the typical curve.
- **AI-style analysis** — a "What the data says" panel that turns the raw numbers into natural-language insight, plus one-click "Analyze" that re-runs the intelligence pipeline.
- **Actionable recommendations** — concrete advice generated from current conditions (hydrate, avoid peak sun hours, check on vulnerable people…).
- **7-day forecast** — daily max/min and conditions with weather icons.
- **Location comparison** — the selected state side-by-side with the two hottest others, highlighting the hottest right now.
- **Ask ThermoSense** — natural-language Q&A over the snapshot (try questions about the readings).
- **Insights** — key takeaway, trend, risk outlook and forecast outlook at a glance.
- **Resilient states** — skeleton loading while data streams in, and a friendly error + retry screen when the (simulated) sensor network is unreachable.

![ThermoSense AI — hero / live reading](public/screenshots/hero.png)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite 7](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with a custom `@theme` design system |
| Charts | [Recharts](https://recharts.org/) (area / gauge visualisations) |
| Icons | [Lucide](https://lucide.dev/) |
| Data layer | Deterministic, simulated sensor service (`src/services/temperatureService.ts`) |
| Fonts | Fira Code (headings) + Fira Sans (body) |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview
```

### Environment variables

None are required — the dashboard runs entirely on simulated local data out of the box.

---

## 🗂 Project Structure

```
src/
├── App.tsx                          # Page composition, location + outage state
├── main.tsx                         # Entry point
├── index.css                        # Tailwind v4 @theme design tokens
├── types.ts                         # Shared domain types (snapshot, derived, etc.)
├── hooks/
│   └── useDashboardData.ts          # Data fetching + intelligence pipeline
├── services/
│   ├── temperatureService.ts        # Simulated sensor data layer (deterministic)
│   └── intelligence.ts              # Heat risk, anomaly, analysis, recommendations, insights
├── components/
│   ├── DashboardNavbar.tsx          # Location switcher + outage simulator toggle
│   ├── Hero.tsx                     # Live reading hero card
│   ├── TemperatureOverview.tsx      # Key stat cards
│   ├── TemperatureChart.tsx         # 24h trend vs historical chart
│   ├── HeatRiskCard.tsx             # Heat-risk gauge + contributing factors
│   ├── AIAnalysis.tsx               # Natural-language analysis
│   ├── AnomalyDetection.tsx         # Spike detection panel
│   ├── Recommendations.tsx          # Actionable advice list
│   ├── Forecast.tsx                 # 7-day forecast
│   ├── LocationComparison.tsx       # Cross-state comparison
│   ├── AskAI.tsx                    # Natural-language Q&A
│   ├── Insights.tsx                 # Key takeaway / outlook
│   ├── About.tsx                    # How it works
│   ├── ErrorState.tsx               # Friendly error + retry
│   └── ui/                          # Card, RiskBadge, Gauge, Skeleton primitives
```

---

## 🔌 Data Layer & Architecture

The app follows a clean **data → intelligence → presentation** flow:

1. **Ingest** — `temperatureService.getSnapshot()` returns a `RawSnapshot` for the selected location. Data is fully **deterministic** (same location → same readings every time), generated from a realistic diurnal temperature curve plus an injected afternoon spike for anomaly-demo purposes. A short simulated latency exercises the loading/error states for real.
2. **Derive** — `useDashboardData` feeds the snapshot through `intelligence.ts` to produce heat risk, anomaly flags, analysis text, recommendations, insights and the location comparison.
3. **Present** — each section renders from the derived data with skeletons, transitions and empty/error states.

**Swapping in live sensors** is a drop-in change: replace `temperatureService` with a call to a Supabase Edge Function (or any API) as long as it returns the same `RawSnapshot` shape.

### Locations

Monitored states: **Arizona, Texas, Nevada, Florida, California** (United States).

### Simulated outage

The navbar includes an **outage simulator** toggle that makes the data layer throw, letting you demo the error + retry UX.

---

## 📸 Screenshots

Screenshots are committed as **base64 text** under `public/screenshots/*.b64` (the platform's file tooling only writes text, so binaries can't be committed directly). A small Vite plugin (`b64ScreenshotPlugin` in `vite.config.ts`) decodes them back into real `.png` files on every `npm run dev` / `npm run build`, so the images above always resolve.

To **regenerate** them (e.g. after UI changes):

```bash
npm install          # includes playwright (dev-only, --no-save)
npm run dev &        # start the dev server on :5173
node shot.mjs        # captures dashboard.png + hero.png -> public/screenshots/*.b64
```

The capture script uses the system-installed headless Chromium (`/usr/bin/chromium`).

---

## 🎨 Design System

The UI is built on a light, environmental-tech design system defined in `docs/design-system/MASTER.md` and realised as Tailwind v4 tokens in `src/index.css`:

- Light background, soft neutral surfaces, subtle gradients, rounded cards, restrained blue + orange accents.
- Fira Code headings / Fira Sans body.
- Heat-risk levels map to green → amber → orange → red (`heat-*` tokens).
- Accessibility: visible focus states, `cursor-pointer` on interactive elements, 150–300ms transitions, `prefers-reduced-motion` respected, responsive at 375 / 768 / 1024 / 1440 px.

---

## 📄 License

Demo build — sensor data is simulated. Built with [NativelyAI](https://nativelyai.com).
