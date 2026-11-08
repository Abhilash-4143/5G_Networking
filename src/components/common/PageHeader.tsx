import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({
  index,
  eyebrow,
  title,
  description,
  aside,
  badges,
  children,
  className,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  aside?: ReactNode;
  badges?: string[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-[var(--line)]", className)}>
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-[.38] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 h-[360px] w-[560px] rounded-full bg-[var(--cyan)]/[.055] blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-0 font-display text-[clamp(9rem,22vw,22rem)] font-medium leading-[.7] tracking-[-.09em] text-white/[.018]">
        {index}
      </div>
      <div className="page-shell relative pb-14 pt-9 sm:pb-16 lg:pb-20 lg:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] text-[var(--subtle)]">
          <Link to="/" className="transition-colors hover:text-[var(--text)]">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[var(--muted)]">{eyebrow}</span>
        </nav>

        <div className="mt-10 grid items-end gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,.62fr)] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[.18em] text-[var(--subtle)]">
                Module {index} / 12
              </span>
              {badges?.map((badge) => (
                <span key={badge} className="rounded-full border border-[var(--line)] bg-white/[.025] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[.13em] text-[var(--muted)]">
                  {badge}
                </span>
              ))}
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.35rem,6vw,4.7rem)] font-medium leading-[.98] tracking-[-.06em] text-[var(--text)]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-[14px] leading-7 text-[var(--muted)] sm:text-[15px]">{description}</p>
            {children}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    const timer = window.setTimeout(() => {
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

export function PageWrap({ children }: { children: ReactNode }) {
  return <div className="min-h-[60vh]">{children}</div>;
}
