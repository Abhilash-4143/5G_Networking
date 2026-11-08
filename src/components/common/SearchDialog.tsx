import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { searchEntries, type SearchEntry } from "@/data/site";
import { cn } from "@/lib/cn";

function scoreEntry(entry: SearchEntry, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const keywords = entry.keywords.join(" ").toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (keywords.includes(q)) return 40;
  if (description.includes(q)) return 20;
  const tokens = q.split(/\s+/);
  const haystack = `${title} ${description} ${keywords} ${entry.category.toLowerCase()}`;
  if (tokens.every((token) => haystack.includes(token))) return 10;
  return -1;
}

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const results = query.trim()
    ? searchEntries
        .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((item) => item.entry)
    : searchEntries.slice(0, 6);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
      return () => {
        window.clearTimeout(timer);
        document.body.style.overflow = "";
        previousFocus.current?.focus();
      };
    }
    setQuery("");
    setActiveIndex(0);
    return undefined;
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function go(entry: SearchEntry) {
    onClose();
    navigate(entry.path);
    window.setTimeout(() => {
      const hashTarget = document.getElementById(entry.keywords[0]);
      if (hashTarget) hashTarget.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onClose();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % Math.max(results.length, 1));
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      go(results[activeIndex]);
    }
  }

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 bg-[#02070e]/75 backdrop-blur-md"
            onClick={onClose}
            tabIndex={-1}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search 5G Network Explorer"
            initial={{ opacity: 0, y: -14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
            }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--bg-elevated)]/95 shadow-[0_32px_120px_-24px_rgba(0,0,0,.95)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 sm:px-5">
              <Search className="h-[18px] w-[18px] text-[var(--cyan)]" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search concepts and pages"
                aria-controls="search-results"
                aria-activedescendant={results[activeIndex] ? `search-result-${activeIndex}` : undefined}
                placeholder="Search concepts, systems, or pages…"
                className="h-[60px] min-w-0 flex-1 bg-transparent text-[14px] text-[var(--text)] placeholder:text-[var(--subtle)] focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-white/[.06] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={listRef} id="search-results" role="listbox" aria-label="Search results" className="max-h-[55vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                <>
                  <p className="px-3 pb-2 pt-2 font-mono text-[9px] uppercase tracking-[.17em] text-[var(--subtle)]">
                    {query ? `${results.length} matching ${results.length === 1 ? "result" : "results"}` : "Suggested starting points"}
                  </p>
                  {results.map((entry, index) => {
                    const active = index === activeIndex;
                    return (
                      <button
                        key={`${entry.path}-${entry.title}`}
                        id={`search-result-${index}`}
                        data-index={index}
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => go(entry)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                          active ? "bg-white/[.065]" : "hover:bg-white/[.035]",
                        )}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-[var(--cyan)]/[.055] font-mono text-[10px] text-[var(--cyan)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[12.5px] font-semibold text-[var(--text)]">{entry.title}</span>
                            <span className="font-mono text-[8.5px] uppercase tracking-[.12em] text-[var(--subtle)]">{entry.category}</span>
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-[11px] text-[var(--muted)]">{entry.description}</span>
                        </span>
                        <ArrowRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-[var(--subtle)] transition-transform",
                            active && "translate-x-0.5 text-[var(--cyan)]",
                          )}
                        />
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-white/[.03]">
                    <Search className="h-5 w-5 text-[var(--subtle)]" />
                  </span>
                  <p className="mt-4 text-[13px] font-semibold text-[var(--text)]">No concepts found</p>
                  <p className="mt-1 max-w-xs text-[11.5px] leading-5 text-[var(--muted)]">
                    Try a broader term such as “antennas”, “security”, “latency”, or “6G”.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] px-4 py-2.5 text-[9.5px] text-[var(--subtle)]">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5"><span className="kbd">↑</span><span className="kbd">↓</span> Navigate</span>
                <span className="flex items-center gap-1.5"><CornerDownLeft className="h-3 w-3" /> Open</span>
              </span>
              <span className="flex items-center gap-1.5"><span className="kbd">esc</span> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
