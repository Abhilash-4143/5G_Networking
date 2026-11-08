import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Circle,
  Eraser,
  History,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Send,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Controls";
import { useLocalStorage } from "@/lib/storage";
import { cn } from "@/lib/cn";

type NodeId = "phoneA" | "ran" | "backhaul" | "core" | "messaging" | "phoneB";

type Stage = {
  label: string;
  node: NodeId;
  logEnter: string;
};

const STAGES: Stage[] = [
  { label: "Preparing packet", node: "phoneA", logEnter: "Smartphone A created a simulated data packet." },
  { label: "Transmitting to RAN", node: "ran", logEnter: "Radio uplink: packet transmitted toward the RAN." },
  { label: "Processing at base station", node: "ran", logEnter: "Base station received and decoded the radio signal." },
  { label: "Forwarding through backhaul", node: "backhaul", logEnter: "Backhaul transport forwarded the packet toward the core." },
  { label: "Routing through core network", node: "core", logEnter: "The core network authenticated and routed the session." },
  { label: "Delivering message", node: "messaging", logEnter: "Messaging server processed the request and queued delivery." },
  { label: "Successfully delivered", node: "phoneB", logEnter: "Smartphone B received the message." },
];

const NODE_LABELS: Record<NodeId, string> = {
  phoneA: "Smartphone A",
  ran: "RAN Â· Base station",
  backhaul: "Backhaul",
  core: "Private core",
  messaging: "Messaging server",
  phoneB: "Smartphone B",
};

const DISCONNECTABLE: { id: NodeId; label: string; failStage: number }[] = [
  { id: "ran", label: "RAN / base station", failStage: 1 },
  { id: "backhaul", label: "Backhaul link", failStage: 3 },
  { id: "core", label: "Core network", failStage: 4 },
  { id: "messaging", label: "Messaging server", failStage: 5 },
];

type LogEntry = { time: string; text: string; kind: "info" | "ok" | "error" };
type HistoryEntry = { text: string; at: number; status: "delivered" | "failed" };

function nowStamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

