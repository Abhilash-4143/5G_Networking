import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Cable,
  CheckCircle2,
  History,
  MessageSquare,
  Pause,
  Play,
  PlugZap,
  RadioTower,
  RotateCcw,
  Send,
  Server,
  ShieldCheck,
  Signal,
  Smartphone,
  Timer,
  Trash2,
  Unplug,
  Waves,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, Stat, StatusPill } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { SegmentedControl, SliderField } from "@/components/ui/Controls";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";
import { useLocalStorage } from "@/lib/storage";

type SimStatus = "idle" | "running" | "paused" | "done" | "failed";
type LogType = "info" | "success" | "warn" | "error" | "data";
type Congestion = "good" | "moderate" | "poor";

type LogEntry = { id: number; time: string; type: LogType; msg: string };
type HistoryEntry = { text: string; outcome: "delivered" | "failed"; time: string };

function cn(...inputs: Array<string | number | null | false | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

function pad(n: number, l = 2) {
  return String(n).padStart(l, "0");
}

function formatTimestamp(d = new Date()) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

const DEFAULT_MESSAGE = "Hello from Smartphone A — testing the simulated 5G path.";

const STAGES = [
  { title: "Smartphone A creates message", detail: "The user composes and queues a message on Device A.", baseMs: 520, icon: Smartphone },
  { title: "Device prepares data", detail: "Payload is formatted and encrypted before transmission.", baseMs: 680, icon: Zap },
  { title: "Radio signal to base station", detail: "Uplink radio slots are scheduled toward the gNB.", baseMs: 920, icon: Signal },
  { title: "Base station processes", detail: "The gNB decodes, schedules, and converts radio to IP.", baseMs: 640, icon: RadioTower },
  { title: "Data through backhaul", detail: "Traffic crosses the fiber backhaul to the core site.", baseMs: 820, icon: Cable },
  { title: "Core authenticates & routes", detail: "Session is verified and routed toward the service.", baseMs: 940, icon: ShieldCheck },
  { title: "Messaging server processes", detail: "The server validates and prepares delivery to Device B.", baseMs: 700, icon: Server },
  { title: "Smartphone B receives", detail: "Device B renders the delivered message bubble.", baseMs: 600, icon: Smartphone },
] as const;

const CONGESTION_MULTIPLIER: Record<Congestion, number> = {
  good: 0.85,
  moderate: 1.15,
  poor: 1.6,
};

function stageDuration(idx: number, latency: number, loss: number, devices: number, congestion: Congestion) {
  const base = STAGES[idx].baseMs;
  const latencyScale = 0.6 + latency / 200;
  const congestionScale = CONGESTION_MULTIPLIER[congestion];
  const deviceScale = 1 + (devices - 1) * 0.03;
  const lossScale = 1 + loss / 40;
  const total = Math.min(4, latencyScale * congestionScale * deviceScale * lossScale);
  return Math.round(Math.min(3500, Math.max(280, base * total)));
}

function linePoint(x1: number, y1: number, x2: number, y2: number, t: number) {
  return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
}

function quadPoint(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, t: number) {
  const u = 1 - t;
  return { x: u * u * x1 + 2 * u * t * cx + t * t * x2, y: u * u * y1 + 2 * u * t * cy + t * t * y2 };
}

const LOG_COLOR: Record<LogType, string> = {
  info: "text-[var(--cyan)]",
  success: "text-[var(--good)]",
  warn: "text-[var(--warn)]",
  error: "text-[var(--bad)]",
  data: "text-[var(--violet)]",
};

export default function SimulatorPage() {
  usePageMeta({
    title: "Message Simulator",
    description:
      "A flagship interactive simulation that traces one synthetic message through a 5G path: smartphone, base station, backhaul, core, and delivery — with latency, loss, and failure controls.",
  });

  const [status, setStatus] = useState<SimStatus>("idle");
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageElapsed, setStageElapsed] = useState(0);
  const [baseConnected, setBaseConnected] = useState(true);
  const [latencyMs, setLatencyMs] = useState(60);
  const [lossPct, setLossPct] = useState(2);
  const [deviceCount, setDeviceCount] = useState(6);
  const [congestion, setCongestion] = useState<Congestion>("good");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sentText, setSentText] = useState<string | null>(null);
  const [deliveredText, setDeliveredText] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("simulator-history", []);
  const [attempts, setAttempts] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [retries, setRetries] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);
  const [jitterMs, setJitterMs] = useState(0);
  const [packetT, setPacketT] = useState(0);

  const logIdRef = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);
  const retryRef = useRef(0);
  const statusRef = useRef<SimStatus>(status);
  const stageRef = useRef(currentStage);
  const lossRef = useRef(lossPct);
  const baseConnectedRef = useRef(baseConnected);
  const sentTextRef = useRef(sentText);

  useEffect(() => {
    statusRef.current = status;
    stageRef.current = currentStage;
    lossRef.current = lossPct;
    baseConnectedRef.current = baseConnected;
    sentTextRef.current = sentText;
  }, [status, currentStage, lossPct, baseConnected, sentText]);

  const addLog = useCallback((type: LogType, msg: string) => {
    const id = logIdRef.current;
    logIdRef.current += 1;
    setLogs((prev) => [...prev.slice(-119), { id, time: formatTimestamp(), type, msg }]);
  }, []);

  useEffect(() => {
    addLog("info", "Simulator initialized — synthetic 5G environment ready. No real network is used.");
  }, [addLog]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const stageDurations = useMemo(
    () => STAGES.map((_, i) => stageDuration(i, latencyMs, lossPct, deviceCount, congestion)),
    [latencyMs, lossPct, deviceCount, congestion],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setJitterMs((Math.random() * 2 - 1) * latencyMs * 0.18);
    }, 1100);
    return () => window.clearInterval(id);
  }, [latencyMs]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPacketT((t) => (t + 0.045) % 1);
    }, 50);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const notes = [
      "Radio link scheduled — uplink grant issued (synthetic)",
      "Base station scheduler tick — slot allocated",
      "Backhaul keepalive acknowledged",
      "Core session heartbeat (synthetic)",
    ];
    let i = 0;
    const id = window.setInterval(() => {
      if (stageRef.current < 0) {
        addLog("info", notes[i % notes.length]);
        i += 1;
      }
    }, 2800);
    return () => window.clearInterval(id);
  }, [status, addLog]);

  useEffect(() => {
    if (status !== "running" || currentStage < 0 || currentStage >= STAGES.length) return;
    const duration = stageDurations[currentStage];
    const timer = window.setInterval(() => {
      elapsedRef.current += 50;
      setStageElapsed(elapsedRef.current);

      if (baseConnectedRef.current === false) {
        setFailure(
          "Transmission aborted: the 5G base station and its radio link went down mid-flight. No uplink path exists, so the message cannot leave the access network. Press “Restore connection” to repair the base station, then send again.",
        );
        setStatus("failed");
        setCurrentStage(-1);
        elapsedRef.current = 0;
        setStageElapsed(0);
        addLog("error", "Transmission aborted — base station / radio link unreachable");
        setHistory((h) =>
          [...h, { text: sentTextRef.current ?? DEFAULT_MESSAGE, outcome: "failed" as const, time: formatTimestamp() }].slice(-20),
        );
        return;
      }

      if (elapsedRef.current < duration) return;
      const stage = stageRef.current;
      const shouldDrop = Math.random() * 100 < lossRef.current && retryRef.current < 2;
      if (shouldDrop) {
        retryRef.current += 1;
        setRetries((r) => r + 1);
        elapsedRef.current = 0;
        setStageElapsed(0);
        addLog(
          "warn",
          `Packet drop at stage ${stage + 1}/8 (${STAGES[stage].title}) — retry ${retryRef.current} (simulated loss ${lossRef.current}%)`,
        );
        return;
      }
      if (retryRef.current > 0) {
        addLog("success", `Retransmission succeeded at stage ${stage + 1}/8 after ${retryRef.current} ${retryRef.current === 1 ? "retry" : "retries"}`);
        retryRef.current = 0;
      }
      if (stage >= STAGES.length - 1) {
        setCurrentStage(8);
        setStatus("done");
        setDeliveredText(sentTextRef.current);
        setSuccesses((s) => s + 1);
        elapsedRef.current = 0;
        setStageElapsed(0);
        addLog("success", "Message delivered to Smartphone B — end-to-end synthetic delivery complete");
        setHistory((h) =>
          [...h, { text: sentTextRef.current ?? DEFAULT_MESSAGE, outcome: "delivered" as const, time: formatTimestamp() }].slice(-20),
        );
      } else {
        const next = stage + 1;
        setCurrentStage(next);
        elapsedRef.current = 0;
        setStageElapsed(0);
        addLog("info", `Stage ${next + 1}/8 — ${STAGES[next].title} started`);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [status, currentStage, stageDurations, addLog, setHistory]);

  const handleStart = () => {
    if (status === "running") return;
    if (!baseConnected) addLog("warn", "Starting with base station disconnected — sends will fail until restored");
    setStatus("running");
    addLog("info", "Simulation started — ambient radio scheduling active (synthetic)");
  };

  const handlePause = () => {
    if (status !== "running") return;
    setStatus("paused");
    addLog("warn", "Simulation paused — stage timers frozen");
  };

  const handleResume = () => {
    if (status !== "paused") return;
    setStatus("running");
    addLog("info", "Simulation resumed");
  };

  const handleReset = () => {
    setStatus("idle");
    setCurrentStage(-1);
    elapsedRef.current = 0;
    setStageElapsed(0);
    retryRef.current = 0;
    setSentText(null);
    setDeliveredText(null);
    setFailure(null);
    setAttempts(0);
    setSuccesses(0);
    setRetries(0);
    addLog("info", "Simulation reset — stages, bubbles, and counters cleared");
  };

  const handleSend = () => {
    const text = message.trim() || DEFAULT_MESSAGE;
    if (currentStage >= 0 && currentStage < STAGES.length) return;
    if (!baseConnected) {
      setSentText(text);
      setDeliveredText(null);
      setAttempts((a) => a + 1);
      setFailure(
        "Send failed: the 5G base station / radio link is disconnected, so the radio uplink cannot leave Smartphone A. The access network has no path to the core. Press “Restore connection” to repair the base station, then resend the message.",
      );
      setStatus("failed");
      addLog("error", "Send failed — base station / radio link disconnected. Message was not transmitted.");
      setHistory((h) => [...h, { text, outcome: "failed" as const, time: formatTimestamp() }].slice(-20));
      return;
    }
    setFailure(null);
    setSentText(text);
    setDeliveredText(null);
    setAttempts((a) => a + 1);
    retryRef.current = 0;
    elapsedRef.current = 0;
    setStageElapsed(0);
    setCurrentStage(0);
    setStatus("running");
    addLog("data", `Message queued on Smartphone A: "${text}"`);
    addLog("info", `Stage 1/8 — ${STAGES[0].title} started`);
  };

  const handleDisconnect = () => {
    if (!baseConnected) return;
    setBaseConnected(false);
    setFailure(
      "Base station disconnected: the 5G base station and its radio link are down. Uplink radio access, scheduling, and downlink delivery are unavailable until the site is restored. This is a simulated fault — no real network is affected.",
    );
    addLog("error", "Base station disconnected — radio link down (failure simulation)");
  };

  const handleRestore = () => {
    if (baseConnected) return;
    setBaseConnected(true);
    setFailure(null);
    addLog("success", "Base station restored — radio link re-established (synthetic)");
    if (statusRef.current === "failed") setStatus("running");
  };

  const connection = useMemo(() => {
    if (!baseConnected) return { label: "Failed", tone: "bad" as const };
    if (lossPct >= 12 || congestion === "poor" || latencyMs >= 250) return { label: "Degraded", tone: "warn" as const };
    return { label: "Connected", tone: "good" as const };
  }, [baseConnected, lossPct, congestion, latencyMs]);

  const simLatency = useMemo(() => {
    if (!baseConnected) return 0;
    const cong = CONGESTION_MULTIPLIER[congestion];
    const dev = 1 + (deviceCount - 1) * 0.03;
    return Math.max(4, Math.round(latencyMs * cong * dev + jitterMs + 9));
  }, [baseConnected, latencyMs, congestion, deviceCount, jitterMs]);

  const deliveryPct = attempts === 0 ? Math.max(0, 100 - lossPct) : Math.round((successes / attempts) * 100);

  const activeDuration = currentStage >= 0 && currentStage < 8 ? stageDurations[currentStage] : 1;
  const stageFraction = currentStage >= 0 && currentStage < 8 ? Math.min(1, stageElapsed / Math.max(1, activeDuration)) : 0;
  const progressPct =
    status === "done" ? 100 : currentStage < 0 ? 0 : Math.min(100, ((currentStage + stageFraction) / STAGES.length) * 100);

  const isTransmitting = currentStage >= 0 && currentStage < STAGES.length;

  const activeNodes = useMemo(() => {
    const map: Record<number, string[]> = {
      0: ["phoneA"],
      1: ["phoneA"],
      2: ["phoneA", "base"],
      3: ["base"],
      4: ["base", "core"],
      5: ["core", "auth"],
      6: ["core", "msg"],
      7: ["msg", "phoneB"],
    };
    if (currentStage < 0 || currentStage >= 8) return new Set<string>();
    return new Set(map[currentStage] ?? []);
  }, [currentStage]);

  function activePathFor(stage: number): string | null {
    if (stage === 2) return "radio";
    if (stage === 4) return "backhaul";
    if (stage === 5) return "auth";
    if (stage === 6) return "coreMsg";
    if (stage === 7) return "msgB";
    return null;
  }
  const activePath = isTransmitting ? activePathFor(currentStage) : null;

  const ambientDots = (pathId: string, offset: number) => {
    const t = (packetT + offset) % 1;
    if (pathId === "radio") return quadPoint(110, 190, 200, 100, 252, 138, t);
    if (pathId === "backhaul") return linePoint(308, 155, 452, 180, t);
    if (pathId === "auth") return linePoint(490, 218, 490, 292, t);
    if (pathId === "coreMsg") return linePoint(528, 190, 642, 190, t);
    return linePoint(718, 190, 782, 190, t);
  };

  function nodeStyle(id: string) {
    const failed = id === "base" && !baseConnected;
    const active = activeNodes.has(id);
    return {
      stroke: failed ? "var(--bad)" : active ? "var(--cyan)" : "var(--good)",
      fill: failed ? "rgba(255,113,128,.10)" : active ? "rgba(67,217,255,.10)" : "rgba(62,230,164,.06)",
      strokeWidth: active || failed ? 1.6 : 1.1,
    };
  }

  const stageTitle = isTransmitting
    ? STAGES[currentStage].title
    : status === "done"
      ? "Delivered"
      : status === "failed"
        ? "Failed"
        : status === "paused"
          ? "Paused"
          : "Idle";

  return (
    <>
      <PageHeader
        index="04"
        eyebrow="Simulator"
        title={
          <>
            One message. <span className="text-gradient">Eight hops.</span>
          </>
        }
        description="Send a synthetic message from Smartphone A to Smartphone B and watch it cross the radio link, backhaul, core, and messaging service. Every value on this page is simulated — no real network is contacted."
        badges={["Synthetic lab", "Client-side only"]}
        aside={
          <div className="glass-panel overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Simulation snapshot</span>
              <StatusPill label={connection.label} tone={connection.tone} pulse={status === "running"} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Sim. latency</p>
                <p className="mt-1 text-[13px] font-medium text-[var(--text)]">
                  {baseConnected ? `${simLatency} ms` : "—"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Sim. delivery</p>
                <p className="mt-1 text-[13px] font-medium text-[var(--text)]">{deliveryPct}%</p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Devices</p>
                <p className="mt-1 text-[13px] font-medium text-[var(--text)]">{deviceCount} simulated</p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Progress</p>
                <p className="mt-1 text-[13px] font-medium text-[var(--text)]">{Math.round(progressPct)}%</p>
              </div>
            </div>
            <div className="mt-5 border-t border-[var(--line)] pt-3.5">
              <p className="text-[9.5px] leading-4 text-[var(--subtle)]">
                All figures are synthetic estimates derived from your sliders plus jitter — not measurements.
              </p>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <div className="dark-workspace p-3 sm:p-5 lg:p-6">
        <SectionReveal>
          <Panel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--cyan)]/20 bg-[var(--cyan)]/[.06] text-[var(--cyan)]">
                  <Activity className="h-3.5 w-3.5" />
                </span>
                <span className="text-[12.5px] font-semibold text-[var(--text)]">Simulation controls</span>
                <span className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">
                  Synthetic
                </span>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">
                <Waves className="h-3 w-3" /> Network conditions
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={handleStart} disabled={status === "running"} iconLeft={<Play className="h-3.5 w-3.5" />}>
                Start
              </Button>
              <Button variant="secondary" size="sm" onClick={handlePause} disabled={status !== "running"} iconLeft={<Pause className="h-3.5 w-3.5" />}>
                Pause
              </Button>
              <Button variant="secondary" size="sm" onClick={handleResume} disabled={status !== "paused"} iconLeft={<Zap className="h-3.5 w-3.5" />}>
                Resume
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={status === "idle" && currentStage < 0} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>
                Reset
              </Button>
              <Button variant="primary" size="sm" onClick={handleSend} disabled={isTransmitting} iconLeft={<Send className="h-3.5 w-3.5" />}>
                Send message
              </Button>
              <span className="mx-1 hidden h-6 w-px self-center bg-[var(--line-strong)] sm:block" aria-hidden />
              <Button variant="danger" size="sm" onClick={handleDisconnect} disabled={!baseConnected} iconLeft={<Unplug className="h-3.5 w-3.5" />}>
                Simulate failure
              </Button>
              <Button variant="secondary" size="sm" onClick={handleRestore} disabled={baseConnected} iconLeft={<PlugZap className="h-3.5 w-3.5" />}>
                Restore connection
              </Button>
            </div>

            <div className="mt-6 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <SliderField
                label="Simulated latency"
                value={latencyMs}
                min={0}
                max={400}
                step={5}
                unit="ms"
                onChange={setLatencyMs}
                hint="Base round-trip budget; jitter is added on top."
                accent="cyan"
              />
              <SliderField
                label="Packet loss"
                value={lossPct}
                min={0}
                max={30}
                step={1}
                unit="%"
                onChange={setLossPct}
                hint="Random drops cause logged retries."
                accent="warn"
              />
              <SliderField
                label="Simulated devices"
                value={deviceCount}
                min={1}
                max={20}
                step={1}
                unit=""
                onChange={setDeviceCount}
                hint="More devices add queueing delay."
                accent="violet"
              />
              <div className="space-y-2.5">
                <p className="text-[11.5px] font-semibold text-[var(--text)]">Congestion</p>
                <SegmentedControl<Congestion>
                  label="Network conditions"
                  value={congestion}
                  onChange={setCongestion}
                  size="sm"
                  options={[
                    { value: "good", label: "Good" },
                    { value: "moderate", label: "Moderate" },
                    { value: "poor", label: "Poor" },
                  ]}
                />
                <p className="text-[10.5px] leading-4 text-[var(--subtle)]">Scales every stage timer.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-[var(--line)] pt-6 sm:flex-row">
              <label className="sr-only" htmlFor="sim-message">Message text</label>
              <input
                id="sim-message"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder={DEFAULT_MESSAGE}
                maxLength={140}
                className="min-w-0 flex-1 rounded-xl border border-[var(--line-strong)] bg-[var(--bg-deep)]/60 px-4 py-3 text-[13px] text-[var(--text)] placeholder:text-[var(--subtle)] focus:border-[var(--cyan)] focus:outline-none"
              />
              <Button variant="primary" onClick={handleSend} disabled={isTransmitting} iconLeft={<Send className="h-3.5 w-3.5" />}>
                Send
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-[var(--subtle)]">Typing and pressing Send starts the 8-stage workflow. Results are synthetic.</p>
          </Panel>
        </SectionReveal>

        <AnimatePresence>
          {failure && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="mt-5 rounded-2xl border border-[var(--bad)]/30 bg-[var(--bad)]/[.07] p-4 sm:p-5"
              role="alert"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/10 text-[var(--bad)]">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[var(--text)]">Send failed — component: 5G base station / radio link</p>
                  <p className="mt-1.5 text-[12px] leading-5 text-[var(--muted)]">{failure}</p>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={handleRestore} iconLeft={<PlugZap className="h-3.5 w-3.5" />}>
                      Restore connection
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setFailure(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SectionReveal delay={0.05}>
          <Panel className="mt-5 overflow-hidden p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Eyebrow>Simulation environment</Eyebrow>
                <p className="mt-1.5 text-[11px] text-[var(--subtle)]">Animated synthetic topology — green healthy, red failed, cyan active.</p>
              </div>
              <StatusPill label={status === "running" ? "Running" : status} tone={status === "failed" ? "bad" : status === "running" ? "good" : "neutral"} pulse={status === "running"} />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50">
              <div className="min-w-[640px]">
                <svg viewBox="0 0 880 400" className="block w-full" role="img" aria-label="Synthetic 5G path from Smartphone A through base station, backhaul, core, and messaging server to Smartphone B">
                  {/* paths */}
                  <path d="M110 190 Q200 100 252 138" fill="none" strokeWidth={activePath === "radio" ? 2.4 : 1.4} strokeDasharray="4 6" className="stage-path" style={{ stroke: activePath === "radio" ? "var(--cyan)" : "var(--line-strong)" }} />
                  <line x1={308} y1={155} x2={452} y2={180} strokeWidth={activePath === "backhaul" ? 2.4 : 1.4} strokeDasharray="4 6" className="stage-path" style={{ stroke: activePath === "backhaul" ? "var(--cyan)" : "var(--line-strong)" }} />
                  <line x1={490} y1={218} x2={490} y2={292} strokeWidth={activePath === "auth" ? 2.4 : 1.4} strokeDasharray="4 6" className="stage-path" style={{ stroke: activePath === "auth" ? "var(--cyan)" : "var(--line-strong)" }} />
                  <line x1={528} y1={190} x2={642} y2={190} strokeWidth={activePath === "coreMsg" ? 2.4 : 1.4} strokeDasharray="4 6" className="stage-path" style={{ stroke: activePath === "coreMsg" ? "var(--cyan)" : "var(--line-strong)" }} />
                  <line x1={718} y1={190} x2={782} y2={190} strokeWidth={activePath === "msgB" ? 2.4 : 1.4} strokeDasharray="4 6" className="stage-path" style={{ stroke: activePath === "msgB" ? "var(--cyan)" : "var(--line-strong)" }} />

                  {/* ambient + active packets */}
                  {["radio", "backhaul", "auth", "coreMsg", "msgB"].map((pathId, pi) => {
                    const p1 = ambientDots(pathId, (pi * 0.37) % 1);
                    const p2 = ambientDots(pathId, (pi * 0.37 + 0.5) % 1);
                    const isActivePath = activePath === pathId;
                    return (
                      <g key={pathId}>
                        <circle cx={p1.x} cy={p1.y} r={2.2} style={{ fill: isActivePath ? "var(--cyan)" : status === "running" ? "var(--good)" : "var(--muted)", opacity: status === "idle" ? 0.35 : 0.75 }} />
                        <circle cx={p2.x} cy={p2.y} r={2.2} style={{ fill: isActivePath ? "var(--cyan)" : status === "running" ? "var(--good)" : "var(--muted)", opacity: status === "idle" ? 0.35 : 0.75 }} />
                        {isActivePath && <circle cx={p1.x} cy={p1.y} r={6} fill="none" strokeWidth={1.4} className="animate-pulse" style={{ stroke: "var(--cyan)" }} />}
                        {isActivePath && <circle cx={p1.x} cy={p1.y} r={4} style={{ fill: "var(--cyan)" }} />}
                      </g>
                    );
                  })}

                  {/* backhaul label */}
                  <text x={380} y={150} textAnchor="middle" fontSize={9} letterSpacing={1.2} style={{ fill: "var(--subtle)", fontFamily: "ui-monospace, monospace" }}>
                    BACKHAUL
                  </text>

                  {/* device dots around phone A */}
                  {Array.from({ length: deviceCount }).map((_, i) => {
                    const col = i % 5;
                    const row = Math.floor(i / 5);
                    return (
                      <circle key={i} cx={34 + col * 9} cy={268 + row * 9} r={2.4} style={{ fill: baseConnected ? "var(--good)" : "var(--bad)", opacity: 0.7 }} />
                    );
                  })}

                  {/* Smartphone A */}
                  <g>
                    <rect x={44} y={158} width={72} height={64} rx={12} {...nodeStyle("phoneA")} />
                    <rect x={62} y={166} width={36} height={40} rx={4} style={{ stroke: "var(--line-strong)", fill: "transparent" }} />
                    <text x={80} y={238} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: "var(--text)" }}>
                      Smartphone A
                    </text>
                    <text x={80} y={250} textAnchor="middle" fontSize={8} style={{ fill: "var(--subtle)" }}>
                      Sender UE
                    </text>
                    <circle cx={80} cy={212} r={3} style={{ fill: nodeStyle("phoneA").stroke }} />
                  </g>

                  {/* Base station */}
                  <g>
                    <path d="M280 105 264 200h32Z" {...nodeStyle("base")} />
                    <line x1={280} y1={105} x2={280} y2={80} style={{ stroke: "var(--muted)" }} strokeWidth={2} />
                    <circle cx={280} cy={76} r={4} style={{ fill: nodeStyle("base").stroke }} />
                    <path d="M258 118c-12 8-19 20-21 35" fill="none" strokeWidth={1.4} style={{ stroke: nodeStyle("base").stroke, opacity: 0.6 }} />
                    <path d="M302 118c12 8 19 20 21 35" fill="none" strokeWidth={1.4} style={{ stroke: nodeStyle("base").stroke, opacity: 0.6 }} />
                    <text x={280} y={222} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: "var(--text)" }}>
                      5G Base Station
                    </text>
                    <text x={280} y={234} textAnchor="middle" fontSize={8} style={{ fill: "var(--subtle)" }}>
                      gNB + Antenna {baseConnected ? "· healthy" : "· DISCONNECTED"}
                    </text>
                  </g>

                  {/* Core */}
                  <g>
                    <rect x={448} y={158} width={84} height={60} rx={12} {...nodeStyle("core")} />
                    <text x={490} y={184} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: "var(--text)" }}>
                      Core Network
                    </text>
                    <text x={490} y={198} textAnchor="middle" fontSize={8} style={{ fill: "var(--subtle)" }}>
                      5GC routing
                    </text>
                    <circle cx={490} cy={208} r={3} style={{ fill: nodeStyle("core").stroke }} />
                  </g>

                  {/* Auth */}
                  <g>
                    <rect x={440} y={294} width={100} height={54} rx={12} {...nodeStyle("auth")} />
                    <text x={490} y={318} textAnchor="middle" fontSize={9} fontWeight={600} style={{ fill: "var(--text)" }}>
                      Auth Service
                    </text>
                    <text x={490} y={332} textAnchor="middle" fontSize={8} style={{ fill: "var(--subtle)" }}>
                      Verify + session
                    </text>
                  </g>

                  {/* Messaging server */}
                  <g>
                    <rect x={644} y={158} width={74} height={64} rx={12} {...nodeStyle("msg")} />
                    <text x={681} y={186} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: "var(--text)" }}>
                      Messaging
                    </text>
                    <text x={681} y={200} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: "var(--text)" }}>
                      Server
                    </text>
                    <circle cx={681} cy={210} r={3} style={{ fill: nodeStyle("msg").stroke }} />
                  </g>

                  {/* Smartphone B */}
                  <g>
                    <rect x={786} y={158} width={72} height={64} rx={12} {...nodeStyle("phoneB")} />
                    <rect x={802} y={166} width={40} height={40} rx={4} style={{ stroke: "var(--line-strong)", fill: "transparent" }} />
                    <text x={822} y={238} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: "var(--text)" }}>
                      Smartphone B
                    </text>
                    <text x={822} y={250} textAnchor="middle" fontSize={8} style={{ fill: "var(--subtle)" }}>
                      Receiver UE
                    </text>
                    <circle cx={822} cy={212} r={3} style={{ fill: status === "done" ? "var(--good)" : nodeStyle("phoneB").stroke }} />
                  </g>
                </svg>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-[var(--subtle)]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--good)" }} /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--cyan)" }} /> Active path</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--bad)" }} /> Failed</span>
              <span className="ml-auto font-mono text-[8px] uppercase tracking-[.1em]">Synthetic topology — packet dots are illustrative</span>
            </div>

            {/* stage tracker */}
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {STAGES.map((s, i) => {
                  const done = status === "done" || currentStage > i;
                  const active = isTransmitting && currentStage === i;
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex min-w-0 flex-col items-center text-center">
                      <span
                        className={cn(
                          "relative grid h-9 w-9 place-items-center rounded-xl border transition-all",
                          active
                            ? "border-[var(--cyan)] bg-[var(--cyan)]/[.12] text-[var(--cyan)] shadow-[0_0_22px_-6px_rgba(67,217,255,.6)]"
                            : done
                              ? "border-[var(--good)]/40 bg-[var(--good)]/[.08] text-[var(--good)]"
                              : "border-[var(--line)] bg-white/[.02] text-[var(--subtle)]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {done && <CheckCircle2 className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 bg-[var(--bg-deep)] rounded-full" />}
                      </span>
                      <span className="mt-2 font-mono text-[8px] text-[var(--subtle)]">0{i + 1}</span>
                      <span className={cn("mt-0.5 line-clamp-2 max-w-full text-[8.5px] font-semibold leading-tight sm:text-[9px]", active || done ? "text-[var(--text)]" : "text-[var(--subtle)]")}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[.05]">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--blue))]"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.2, ease: "linear" }}
                />
              </div>
              <p className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">
                <span>Transmission progress (simulated)</span>
                <span className="tabular-nums text-[var(--cyan)]">{Math.round(progressPct)}%</span>
              </p>
            </div>
          </Panel>
        </SectionReveal>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <SectionReveal delay={0.05}>
            <Panel className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Eyebrow>Current stage</Eyebrow>
                  <p className="mt-1.5 text-[14px] font-semibold text-[var(--text)]">
                    {stageTitle}
                    {isTransmitting && <span className="ml-2 font-mono text-[9px] uppercase tracking-[.1em] text-[var(--cyan)]">Stage {currentStage + 1} / 8</span>}
                  </p>
                </div>
                <Timer className="h-4 w-4 text-[var(--cyan)]" />
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[var(--muted)]">
                {isTransmitting
                  ? STAGES[currentStage].detail
                  : status === "done"
                    ? "Delivery complete. The message bubble on Smartphone B is the synthetic result."
                    : status === "failed"
                      ? "The workflow halted. Restore the base station and send again to retry."
                      : status === "paused"
                        ? "Timers are frozen. Resume to continue from the current stage."
                        : "Idle. Press Send message to run the 8-stage workflow."}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Expected (sim.)</p>
                  <p className="mt-1 font-mono text-[12px] tabular-nums text-[var(--text)]">
                    {isTransmitting ? `${activeDuration} ms` : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Elapsed (sim.)</p>
                  <p className="mt-1 font-mono text-[12px] tabular-nums text-[var(--text)]">
                    {isTransmitting ? `${Math.round(stageElapsed)} ms` : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Retries</p>
                  <p className="mt-1 font-mono text-[12px] tabular-nums text-[var(--text)]">{retries}</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[.05]">
                <div className="h-full rounded-full bg-[var(--cyan)] transition-[width] duration-100" style={{ width: `${stageFraction * 100}%` }} />
              </div>
            </Panel>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <Panel className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Eyebrow>Simulated statistics</Eyebrow>
                  <p className="mt-1.5 text-[11px] text-[var(--subtle)]">Derived from settings + jitter. Synthetic.</p>
                </div>
                <StatusPill label={connection.label} tone={connection.tone} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <Stat
                  label="Sim. latency"
                  value={baseConnected ? simLatency : "—"}
                  unit={baseConnected ? "ms" : undefined}
                  hint={baseConnected ? `${latencyMs} ms base · ${congestion} congestion` : "Base station down"}
                  tone={simLatency > 250 ? "warn" : simLatency > 120 ? "warn" : "good"}
                />
                <Stat label="Packet delivery" value={`${deliveryPct}%`} hint="Simulated success rate" tone={deliveryPct >= 95 ? "good" : deliveryPct >= 80 ? "warn" : "bad"} />
                <Stat label="Attempts" value={`${attempts}`} hint={`${successes} delivered (sim.)`} />
                <Stat label="Progress" value={`${Math.round(progressPct)}%`} hint="8-stage workflow" />
              </div>
            </Panel>
          </SectionReveal>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SectionReveal delay={0.05}>
            <Panel className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--cyan)]/20 bg-[var(--cyan)]/[.06] text-[var(--cyan)]">
                  <Smartphone className="h-3.5 w-3.5" />
                </span>
                <span className="text-[12px] font-semibold text-[var(--text)]">Smartphone A — sent</span>
                <span className="ml-auto font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Simulated</span>
              </div>
              <div className="mt-5 min-h-[110px] rounded-2xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-4">
                {sentText ? (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[85%] rounded-xl rounded-br-md bg-[var(--cyan)] px-4 py-3 text-[12.5px] font-medium leading-5 text-[#04101f] shadow-[0_10px_28px_-14px_rgba(145,183,165,.5)]">
                    {sentText}
                    <p className="mt-1.5 text-right font-mono text-[8px] uppercase tracking-[.1em] text-[#03111b]/60">
                      {isTransmitting ? `Sending… stage ${currentStage + 1}/8` : status === "done" ? "Delivered (sim.)" : status === "failed" ? "Failed (sim.)" : "Sent (sim.)"}
                    </p>
                  </motion.div>
                ) : (
                  <p className="flex min-h-[78px] items-center justify-center text-center text-[11px] text-[var(--subtle)]">No message sent yet. Type above and press Send.</p>
                )}
              </div>
            </Panel>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <Panel className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--good)]/20 bg-[var(--good)]/[.06] text-[var(--good)]">
                  <MessageSquare className="h-3.5 w-3.5" />
                </span>
                <span className="text-[12px] font-semibold text-[var(--text)]">Smartphone B — delivered</span>
                <span className="ml-auto font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Simulated</span>
              </div>
              <div className="mt-5 min-h-[110px] rounded-2xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-4">
                {deliveredText ? (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-[85%] rounded-2xl rounded-bl-md border border-[var(--good)]/25 bg-[var(--good)]/[.08] px-4 py-3 text-[12.5px] leading-5 text-[var(--text)]">
                    {deliveredText}
                    <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--good)]">Delivered · simulated</p>
                  </motion.div>
                ) : (
                  <p className="flex min-h-[78px] items-center justify-center text-center text-[11px] text-[var(--subtle)]">
                    {isTransmitting ? "Waiting for delivery… watch the stages above." : "Waiting for delivery."}
                  </p>
                )}
              </div>
            </Panel>
          </SectionReveal>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <SectionReveal delay={0.05}>
            <Panel className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[var(--cyan)]" />
                  <span className="text-[11.5px] font-semibold text-[var(--text)]">Live event log</span>
                  <span className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Synthetic</span>
                </div>
                <span className="font-mono text-[9px] tabular-nums text-[var(--subtle)]">{logs.length} events</span>
              </div>
              <div ref={logRef} className="h-64 overflow-y-auto p-4 font-mono text-[11px] leading-5 sm:px-5" aria-live="polite">
                {logs.map((entry) => (
                  <div key={entry.id} className="flex gap-2.5 py-0.5">
                    <span className="shrink-0 tabular-nums text-[var(--subtle)]">[{entry.time}]</span>
                    <span className={cn("min-w-0 break-words", LOG_COLOR[entry.type])}>{entry.msg}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <Panel className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[var(--cyan)]" />
                  <span className="text-[11.5px] font-semibold text-[var(--text)]">Message history</span>
                  <span className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">Local</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setHistory([])} disabled={history.length === 0} iconLeft={<Trash2 className="h-3 w-3" />} className="h-8 px-2 text-[10px]">
                  Clear
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] text-[var(--subtle)]">Stored in localStorage, capped at 20 sessions.</p>
              <div className="mt-4 max-h-56 min-h-[120px] flex-1 space-y-2 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--line-strong)] px-3 py-5 text-center text-[11px] text-[var(--subtle)]">
                    No sessions yet. Sends and failures will appear here.
                  </p>
                ) : (
                  [...history].reverse().map((entry, i) => (
                    <div key={`${entry.time}-${i}`} className="rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2.5">
                      <p className="line-clamp-2 break-words text-[11px] leading-4 text-[var(--text)]">{entry.text}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusPill label={entry.outcome} tone={entry.outcome === "delivered" ? "good" : "bad"} className="scale-90" />
                        <span className="font-mono text-[8px] tabular-nums text-[var(--subtle)]">{entry.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </SectionReveal>
        </div>

        <p className="mt-6 rounded-xl border border-[var(--line)] bg-white/[.02] px-4 py-3 text-[10.5px] leading-5 text-[var(--subtle)]">
          <span className="font-mono text-[8.5px] uppercase tracking-[.12em] text-[var(--cyan)]">Simulation note · </span>
          All latencies, drops, deliveries, and topology movement are generated locally for learning. This page does not connect to any carrier, cloud, or real device.
        </p>
        </div>
      </div>
    </>
  );
}
