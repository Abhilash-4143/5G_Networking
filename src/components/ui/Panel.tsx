import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({
  className,
  children,
  as: Tag = "div",
  hover = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article" | "aside";
  hover?: boolean;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "glass-panel",
        hover && "transition-[border-color,background-color,transform] duration-300 hover:border-[var(--line-strong)] hover:bg-[var(--surface-hover)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({
  children,
  className,
  icon,
}: {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span className={cn("eyebrow", className)}>
      {icon && <span className="text-[var(--cyan)]">{icon}</span>}
      {children}
    </span>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
  pulse = false,
  className,
}: {
  label: string;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
  pulse?: boolean;
  className?: string;
}) {
  const tones = {
    neutral: "text-[var(--muted)] bg-white/[.045] border-white/[.1]",
    good: "text-[var(--good)] bg-[var(--good)]/[.08] border-[var(--good)]/20",
    warn: "text-[var(--warn)] bg-[var(--warn)]/[.08] border-[var(--warn)]/20",
    bad: "text-[var(--bad)] bg-[var(--bad)]/[.08] border-[var(--bad)]/20",
    info: "text-[var(--cyan)] bg-[var(--cyan)]/[.07] border-[var(--cyan)]/20",
  };
  const dot = {
    neutral: "bg-[var(--muted)]",
    good: "bg-[var(--good)]",
    warn: "bg-[var(--warn)]",
    bad: "bg-[var(--bad)]",
    info: "bg-[var(--cyan)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.14em]",
        tones[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[tone], pulse && "animate-pulse")} />
      {label}
    </span>
  );
}

export function Stat({
  label,
  value,
  unit,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  tone?: "good" | "warn" | "bad" | "cyan";
}) {
  const color = tone ? { good: "text-[var(--good)]", warn: "text-[var(--warn)]", bad: "text-[var(--bad)]", cyan: "text-[var(--cyan)]" }[tone] : "text-[var(--text)]";
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[.14em] text-[var(--subtle)]">{label}</p>
      <p className={cn("mt-1.5 font-display text-[clamp(1.35rem,2.4vw,1.8rem)] font-medium tracking-[-.04em]", color)}>
        {value}
        {unit && <span className="ml-1 text-[.62em] font-normal tracking-normal text-[var(--muted)]">{unit}</span>}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-[var(--subtle)]">{hint}</p>}
    </div>
  );
}
