import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

export function Logo({
  compact = false,
  className,
  onClick,
}: {
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn("group inline-flex items-center gap-3 focus-visible:rounded-lg", className)}
      aria-label="5G Network Explorer home"
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[7px] border border-[var(--line-strong)] bg-[var(--bg-elevated)] shadow-[0_1px_2px_rgba(20,40,61,.1)]">
        <svg viewBox="0 0 32 32" className="h-[22px] w-[22px]" fill="none" aria-hidden="true">
          <path d="M14.6 5 7.2 18.1h5.9L11.9 27l8.3-13h-6.1L14.6 5Z" fill="url(#logo-gradient)" />
          <circle cx="25.2" cy="7.3" r="1.7" fill="var(--good)" />
          <path d="M22.1 14.7a5.4 5.4 0 0 1-3.8 3.7" stroke="var(--cyan)" strokeWidth="1.15" strokeLinecap="round" opacity=".75" />
          <path d="M24.7 16.8a8.8 8.8 0 0 1-5.4 5.3" stroke="var(--cyan)" strokeWidth="1.15" strokeLinecap="round" opacity=".38" />
          <defs>
            <linearGradient id="logo-gradient" x1="7" y1="5" x2="26" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#91B7A5" />
              <stop offset="1" stopColor="#173D38" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-x-1 bottom-0 h-px bg-[var(--cyan)]/60" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[13.5px] font-semibold tracking-[.035em] text-[var(--text)]">
            5G NETWORK
          </span>
          <span className="mt-1 font-mono text-[8.5px] font-medium uppercase tracking-[.29em] text-[var(--muted)]">
            Explorer
          </span>
        </span>
      )}
    </Link>
  );
}
