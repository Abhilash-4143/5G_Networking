import { useId, type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

export function InfoTip({ children, label = "More information", className }: { children: ReactNode; label?: string; className?: string }) {
  const id = useId();
  return (
    <span className={cn("group relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--subtle)] transition-colors hover:text-[var(--cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-left text-[11px] font-normal leading-4 text-[var(--muted)] opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}

export function Callout({
  title,
  children,
  tone = "info",
  icon,
}: {
  title: string;
  children: ReactNode;
  tone?: "info" | "warn" | "good";
  icon?: ReactNode;
}) {
  const styles = {
    info: "border-[var(--cyan)]/20 bg-[var(--cyan)]/[.045]",
    warn: "border-[var(--warn)]/25 bg-[var(--warn)]/[.045]",
    good: "border-[var(--good)]/25 bg-[var(--good)]/[.045]",
  };
  const titleColor = {
    info: "text-[var(--cyan)]",
    warn: "text-[var(--warn)]",
    good: "text-[var(--good)]",
  };
  return (
    <div className={cn("rounded-xl border p-4", styles[tone])}>
      <div className={cn("flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.08em]", titleColor[tone])}>
        {icon}
        {title}
      </div>
      <div className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">{children}</div>
    </div>
  );
}
