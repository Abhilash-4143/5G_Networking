import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

type State = { hasError: boolean; message: string | null };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this only logs to the console; nothing is sent anywhere.
    console.error("5G Network Explorer rendering error:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, message: null });
  };

  reload = () => {
    this.reset();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        typeof this.state.message === "string" &&
        (/dynamically imported module/i.test(this.state.message) ||
          /chunk/i.test(this.state.message) ||
          /failed to fetch/i.test(this.state.message));
      return (
        <div className="page-shell flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--bad)]/25 bg-[var(--bad)]/[.08] text-[var(--bad)]">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <p className="mt-6 eyebrow">Rendering interrupted</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-.04em]">This module failed to load.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            {isChunkError
              ? "A page resource could not be downloaded — this usually happens after the site is updated while it is open. Reload to fetch the latest version."
              : "A component encountered an unexpected rendering error. Reload the experience, or return to the overview."}
          </p>
          {this.state.message && !isChunkError && (
            <p className="mt-3 max-w-lg rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2 font-mono text-[10px] leading-4 text-[var(--subtle)]">
              {this.state.message}
            </p>
          )}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={this.reload} iconLeft={<RotateCcw className="h-4 w-4" />}>
              Reload experience
            </Button>
            <Button variant="secondary" onClick={this.reset} iconLeft={<RotateCcw className="h-4 w-4" />}>
              Try again
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = "/"; }} iconLeft={<Home className="h-4 w-4" />}>
              Return home
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Wraps the boundary with a remount per route so a recovered navigation
 * never stays stuck on the failure screen.
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
}

export function LoadingScreen() {
  return (
    <div className="page-shell flex min-h-[55vh] flex-col items-center justify-center gap-5" aria-live="polite" aria-label="Loading module">
      <div className="relative h-11 w-11">
        <span className="absolute inset-0 rounded-xl border border-[var(--cyan)]/20" />
        <span className="absolute inset-0 animate-spin rounded-xl border border-transparent border-t-[var(--cyan)]" style={{ animationDuration: "1.4s" }} />
        <span className="absolute inset-[15px] rounded-full bg-[var(--cyan)]/60" />
      </div>
      <div className="text-center">
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[var(--muted)]">Loading module</p>
        <p className="mt-1.5 text-[11px] text-[var(--subtle)]">Preparing the interactive environment…</p>
      </div>
    </div>
  );
}
