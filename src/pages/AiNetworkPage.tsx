import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Gauge,
  Pause,
  Play,
  RadioTower,
  RotateCcw,
  Router,
  Server,
  Thermometer,
  Zap,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, Stat, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SliderField, Toggle } from "@/components/ui/Controls";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";
import { useLocalStorage } from "@/lib/storage";

type Faults = {
  baseStation: boolean;
  overheating: boolean;
  surge: boolean;
  lossSpike: boolean;
};

type Telemetry = {
  traffic: number;
  latency: number;
  loss: number;
  temp: number;
  devices: number;
  health: number;
};

type AlertEntry = {
  id: string;
  time: string;
  title: string;
  severity: "warn" | "bad" | "info";
  action: string;
};

type EventEntry = {
  id: string;
  time: string;
  title: string;
};

const initialFaults: Faults = { baseStation: false, overheating: false, surge: false, lossSpike: false };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function HealthGauge({ value }: { value: number }) {
  const normalized = clamp(value, 0, 100);
  const color = normalized >= 85 ? "var(--good)" : normalized >= 60 ? "var(--warn)" : "var(--bad)";
  const r = 52;
  const circumference = Math.PI * r;
  const filled = (normalized / 100) * circumference;
  return (
    <div className="relative mx-auto h-28 w-40">
      <svg viewBox="0 0 140 80" className="h-full w-full" role="img" aria-label={`Network health ${normalized} of 100`}>
        <path d="M 18 74 A 52 52 0 0 1 122 74" fill="none" stroke="var(--line-strong)" strokeWidth="9" strokeLinecap="round" />
        <path
          d="M 18 74 A 52 52 0 0 1 122 74"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = Math.PI - (i / 5) * Math.PI;
          const x = 70 + Math.cos(angle) * 52;
          const y = 74 - Math.sin(angle) * 52;
          return <circle key={i} cx={x} cy={y} r="2" fill="var(--bg-deep)" stroke="var(--line-strong)" strokeWidth="1" />;
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-3xl font-medium tracking-[-.04em] text-[var(--text)]">{normalized}</p>
        <p className="mono-label">Health / 100</p>
      </div>
    </div>
  );
}

