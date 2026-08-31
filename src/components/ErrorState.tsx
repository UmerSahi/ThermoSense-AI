import { RefreshCw, WifiOff } from "lucide-react";

interface Props {
  onRetry: () => void;
  simulateOutage: boolean;
  onTurnOffOutage: () => void;
}

export function ErrorState({ onRetry, simulateOutage, onTurnOffOutage }: Props) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <WifiOff className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-heading text-2xl font-bold text-foreground">
        We couldn't reach the sensor network
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The temperature data didn't come through this time — this can happen when a sensor node goes
        offline. Nothing is wrong with your data; let's just try again.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 ease-out hover:bg-primary/90 active:scale-[0.97]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        {simulateOutage ? (
          <button
            type="button"
            onClick={onTurnOffOutage}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40"
          >
            <WifiOff className="h-4 w-4 text-destructive" aria-hidden="true" />
            Turn off simulated outage
          </button>
        ) : null}
      </div>
      {simulateOutage ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Hint: the sensor-outage simulator in the navbar is currently on.
        </p>
      ) : null}
    </div>
  );
}
