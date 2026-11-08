import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Check, Palette } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/cn";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        onClick={() => setOpen((current) => !current)}
        aria-label="Choose appearance theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--line)] bg-white/[.035] text-[var(--muted)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]",
          compact ? "h-9 w-9" : "h-10 px-3",
        )}
      >
        {theme === "midnight" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {!compact && <span className="text-[11.5px] font-semibold">{theme === "midnight" ? "Deep teal" : "Soft sage"}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Appearance"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-[0_24px_70px_-20px_rgba(0,0,0,.9)]"
          >
            <p className="px-2.5 pb-1.5 pt-1 font-mono text-[9px] uppercase tracking-[.16em] text-[var(--subtle)]">
              <Palette className="mr-1 inline h-3 w-3" /> Appearance
            </p>
            {[
              { value: "midnight" as const, label: "Deep teal", detail: "Forest-teal aurora environment", icon: Moon },
              { value: "daylight" as const, label: "Soft sage", detail: "Sage and warm-stone daylight", icon: Sun },
            ].map((option) => (
              <button
                key={option.value}
                role="menuitemradio"
                aria-checked={theme === option.value}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--cyan)]"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md border border-[var(--line)] bg-white/[.03] text-[var(--muted)]">
                  <option.icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-[var(--text)]">{option.label}</span>
                  <span className="block text-[10px] text-[var(--subtle)]">{option.detail}</span>
                </span>
                {theme === option.value && <Check className="h-3.5 w-3.5 text-[var(--cyan)]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
