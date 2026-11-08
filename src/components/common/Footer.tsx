import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { footerGroups } from "@/data/site";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-[var(--line)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)]/30 to-transparent" />
      <div className="page-shell pb-10 pt-14 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1.6fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-[12.5px] leading-6 text-[var(--muted)]">
              An interactive learning environment for wireless fundamentals, private 5G architecture,
              and the systems shaping the future of connectivity.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-md border border-[var(--line)] bg-white/[.025] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">
                Educational simulation
              </span>
              <span className="rounded-md border border-[var(--line)] bg-white/[.025] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">
                Client-side only
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="font-mono text-[9px] uppercase tracking-[.17em] text-[var(--subtle)]">{group.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.to + link.label}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1.5 text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                      >
                        {link.label}
                        <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--line)] pt-6 text-[10.5px] text-[var(--subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 5G Network Explorer · Independent Long-Range Communication Network project.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[.11em]">
            <span>Synthetic data</span>
            <span className="hidden h-2.5 w-px bg-[var(--line-strong)] sm:block" />
            <span>No production traffic</span>
            <span className="hidden h-2.5 w-px bg-[var(--line-strong)] sm:block" />
            <span>Built with React + WebGL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