export default function AiNetworkPage() {
  usePageMeta({
    title: "AI-Assisted Network Operations",
    description:
      "Rule-based network operations sandbox. Not a real ML model. Inject faults, watch telemetry, and see deterministic alert rules suggest corrective actions.",
  });

  const [trafficTarget, setTrafficTarget] = useState(42);
  const [latencyTarget, setLatencyTarget] = useState(28);
  const [lossTarget, setLossTarget] = useState(0.8);
  const [faults, setFaults] = useState<Faults>(initialFaults);
  const [recovering, setRecovering] = useState(false);
  const [running, setRunning] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [telemetry, setTelemetry] = useState<Telemetry>({ traffic: 42, latency: 28, loss: 0.8, temp: 42, devices: 1240, health: 92 });
  const [history, setHistory] = useState<{ label: string; traffic: number; latency: number }[]>([]);
  const [alertHistory, setAlertHistory] = useLocalStorage<AlertEntry[]>("ai-network-alerts", []);
  const [events, setEvents] = useLocalStorage<EventEntry[]>("ai-network-events", []);

  function logEvent(title: string) {
    const entry: EventEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: new Date().toLocaleTimeString(), title };
    setEvents((prev) => [entry, ...prev].slice(0, 20));
  }

  function logAlert(title: string, severity: AlertEntry["severity"], action: string) {
    const entry: AlertEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: new Date().toLocaleTimeString(), title, severity, action };
    setAlertHistory((prev) => [entry, ...prev].slice(0, 20));
  }

  useEffect(() => {
    if (!running) return;
    const delay = reducedMotion ? 4000 : 1200;
    const id = window.setInterval(() => {
      setTelemetry((_prev) => {
        let intensity = faults.baseStation || faults.overheating || faults.surge || faults.lossSpike ? 1 : 0;
        if (recovering) intensity = Math.max(0, intensity - 0.2);
        const traffic = clamp(trafficTarget + (faults.surge ? 38 * intensity : 0) + (faults.baseStation ? -18 * intensity : 0) + (Math.random() - 0.5) * 5, 0, 100);
        const latency = clamp(latencyTarget + (faults.baseStation ? 64 * intensity : 0) + (faults.surge ? 22 * intensity : 0) + (Math.random() - 0.5) * 6, 4, 180);
        const loss = clamp(lossTarget + (faults.lossSpike ? 9 * intensity : 0) + (faults.baseStation ? 4 * intensity : 0) + (Math.random() - 0.5) * 0.4, 0, 30);
        const temp = clamp(42 + (faults.overheating ? 38 * intensity : 0) + traffic * 0.12 + (Math.random() - 0.5) * 2, 30, 95);
        const devices = Math.round(clamp(1240 - (faults.baseStation ? 460 * intensity : 0) + (faults.surge ? 180 * intensity : 0) + (Math.random() - 0.5) * 40, 100, 2200));
        const health = clamp(100 - (traffic > 85 ? (traffic - 85) * 1.4 : 0) - Math.max(0, latency - 80) * 0.45 - loss * 3.2 - Math.max(0, temp - 75) * 0.9 - (faults.baseStation ? 22 * intensity : 0), 0, 100);
        const label = new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
        setHistory((h) => [...h, { label, traffic: Math.round(traffic), latency: Math.round(latency) }].slice(-20));
        return { traffic: Math.round(traffic), latency: Math.round(latency), loss: Math.round(loss * 10) / 10, temp: Math.round(temp), devices, health: Math.round(health) };
      });
      if (recovering) {
        // Gradually clear flags when recovery completes
        setFaults((f) => {
          const anyFault = f.baseStation || f.overheating || f.surge || f.lossSpike;
          if (!anyFault) {
            setRecovering(false);
            return f;
          }
          return f;
        });
      }
    }, delay);
    return () => window.clearInterval(id);
  }, [running, reducedMotion, trafficTarget, latencyTarget, lossTarget, faults, recovering]);

  // Simpler recovery effect: after Run recovery, ease sliders toward normal over ticks
  useEffect(() => {
    if (!recovering) return;
    const id = window.setInterval(() => {
      setTrafficTarget((v) => Math.max(30, v - 4));
      setLatencyTarget((v) => Math.max(25, v - 4));
      setLossTarget((v) => Math.max(0.5, Math.round((v - 0.3) * 10) / 10));
      setFaults(() => {
        const next: Faults = { baseStation: false, overheating: false, surge: false, lossSpike: false };
        return next;
      });
      setRecovering((r) => {
        if (!r) return r;
        // stop after ~3 steps by checking target values via timeout below; here just stop after a few ticks using a counter
        return r;
      });
    }, reducedMotion ? 4000 : 1200);
    const stop = window.setTimeout(() => setRecovering(false), reducedMotion ? 12000 : 3600);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [recovering, reducedMotion]);

  const alerts = useMemo(() => {
    const list: AlertEntry[] = [];
    if (telemetry.latency > 80) list.push({ id: "r-latency", time: "now", title: `Latency ${telemetry.latency} ms exceeds 80 ms threshold`, severity: "bad", action: "Shift load to neighbour sector; inspect scheduler queue depth and backhaul congestion." });
    if (telemetry.loss > 5) list.push({ id: "r-loss", time: "now", title: `Packet loss ${telemetry.loss}% exceeds 5% threshold`, severity: "bad", action: "Check radio link quality, interference, and error counters." });
    if (telemetry.traffic > 85) list.push({ id: "r-traffic", time: "now", title: `Congestion: traffic load ${telemetry.traffic}% exceeds 85%`, severity: "warn", action: "Enable load balancing; defer non-urgent bulk traffic." });
    if (telemetry.temp > 75) list.push({ id: "r-temp", time: "now", title: `Overheating: equipment ${telemetry.temp}°C exceeds 75°C`, severity: "bad", action: "Reduce transmit power, verify cooling airflow, schedule thermal inspection." });
    if (faults.baseStation) list.push({ id: "r-bs", time: "now", title: "Base station failure injected", severity: "bad", action: "Fail over devices to adjacent sector; dispatch site technician." });
    return list;
  }, [telemetry, faults]);

  const overallTone = alerts.some((a) => a.severity === "bad") ? "bad" : alerts.length > 0 ? "warn" : "good";
  const overallLabel = overallTone === "good" ? "Nominal" : alerts.some((a) => a.severity === "bad") ? "Fault active" : "Attention";

  function injectFault(key: keyof Faults, title: string) {
    setFaults((f) => ({ ...f, [key]: true }));
    setRecovering(false);
    logEvent(`Fault injected: ${title}`);
    logAlert(title, "warn", "Fault injected by operator. Monitor telemetry and run recovery when ready.");
  }

  function runRecovery() {
    if (!faults.baseStation && !faults.overheating && !faults.surge && !faults.lossSpike) {
      logEvent("Recovery requested with no active faults");
      return;
    }
    setRecovering(true);
    logEvent("Recovery started: clearing faults gradually");
    logAlert("Recovery initiated", "info", "Faults are being cleared gradually. Telemetry easing toward nominal.");
  }

  function resetAll() {
    setTrafficTarget(42);
    setLatencyTarget(28);
    setLossTarget(0.8);
    setFaults(initialFaults);
    setRecovering(false);
    setHistory([]);
    logEvent("Simulation reset to baseline");
  }

  const nodes = [
    { name: "RAN", icon: RadioTower, detail: faults.baseStation ? "Sector down" : telemetry.latency > 80 ? "Degraded" : "Online", tone: faults.baseStation ? "bad" as const : telemetry.latency > 80 ? "warn" as const : "good" as const },
    { name: "Core", icon: Server, detail: "Session control nominal", tone: "good" as const },
    { name: "Backhaul", icon: Router, detail: telemetry.traffic > 85 ? "Congested" : "Online", tone: telemetry.traffic > 85 ? ("warn" as const) : ("good" as const) },
    { name: "Edge", icon: Cpu, detail: telemetry.temp > 75 ? "Thermal risk" : "Online", tone: telemetry.temp > 75 ? ("bad" as const) : ("good" as const) },
  ];

  return (
    <>
      <PageHeader
        index="08"
        eyebrow="AI Network"
        title={<>Operations sandbox: rule-based, <span className="text-gradient">not machine learning.</span></>}
        description="This sandbox emulates network telemetry and applies explicit threshold rules to raise alerts and suggest actions. It does not train, fine-tune, or run a machine-learning model, and it is not connected to any carrier network."
        badges={["Sandbox", "Rule engine", "Synthetic data"]}
        aside={
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Overall status</span>
              <StatusPill label={overallLabel} tone={overallTone === "good" ? "good" : overallTone === "warn" ? "warn" : "bad"} pulse={overallTone !== "good"} />
            </div>
            <HealthGauge value={telemetry.health} />
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4">
              <Stat label="Traffic" value={telemetry.traffic} unit="%" tone={telemetry.traffic > 85 ? "warn" : "cyan"} />
              <Stat label="Latency" value={telemetry.latency} unit="ms" tone={telemetry.latency > 80 ? "bad" : "cyan"} />
              <Stat label="Loss" value={telemetry.loss} unit="%" tone={telemetry.loss > 5 ? "bad" : "cyan"} />
              <Stat label="Devices" value={telemetry.devices.toLocaleString()} hint="Connected devices" />
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <div className="dark-workspace p-3 sm:p-5 lg:p-6">
        <InfoNote label="Explicit scope">
          This page demonstrates deterministic alert rules and suggested corrective actions. No real ML model is running, no real traffic is measured, and no production network is controlled.
        </InfoNote>

        <div className="mt-8 grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
          <SectionReveal>
            <Panel className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Eyebrow icon={<Gauge className="h-3.5 w-3.5" />}>Scenario controls</Eyebrow>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">Set baseline load, then inject faults. The rule engine judges the result.</p>
                </div>
                <Button size="sm" variant={running ? "quiet" : "primary"} onClick={() => setRunning((r) => !r)} iconLeft={running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}>
                  {running ? "Pause" : "Run"}
                </Button>
              </div>

              <div className="mt-6 space-y-5">
                <Toggle checked={running} onChange={setRunning} label="Live simulation" description={reducedMotion ? "Reduced-motion detected: updates every 4 s." : "Telemetry ticks every 1.2 s."} />
                <SliderField label="Baseline traffic load" value={trafficTarget} min={5} max={100} unit="%" onChange={setTrafficTarget} hint="Rule: above 85% triggers congestion warning." />
                <SliderField label="Baseline latency" value={latencyTarget} min={5} max={150} unit="ms" onChange={setLatencyTarget} hint="Rule: above 80 ms triggers latency alert." accent="warn" />
                <SliderField label="Baseline packet loss" value={lossTarget} min={0} max={15} step={0.1} unit="%" onChange={setLossTarget} hint="Rule: above 5% triggers loss alert." accent="bad" />
                <SliderField label="Equipment temperature" value={telemetry.temp} min={30} max={95} unit="°C" onChange={() => undefined} disabled hint="Temperature is derived from load and faults. Rule: above 75°C triggers overheat alert." accent="violet" />
              </div>

              <div className="mt-7 rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
                <p className="mono-label">Inject fault</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Button size="sm" variant="danger" onClick={() => injectFault("baseStation", "Base station failure")} disabled={faults.baseStation} iconLeft={<RadioTower className="h-3.5 w-3.5" />}>Base station failure</Button>
                  <Button size="sm" variant="danger" onClick={() => injectFault("overheating", "Equipment overheating")} disabled={faults.overheating} iconLeft={<Thermometer className="h-3.5 w-3.5" />}>Overheating</Button>
                  <Button size="sm" variant="danger" onClick={() => injectFault("surge", "Traffic surge")} disabled={faults.surge} iconLeft={<Zap className="h-3.5 w-3.5" />}>Traffic surge</Button>
                  <Button size="sm" variant="danger" onClick={() => injectFault("lossSpike", "Packet loss spike")} disabled={faults.lossSpike} iconLeft={<Activity className="h-3.5 w-3.5" />}>Packet loss spike</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={runRecovery} disabled={recovering} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>{recovering ? "Recovering…" : "Run recovery"}</Button>
                  <Button size="sm" variant="quiet" onClick={resetAll}>Reset baseline</Button>
                </div>
                <p className="mt-3 text-[10px] leading-4 text-[var(--subtle)]">Recovery clears faults gradually over several ticks rather than instantly.</p>
              </div>
            </Panel>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <div className="space-y-5">
              <Panel className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[var(--cyan)]" />
                    <span className="text-[12px] font-semibold text-[var(--text)]">Traffic + latency history</span>
                  </div>
                  <StatusPill label={running ? "Live" : "Paused"} tone={running ? "info" : "neutral"} pulse={running} />
                </div>
                <div className="mt-4 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} minTickGap={24} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="traffic" stroke="var(--cyan)" strokeWidth={2} dot={false} name="Traffic %" />
                      <Line type="monotone" dataKey="latency" stroke="var(--violet)" strokeWidth={2} dot={false} name="Latency ms" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {history.length === 0 && <p className="mt-2 text-[10px] text-[var(--subtle)]">No samples yet — press Run to generate synthetic telemetry.</p>}
              </Panel>

              <div className="grid gap-3 sm:grid-cols-2">
                {nodes.map((node) => (
                  <Panel key={node.name} className="p-4" hover>
                    <div className="flex items-center justify-between">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white/[.025] text-[var(--cyan)]">
                        <node.icon className="h-4 w-4" />
                      </span>
                      <StatusPill label={node.tone === "good" ? "Online" : node.tone === "warn" ? "Degraded" : "Down"} tone={node.tone} />
                    </div>
                    <p className="mt-3 text-[12px] font-semibold text-[var(--text)]">{node.name}</p>
                    <p className="mt-0.5 text-[10.5px] text-[var(--subtle)]">{node.detail}</p>
                  </Panel>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>

        <section className="mt-12">
          <SectionHeader eyebrow="Rule engine" title="Thresholds are explicit, so decisions are traceable." description="Each alert names the metric, the threshold, and a suggested action. No hidden model weights are involved." />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <SectionReveal>
              <Panel className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--warn)]" />
                  <span className="text-[12px] font-semibold">Active alerts ({alerts.length})</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {alerts.length === 0 ? (
                    <p className="rounded-lg border border-[var(--good)]/20 bg-[var(--good)]/[.06] px-3 py-3 text-[11px] text-[var(--muted)]">No alerts. All metrics are within thresholds.</p>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className="rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-3">
                        <p className="text-[11px] font-semibold text-[var(--text)]">{alert.title}</p>
                        <p className="mt-1 text-[10.5px] leading-4 text-[var(--muted)]">Suggested action: {alert.action}</p>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </SectionReveal>
            <SectionReveal delay={0.06}>
              <Panel className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <Eyebrow>Event timeline & alert history</Eyebrow>
                  <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">Stored locally · capped at 20</span>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mono-label">Timeline</p>
                    <ul className="mt-3 space-y-2">
                      {events.length === 0 && <li className="text-[10.5px] text-[var(--subtle)]">No events logged yet.</li>}
                      {events.map((event) => (
                        <li key={event.id} className="flex items-start gap-2 text-[10.5px] leading-4 text-[var(--muted)]">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--cyan)]" />
                          <span><span className="font-mono text-[8px] text-[var(--subtle)]">{event.time}</span><br />{event.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mono-label">Alert history</p>
                    <ul className="mt-3 space-y-2">
                      {alertHistory.length === 0 && <li className="text-[10.5px] text-[var(--subtle)]">No alert history yet.</li>}
                      {alertHistory.map((alert) => (
                        <li key={alert.id} className="rounded-lg border border-[var(--line)] bg-white/[.015] px-2.5 py-2 text-[10px] leading-4 text-[var(--muted)]">
                          <span className="font-mono text-[8px] text-[var(--subtle)]">{alert.time}</span>
                          <p className="font-semibold text-[var(--text)]">{alert.title}</p>
                          <p>{alert.action}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Panel>
            </SectionReveal>
          </div>
        </section>
        </div>
      </div>
    </>
  );
}
