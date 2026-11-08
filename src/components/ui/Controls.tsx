import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = "md",
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex w-full rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]",
              size === "sm" ? "h-8 px-2.5 text-[11.5px]" : "h-9 px-3.5 text-[12px]",
              active
                ? "bg-[var(--text)] text-[var(--bg-deep)] shadow-[0_4px_18px_-8px_rgba(0,0,0,.5)]"
                : "text-[var(--muted)] hover:text-[var(--text)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className,
}: {
  tabs: { value: T; label: ReactNode; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-[var(--line)] px-1", className)}
    >
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-4 py-3 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--cyan)]",
              active ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]",
            )}
          >
            {tab.icon}
            {tab.label}
            {active && <span className="absolute inset-x-2 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--cyan),transparent)]" />}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={inputId} className="cursor-pointer text-[12.5px] font-semibold text-[var(--text)]">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[11px] leading-4 text-[var(--subtle)]">{description}</p>}
      </div>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-[22px] w-[38px] shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
          checked ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/30" : "border-[var(--line-strong)] bg-[var(--bg-deep)]",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full shadow-sm transition-[left,background-color]",
            checked ? "left-[19px] bg-[var(--cyan)]" : "left-[3px] bg-[var(--muted)]",
          )}
        />
      </button>
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  hint,
  accent = "cyan",
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  hint?: string;
  accent?: "cyan" | "warn" | "bad" | "violet";
  disabled?: boolean;
}) {
  const id = useId();
  const accentColor = {
    cyan: "var(--cyan)",
    warn: "var(--warn)",
    bad: "var(--bad)",
    violet: "var(--violet)",
  }[accent];
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("space-y-2.5", disabled && "opacity-40")}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[11.5px] font-semibold text-[var(--text)]">
          {label}
        </label>
        <span className="font-mono text-[11px] tabular-nums text-[var(--muted)]">
          {value}
          <span className="ml-0.5 text-[var(--subtle)]">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={`${value}${unit}`}
        style={{
          background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${fill}%, var(--range-track) ${fill}%, var(--range-track) 100%)`,
          ["--range-accent" as string]: accentColor,
        }}
        className="range-input w-full"
      />
      {hint && <p className="text-[10.5px] leading-4 text-[var(--subtle)]">{hint}</p>}
    </div>
  );
}
