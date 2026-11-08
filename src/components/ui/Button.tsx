import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "quiet";
type Size = "sm" | "md" | "lg" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "text-[var(--primary-fg)] bg-[var(--primary-btn)] border border-[var(--primary-btn)] shadow-[0_1px_2px_rgba(16,42,38,.22)] hover:brightness-110 active:brightness-100",
  secondary:
    "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--line-strong)] hover:bg-[var(--surface-hover)] hover:border-[var(--text)]/40",
  ghost:
    "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)] border border-transparent",
  outline:
    "border border-[var(--line-strong)] text-[var(--text)] bg-transparent hover:bg-[var(--surface-soft)] hover:border-[var(--cyan)]/60",
  danger:
    "border border-[var(--bad)]/35 text-[var(--bad)] bg-[var(--bad)]/[.06] hover:bg-[var(--bad)]/[.12]",
  quiet:
    "bg-[var(--surface-soft)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--line-strong)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[12.5px] gap-1.5 rounded-[10px]",
  md: "h-11 px-5 text-[13.5px] gap-2 rounded-[12px]",
  lg: "h-[48px] px-6 text-sm gap-2.5 rounded-[12px]",
  icon: "h-10 w-10 rounded-[12px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "secondary",
    size = "md",
    loading = false,
    iconLeft,
    iconRight,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold tracking-[-.01em] transition-[background-color,border-color,color,filter,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
});
