import { forwardRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card({ className, children }, ref) {
  return (
    <section ref={ref} className={cn("rounded-2xl border border-border bg-surface shadow-card", className)}>
      {children}
    </section>
  );
});

export function CardHeader({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5">
      {icon ? (
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