export function PacketTransmissionLab() {
  const [draft, setDraft] = useState("");
  const [activeMessage, setActiveMessage] = useState("");
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "failed" | "delivered">("idle");
  const [failedAt, setFailedAt] = useState<number | null>(null);
  const [disconnected, setDisconnected] = useState<Partial<Record<NodeId, boolean>>>({});
  const [latencyMs, setLatencyMs] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([
    { time: nowStamp(), text: "Simulation ready. No carrier network is contacted.", kind: "info" },
  ]);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("5gx-packet-history", []);
  const intervalRef = useRef<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  function pushLog(text: string, kind: LogEntry["kind"] = "info") {
    setLog((current) => [...current.slice(-60), { time: nowStamp(), text, kind }]);
  }

  function nodeIsDown(id: NodeId) {
    return Boolean(disconnected[id]);
  }

  function startEngine(fromStage: number, fromProgress = 0) {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    const stepMs = reducedMotion ? 60 : 90;
    const step = reducedMotion ? 0.4 : 0.16;
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = p + step;
        if (next >= 1) {
          return 1;
        }
        return next;
      });
    }, stepMs);
    void fromStage;
    void fromProgress;
  }

  useEffect(() => {
    if (status !== "running") return;
    if (progress < 1) return;
    if (stage >= STAGES.length - 1) {
      setStatus("delivered");
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      pushLog("Transmission complete. Message delivered to Smartphone B.", "ok");
      if (activeMessage) {
        setHistory((h) => [{ text: activeMessage, at: Date.now(), status: "delivered" as const }, ...h].slice(0, 12));
      }
      return;
    }
    const nextStage = stage + 1;
    const target = STAGES[nextStage].node;
    if (nodeIsDown(target)) {
      setFailedAt(nextStage);
      setStatus("failed");
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      pushLog(`Failure: ${NODE_LABELS[target]} is disconnected. Packet dropped at â€œ${STAGES[nextStage].label}â€.`, "error");
    } else {
      setStage(nextStage);
      setProgress(0);
      setLatencyMs((l) => l + Math.round(6 + Math.random() * 34));
      pushLog(STAGES[nextStage].logEnter);
    }
  }, [progress, stage, status, activeMessage]);

  function stopEngine() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function send(text?: string) {
    const message = (text ?? draft).trim();
    if (!message || status === "running" || status === "paused") return;
    setDraft(message);
    setActiveMessage(message);
    setStage(0);
    setProgress(0);
    setFailedAt(null);
    setLatencyMs(Math.round(4 + Math.random() * 10));
    setStatus("running");
    pushLog(`Send requested: â€œ${message.slice(0, 80)}â€`);
    pushLog(STAGES[0].logEnter);
    startEngine(0);
  }

  function clearMessage() {
    stopEngine();
    setDraft("");
    setActiveMessage("");
    setStage(0);
    setProgress(0);
    setFailedAt(null);
    setLatencyMs(0);
    setStatus("idle");
    pushLog("Message cleared and transmission reset.");
  }

  function resetTransmission() {
    stopEngine();
    setStage(0);
    setProgress(0);
    setFailedAt(null);
    setLatencyMs(0);
    setStatus(activeMessage ? "idle" : "idle");
    setDisconnected({});
    pushLog("Transmission reset. All components reconnected.");
  }

  function pause() {
    stopEngine();
    setStatus("paused");
    pushLog("Animation paused.");
  }

  function resume() {
    setStatus("running");
    pushLog("Animation resumed.");
    startEngine(stage, progress);
  }

  function toggleDisconnected(id: NodeId, down: boolean) {
    setDisconnected((d) => ({ ...d, [id]: down }));
    pushLog(`${NODE_LABELS[id]} ${down ? "disconnected (simulated fault)" : "restored."}`, down ? "error" : "ok");
  }

  function reconnectAll() {
    setDisconnected({});
    setFailedAt(null);
    if (status === "failed") {
      setStatus("idle");
      setStage(0);
      setProgress(0);
    }
    pushLog("Connectivity restored. You can retry the transmission.");
  }


  const currentLabel = status === "delivered"
    ? "Successfully delivered"
    : status === "failed" && failedAt != null
      ? `Failed at: ${STAGES[failedAt].label}`
      : status === "idle"
        ? "Ready"
        : STAGES[stage].label;

  const highlightedNode = STAGES[Math.min(stage, STAGES.length - 1)].node;
  const packetVisible = status === "running" || status === "paused" || status === "delivered";
  const delivered = status === "delivered";
  const failureNode = failedAt != null ? STAGES[failedAt].node : null;

  // Vertical layout geometry â€” nodes stacked top â†’ bottom, packet follows the line.
  const NODE_Y: Record<NodeId, number> = {
    phoneA: 44,
    ran: 116,
    backhaul: 188,
    core: 260,
    messaging: 332,
    phoneB: 404,
  };
  const dotY = (() => {
    const from = STAGES[Math.min(stage, STAGES.length - 1)].node;
    const to = STAGES[Math.min(stage + 1, STAGES.length - 1)].node;
    const start = NODE_Y[from];
    const end = stage >= STAGES.length - 1 ? NODE_Y.phoneB : NODE_Y[to];
    return start + (end - start) * progress;
  })();
  const packetDotY = status === "failed" ? NODE_Y[STAGES[failedAt ?? stage].node] : dotY;

  const statusMeta =
    status === "delivered"
      ? { label: "Delivered", tone: "good" as const }
      : status === "failed"
        ? { label: "Failed", tone: "bad" as const }
        : status === "paused"
          ? { label: "Paused", tone: "warn" as const }
          : status === "running"
            ? { label: "Transmitting", tone: "info" as const }
            : { label: "Idle", tone: "neutral" as const };

  const nodeIcon: Record<NodeId, string> = {
    phoneA: "UE",
    ran: "RAN",
    backhaul: "BH",
    core: "5GC",
    messaging: "SVC",
    phoneB: "UE",
  };

  return (
    <div className="glass-panel overflow-hidden">
      {/* Workspace header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--cyan)]/25 bg-[var(--cyan)]/[.06] text-[var(--cyan)]">
            <Send className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[12.5px] font-semibold text-[var(--text)]">Packet transmission lab</p>
            <p className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">Educational simulation Â· No real messages</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-[var(--line)] bg-white/[.02] px-2 py-1 font-mono text-[8px] uppercase tracking-[.08em] text-[var(--subtle)]">
            Stage {Math.min(stage + 1, STAGES.length)}/{STAGES.length}
          </span>
          <StatusPill label={statusMeta.label} tone={statusMeta.tone} pulse={status === "running"} />
        </div>
      </div>

      {/* Three-region workspace */}
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:gap-5 lg:p-6">
        {/* LEFT: sender, input, controls */}
        <section aria-label="Sender and message input" className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-[var(--line)] bg-white/[.02] p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text)]">
                <Smartphone className="h-3.5 w-3.5 text-[var(--cyan)]" /> Sender · Smartphone A
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[.08em] text-[var(--subtle)]">UE</span>
            </div>
            <div className="mt-2.5 min-h-[56px] rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[12px] leading-5 text-[var(--text)]">
              {activeMessage ? activeMessage : <span className="text-[var(--subtle)]">Your message will appear here.</span>}
            </div>
          </div>

          <div>
            <label htmlFor="packet-message" className="block text-[11px] font-semibold text-[var(--text)]">
              Message content
            </label>
            <input
              id="packet-message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Type the message to simulateâ€¦"
              maxLength={140}
              disabled={status === "running" || status === "paused"}
              className="mt-2 h-11 w-full rounded-[10px] border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3.5 text-[12.5px] text-[var(--text)] placeholder:text-[var(--subtle)] focus:border-[var(--cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]/30 disabled:opacity-50"
            />
            <Button variant="primary" size="md" onClick={() => send()} disabled={!draft.trim() || status === "running" || status === "paused"} iconLeft={<Send className="h-3.5 w-3.5" />} className="mt-2 w-full">
              Send Message
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {status === "paused" ? (
              <Button variant="secondary" size="sm" onClick={resume} iconLeft={<Play className="h-3.5 w-3.5" />}>Resume</Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={pause} disabled={status !== "running"} iconLeft={<Pause className="h-3.5 w-3.5" />}>Pause</Button>
            )}
            <Button variant="quiet" size="sm" onClick={resetTransmission} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>Reset</Button>
            <Button variant="quiet" size="sm" onClick={clearMessage} iconLeft={<Eraser className="h-3.5 w-3.5" />}>Clear</Button>
            {status === "failed" && (
              <Button variant="primary" size="sm" onClick={reconnectAll} iconLeft={<Check className="h-3.5 w-3.5" />}>Restore</Button>
            )}
          </div>

          <div className="border-t border-[var(--line)] pt-3">
            <p className="data-label">Simulate component failure</p>
            <div className="mt-2.5 space-y-3">
              {DISCONNECTABLE.map((d) => (
                <Toggle
                  key={d.id}
                  checked={Boolean(disconnected[d.id])}
                  onChange={(v) => toggleDisconnected(d.id, v)}
                  label={d.label}
                  description={disconnected[d.id] ? "Disconnected â€” will fail at its stage." : "Connected."}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CENTER: vertical transmission diagram */}
        <section aria-label="Transmission diagram" className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--bg-deep)]/40 p-3">
          <svg viewBox="0 0 320 452" className="mx-auto h-[430px] w-full max-w-[320px]" role="img" aria-label="Vertical packet path: Smartphone A, RAN, backhaul, core network, messaging server, Smartphone B">
            <defs>
              <linearGradient id="packet-path-v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="var(--good)" />
              </linearGradient>
            </defs>
            {(["phoneA", "ran", "backhaul", "core", "messaging", "phoneB"] as NodeId[]).map((id, i) => {
              const y = NODE_Y[id];
              const isLast = i === 5;
              return (
                <g key={`seg-${id}`}>
                  {!isLast && (
                    <line
                      x1="96"
                      y1={y + 22}
                      x2="96"
                      y2={NODE_Y[(["phoneA", "ran", "backhaul", "core", "messaging", "phoneB"] as NodeId[])[i + 1]] - 22}
                      stroke="var(--line-strong)"
                      strokeWidth="1.6"
                      strokeDasharray="4 5"
                    />
                  )}
                </g>
              );
            })}
            {(["phoneA", "ran", "backhaul", "core", "messaging", "phoneB"] as NodeId[]).map((id) => {
              const y = NODE_Y[id];
              const down = nodeIsDown(id);
              const active = highlightedNode === id && (status === "running" || status === "paused");
              const done = status === "delivered" || (status !== "idle" && STAGES.findIndex((s) => s.node === id) < stage && id !== "phoneA");
              const failed = failureNode === id;
              const stroke = failed || down ? "var(--bad)" : active ? "var(--cyan)" : done ? "var(--good)" : "var(--line-strong)";
              const fill = failed || down ? "rgba(194,67,47,.1)" : active ? "rgba(145,183,165,.12)" : "var(--bg-elevated)";
              return (
                <g key={id}>
                  <circle
                    cx="96"
                    cy={y}
                    r={active ? 24 : 21}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={active || failed ? 2 : 1.4}
                    style={{ transition: "stroke .25s" }}
                  />
                  <text x="96" y={y + 3} textAnchor="middle" fill={stroke} fontSize="9" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                    {nodeIcon[id]}
                  </text>
                  <text x="132" y={y + 1} fill="var(--text)" fontSize="11.5" fontWeight="600" fontFamily="Inter Variable, sans-serif">
                    {NODE_LABELS[id]}
                  </text>
                  {(down || failed) && (
                    <text x="132" y={y + 15} fill="var(--bad)" fontSize="8" fontFamily="IBM Plex Mono, monospace" letterSpacing=".6">
                      OFFLINE
                    </text>
                  )}
                  {done && !active && (
                    <g transform={`translate(${96 + 18} ${y - 16})`}>
                      <circle r="6" fill="var(--good)" />
                      <path d="M-2.6 0 L-0.8 2 L2.8 -2.4" fill="none" stroke="#04101f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}
                </g>
              );
            })}
            {packetVisible && (
              <g>
                <circle cx="96" cy={packetDotY} r="10" fill="url(#packet-path-v)" opacity="0.2" />
                <circle cx="96" cy={packetDotY} r="4.5" fill="var(--cyan)" />
                <circle cx="96" cy={packetDotY} r="8" fill="none" stroke="var(--cyan)" strokeOpacity=".45" />
              </g>
            )}
            <text x="160" y="16" textAnchor="middle" fill="var(--subtle)" fontSize="8.5" fontFamily="IBM Plex Mono, monospace" letterSpacing="1.4">
              PACKET PATH Â· UE â†’ RAN â†’ TRANSPORT â†’ CORE â†’ SERVICE â†’ UE
            </text>
            <text x="160" y="442" textAnchor="middle" fill="var(--cyan)" fontSize="11" fontWeight="600" fontFamily="Inter Variable, sans-serif">
              {currentLabel}
            </text>
          </svg>
        </section>

        {/* RIGHT: receiver, stats, history */}
        <aside aria-label="Receiver and delivery status" className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-[var(--line)] bg-white/[.02] p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text)]">
                <Smartphone className="h-3.5 w-3.5 text-[var(--good)]" /> Receiver · Smartphone B
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[.08em] text-[var(--subtle)]">UE</span>
            </div>
            <div className="mt-2.5 min-h-[56px] rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[12px] leading-5 text-[var(--text)]">
              {delivered && activeMessage ? (
                <span>{activeMessage}</span>
              ) : status === "running" || status === "paused" ? (
                <span className="flex items-center gap-1.5 text-[var(--subtle)]"><Loader2 className="h-3 w-3 animate-spin" /> Waiting for deliveryâ€¦</span>
              ) : (
                <span className="text-[var(--subtle)]">Delivered message will appear here.</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-[var(--line)] pt-3.5">
            <div>
              <p className="mono-label">Packet status</p>
              <p className="mt-1 text-[10.5px] font-medium text-[var(--text)]">{currentLabel}</p>
            </div>
            <div>
              <p className="mono-label">Simulated latency</p>
              <p className="mt-1 font-mono text-[10.5px] text-[var(--text)]">{latencyMs} ms</p>
            </div>
            <div>
              <p className="mono-label">Delivery</p>
              <p className={cn("mt-1 text-[10.5px] font-medium", delivered ? "text-[var(--good)]" : status === "failed" ? "text-[var(--bad)]" : "text-[var(--muted)]")}>
                {delivered ? "Delivered" : status === "failed" ? "Failed" : status === "idle" ? "â€”" : "In transit"}
              </p>
            </div>
            <div>
              <p className="mono-label">Packet</p>
              <p className="mt-1 font-mono text-[10.5px] text-[var(--text)]">{packetVisible ? `pkt-${(activeMessage.length * 7 + 41) % 997}` : "â€”"}</p>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-3.5">
            <div className="flex items-center justify-between">
              <p className="data-label flex items-center gap-1.5"><History className="h-3 w-3" /> Message history</p>
              {history.length > 0 && (
                <button type="button" onClick={() => setHistory([])} className="text-[9px] font-medium text-[var(--subtle)] transition-colors hover:text-[var(--bad)]">
                  Clear
                </button>
              )}
            </div>
            <div className="mt-2.5 max-h-[120px] space-y-1.5 overflow-y-auto [scrollbar-width:thin]">
              {history.length === 0 ? (
                <p className="text-[9.5px] leading-4 text-[var(--subtle)]">No messages sent yet this session.</p>
              ) : (
                history.map((h, i) => (
                  <button
                    key={`${h.at}-${i}`}
                    type="button"
                    onClick={() => { setDraft(h.text); send(h.text); }}
                    className="group flex w-full items-center justify-between gap-2 rounded-md border border-[var(--line)] bg-white/[.02] px-2.5 py-1.5 text-left transition-colors hover:border-[var(--cyan)]/30"
                    title="Click to resend"
                  >
                    <span className="min-w-0 flex-1 truncate text-[10px] text-[var(--text)]">{h.text}</span>
                    <span className={cn("flex shrink-0 items-center gap-1 font-mono text-[7.5px] uppercase tracking-[.08em]", h.status === "delivered" ? "text-[var(--good)]" : "text-[var(--bad)]")}>
                      {h.status} <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* BELOW: timeline + event log */}
        <section aria-label="Transmission timeline and event log" className="rounded-2xl border border-[var(--line)] bg-white/[.02] p-4 lg:col-span-3">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:gap-6">
            <div>
              <p className="data-label">Transmission timeline</p>
              <ol className="mt-2.5 grid gap-0.5 sm:grid-cols-2">
                {STAGES.map((s, i) => {
                  const done = status === "delivered" || (status !== "idle" && i < stage);
                  const active = (status === "running" || status === "paused") && i === stage;
                  const failed = status === "failed" && failedAt === i;
                  return (
                    <li key={s.label} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5", active && "bg-[var(--cyan)]/[.07]")}>
                      <span className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                        done ? "border-[var(--good)]/40 bg-[var(--good)]/[.1] text-[var(--good)]" : active ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/[.1] text-[var(--cyan)]" : failed ? "border-[var(--bad)]/50 bg-[var(--bad)]/[.1] text-[var(--bad)]" : "border-[var(--line)] text-[var(--subtle)]",
                      )}>
                        {done ? <Check className="h-2.5 w-2.5" /> : failed ? <AlertTriangle className="h-2.5 w-2.5" /> : <Circle className="h-2 w-2" />}
                      </span>
                      <span className={cn("truncate text-[10.5px]", active ? "font-semibold text-[var(--text)]" : done || failed ? "text-[var(--muted)]" : "text-[var(--subtle)]")}>
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <p className="data-label">Transmission event log</p>
                <span className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Simulated events</span>
              </div>
              <div ref={logRef} className="mt-2.5 h-[148px] overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-2.5 [scrollbar-width:thin]" aria-live="polite">
                <ul className="space-y-1.5">
                  {log.map((e, i) => (
                    <li key={`${e.time}-${i}`} className="flex gap-2 text-[9.5px] leading-4">
                      <span className="shrink-0 font-mono tabular-nums text-[var(--subtle)]">{e.time}</span>
                      <span className={cn(e.kind === "ok" ? "text-[var(--good)]" : e.kind === "error" ? "text-[var(--bad)]" : "text-[var(--muted)]")}>
                        {e.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {status === "failed" && failedAt != null && (
        <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/[.07] px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bad)]" />
          <p className="text-[11px] leading-5 text-[var(--muted)]">
            <span className="font-semibold text-[var(--bad)]">Transmission failed at â€œ{STAGES[failedAt].label}â€.</span>{" "}
            Cause: {NODE_LABELS[STAGES[failedAt].node]} is disconnected.
            <button type="button" onClick={reconnectAll} className="ml-1.5 font-semibold text-[var(--bad)] underline underline-offset-2">
              Restore connectivity
            </button>
            , then press Send Message to retry.
          </p>
        </div>
      )}
    </div>
  );
}
