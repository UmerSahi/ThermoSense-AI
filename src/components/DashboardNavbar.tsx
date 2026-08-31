import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Check,
  ChevronDown,
  MapPin,
  Menu,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { LocationMeta } from "../types";
import { cn } from "../lib/cn";
import type { DashboardStatus } from "../hooks/useDashboardData";

const NAV_LINKS = [
  { href: "#dashboard", label: "Dashboard" },
  { href: "#insights", label: "Insights" },
  { href: "#forecast", label: "Forecast" },
  { href: "#about", label: "About" },
];

interface LocationSelectProps {
  locations: LocationMeta[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function LocationSelect({ locations, selectedId, onSelect }: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    locations.findIndex((l) => l.id === selectedId),
  );

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const openList = () => {
    setOpen(true);
    setActive(selectedIndex);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setActive((a) => Math.min(a + 1, locations.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) {
        onSelect(locations[active].id);
        setOpen(false);
      } else {
        openList();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="location-listbox"
        aria-haspopup="listbox"
        aria-activedescendant={open ? `loc-option-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm font-medium shadow-sm transition hover:border-primary/40"
      >
        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="max-w-[7.5rem] truncate">{locations[selectedIndex]?.name ?? "Select"}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          id="location-listbox"
          aria-label="Choose a location"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-popover"
        >
          {locations.map((loc, i) => {
            const isSelected = loc.id === selectedId;
            return (
              <li
                key={loc.id}
                role="option"
                id={`loc-option-${i}`}
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onSelect(loc.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  i === active ? "bg-primary/10 text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {loc.name}
                </span>
                {isSelected ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

interface Props {
  locations: LocationMeta[];
  selectedId: string;
  onSelect: (id: string) => void;
  simulateOutage: boolean;
  onToggleOutage: () => void;
  status: DashboardStatus;
}

export function DashboardNavbar({
  locations,
  selectedId,
  onSelect,
  simulateOutage,
  onToggleOutage,
  status,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="ThermoSense AI home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-base font-bold tracking-tight">
            ThermoSense<span className="text-primary"> AI</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleOutage}
            aria-pressed={simulateOutage}
            aria-label={simulateOutage ? "Simulated outage is on. Turn it off." : "Simulate a sensor outage"}
            title="Simulate a sensor outage"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition",
              simulateOutage
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {simulateOutage ? (
              <WifiOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Wifi className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <LocationSelect locations={locations} selectedId={selectedId} onSelect={onSelect} />

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden" aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
      ) : null}

      {status === "loading" ? (
        <div className="h-0.5 w-full bg-muted">
          <div className="h-0.5 w-1/3 animate-pulse-soft bg-primary" />
        </div>
      ) : null}
    </header>
  );
}
