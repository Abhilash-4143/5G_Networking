import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
        align === "center" && "items-center text-center lg:flex-col lg:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="mt-4 font-display text-[clamp(1.75rem,3.6vw,2.8rem)] font-medium leading-[1.08] tracking-[-.045em] text-[var(--text)]">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-[14.5px] leading-7 text-[var(--muted)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function InfoNote({
  children,
  label = "Simulation note",
  className,
  icon,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn("flex gap-3 rounded-xl border border-[var(--line)] bg-white/[.025] px-4 py-3.5", className)}>
      <div className="mt-0.5 text-[var(--cyan)]">{icon ?? <span className="block h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />}</div>
      <p className="text-[11.5px] leading-5 text-[var(--muted)]">
        <span className="font-mono text-[9.5px] uppercase tracking-[.13em] text-[var(--subtle)]">{label} · </span>
        {children}
      </p>
    </div>
  );
}
