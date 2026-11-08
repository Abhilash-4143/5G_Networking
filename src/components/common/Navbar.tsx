import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  Search,
  X,
  Command,
  RadioTower,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SearchDialog } from "./SearchDialog";
import { primaryNav, secondaryNav } from "@/data/site";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

function MoreMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-[11.5px] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]"
      >
        Explore
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -5, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-[0_28px_80px_-24px_rgba(0,0,0,.9)]"
          >
            <p className="px-2.5 pb-2 pt-1.5 font-mono text-[9px] uppercase tracking-[.16em] text-[var(--subtle)]">Systems & project</p>
            {secondaryNav.map((item) => (
              <NavLink
                key={item.path}
                role="menuitem"
                to={item.path}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center justify-between rounded-lg px-2.5 py-2.5 text-[12px] font-medium transition-colors",
                    isActive ? "bg-white/[.06] text-[var(--text)]" : "text-[var(--muted)] hover:bg-white/[.04] hover:text-[var(--text)]",
                  )
                }
              >
                {item.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--subtle)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItems({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const items = compact ? primaryNav.filter((item) => item.path !== "/" && item.path !== "/security" && item.path !== "/future-network") : primaryNav;
  return (
    <>
      {items.filter((item) => !compact || item.path !== "/performance").map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "relative flex h-9 items-center rounded-lg px-2.5 text-[11.5px] font-semibold tracking-[-.005em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]",
              isActive
                ? "bg-[var(--surface-soft)] text-[var(--text)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
      <MoreMenu onNavigate={onNavigate} />
    </>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled
            ? "border-[var(--line)] bg-[var(--bg)]/82 backdrop-blur-2xl"
            : "border-transparent bg-[var(--bg)]/30 backdrop-blur-sm",
        )}
      >
        <div className="page-shell flex h-[68px] items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            <div className="hidden xl:flex xl:items-center xl:gap-0.5">
              {primaryNav.slice(0, 1).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex h-9 items-center rounded-lg px-2.5 text-[11.5px] font-semibold transition-colors",
                      isActive ? "bg-[var(--surface-soft)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {primaryNav.slice(1).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex h-9 items-center rounded-lg px-2.5 text-[11.5px] font-semibold transition-colors",
                      isActive ? "bg-[var(--surface-soft)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <MoreMenu />
            </div>
            <div className="flex items-center gap-0.5 xl:hidden">
              <NavItems compact />
            </div>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search concepts and pages"
              className="hidden h-10 w-[176px] items-center gap-2 rounded-[10px] border border-[var(--line)] bg-white/[.025] px-3 text-left text-[11px] text-[var(--subtle)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] lg:flex xl:w-[198px]"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">Search anything</span>
              <span className="flex items-center gap-0.5">
                <Command className="h-2.5 w-2.5" />
                <span className="font-mono text-[9px]">K</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search concepts and pages"
              className="grid h-9 w-9 place-items-center rounded-[9px] text-[var(--muted)] transition-colors hover:bg-white/[.05] hover:text-[var(--text)] lg:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="hidden sm:block">
              <ThemeSwitcher compact />
            </div>
            <Link to="/simulator" className="hidden 2xl:block">
              <Button variant="primary" size="sm" iconLeft={<RadioTower className="h-3.5 w-3.5" />}>
                Explore Simulator
              </Button>
            </Link>
            <Link to="/simulator" className="hidden sm:block 2xl:hidden">
              <Button variant="primary" size="sm">
                Simulator
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              className="grid h-10 w-10 place-items-center rounded-[10px] border border-[var(--line)] bg-white/[.035] text-[var(--muted)] transition-colors hover:text-[var(--text)] lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] lg:hidden"
          >
            <div className="absolute inset-0 bg-[#02070e]/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-[390px] flex-col border-l border-[var(--line)] bg-[var(--bg-elevated)]/97 backdrop-blur-2xl"
            >
              <div className="flex h-[68px] items-center justify-between border-b border-[var(--line)] px-5">
                <Logo onClick={() => setMobileOpen(false)} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[var(--subtle)]">Navigate</p>
                <nav aria-label="Mobile primary" className="mt-3 grid gap-1">
                  {primaryNav.map((item, index) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors",
                          isActive
                            ? "border-[var(--line-strong)] bg-[var(--surface-soft)] text-[var(--text)]"
                            : "border-transparent text-[var(--muted)] hover:bg-white/[.035] hover:text-[var(--text)]",
                        )
                      }
                    >
                      <span className="flex items-center gap-3 text-[13.5px] font-semibold">
                        <span className="font-mono text-[9px] text-[var(--subtle)]">{String(index + 1).padStart(2, "0")}</span>
                        {item.label}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--subtle)]" />
                    </NavLink>
                  ))}
                </nav>
                <p className="mt-7 font-mono text-[9px] uppercase tracking-[.18em] text-[var(--subtle)]">Systems & project</p>
                <nav aria-label="Mobile secondary" className="mt-3 grid gap-0.5">
                  {secondaryNav.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between rounded-lg px-4 py-3 text-[12.5px] font-medium transition-colors",
                          isActive ? "bg-[var(--surface-soft)] text-[var(--text)]" : "text-[var(--muted)] hover:bg-white/[.035] hover:text-[var(--text)]",
                        )
                      }
                    >
                      {item.label}
                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--subtle)]" />
                    </NavLink>
                  ))}
                </nav>
              </div>
              <div className="safe-bottom border-t border-[var(--line)] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--muted)]">Appearance</span>
                  <ThemeSwitcher />
                </div>
                <Link to="/simulator" onClick={() => setMobileOpen(false)} className="block">
                  <Button variant="primary" size="md" className="w-full" iconLeft={<RadioTower className="h-4 w-4" />}>
                    Explore Simulator
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
