import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Antenna,
  Battery,
  Check,
  Clock,
  Cpu,
  Play,
  Radio,
  RotateCcw,
  Router,
  Server,
  Thermometer,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, Stat, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SegmentedControl, SliderField, Toggle } from "@/components/ui/Controls";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";
import { cn } from "@/lib/cn";
import BaseStation3D from "@/components/viz/BaseStation3D";

type ComponentId = "antenna" | "rf" | "baseband" | "scheduler" | "backhaul" | "power" | "ducu";

type StationComponent = {
  id: ComponentId;
  code: string;
  name: string;
  alias: string;
  icon: typeof Antenna;
  functionText: string;
  principle: string;
  technical: string;
  connections: ComponentId[];
  readouts: [string, string][];
};

const COMPONENTS: StationComponent[] = [
  {
    id: "antenna",
    code: "01",
    name: "Antenna",
    alias: "64T64R phased array",
    icon: Antenna,
    functionText: "Transceives radio waves and shapes the beam toward active users. It is the only component that touches free space.",
    principle: "Each of the 64 elements is phase-shifted so their waves add constructively toward one direction. Connection: RF unit feeds it; power sustains its electronics.",
    technical: "3.5 GHz panel, 64T64R, EIRP 59 dBm, 8° beamwidth, MU-MIMO 16 layers. Phase coherence across elements enables spatial multiplexing and null-forming toward interferers.",
    connections: ["rf", "power"],
    readouts: [
      ["Array", "64T64R"],
      ["EIRP", "59 dBm"],
      ["Beamwidth", "8°"],
    ],
  },
  {
    id: "rf",
    code: "02",
    name: "RF unit",
    alias: "RRU / ORU",
    icon: Radio,
    functionText: "Amplifies, filters, and frequency-translates signals between antenna and baseband. It handles the analog boundary.",
    principle: "Low-noise amplification on receive, power amplification on transmit, with duplexing to share one band. Connection: antenna ↔ baseband path.",
    technical: "GaN power amplifier, 46 dBm / 40 W, ACLR < 45 dBc, digital predistortion to linearize PA. Duplexer isolation > 60 dB separates TX/RX on same spectrum.",
    connections: ["antenna", "baseband", "power"],
    readouts: [
      ["TX power", "46 dBm"],
      ["ACLR", "< 45 dBc"],
      ["Isolation", "> 60 dB"],
    ],
  },
  {
    id: "baseband",
    code: "03",
    name: "Baseband processing",
    alias: "BBU / DDU",
    icon: Cpu,
    functionText: "Converts radio samples into bits: FFT, modulation, channel coding, and protocol termination happen here.",
    principle: "DSP chain decodes OFDM symbols and runs LDPC error correction. Connection: exchanges IQ samples with RF, parameters with scheduler.",
    technical: "LDPC (5G NR), 2×2 MIMO detector, HARQ retransmission, < 3 ms processing budget. Acceleration on DSP / FPGA for FFT and coding at line rate.",
    connections: ["rf", "scheduler", "ducu", "power"],
    readouts: [
      ["Coding", "LDPC"],
      ["FFT", "4096-pt"],
      ["Budget", "3 ms"],
    ],
  },
  {
    id: "scheduler",
    code: "04",
    name: "Radio resource scheduler",
    alias: "RAN scheduler",
    icon: Clock,
    functionText: "Decides, every slot, which user gets which frequency blocks, modulation, and power. It is the network's traffic referee.",
    principle: "QoS-aware proportional-fair allocation runs each 0.125 ms slot. Connection: baseband supplies channel quality; DU/CU supplies policy.",
    technical: "Link adaptation (MCS 0–28), PRB grants, proportional-fair fairness, power control. Latency prioritizes URLLC slices over best-effort traffic.",
    connections: ["baseband", "ducu"],
    readouts: [
      ["Slot", "0.125 ms"],
      ["MCS", "0–28"],
      ["Policy", "QoS-aware"],
    ],
  },
  {
    id: "backhaul",
    code: "05",
    name: "Backhaul interface",
    alias: "Transport / FH-BH",
    icon: Router,
    functionText: "Carries traffic from the site to the core: fiber or microwave/IP with synchronization and QoS marking.",
    principle: "IP/Ethernet transport with timing distribution. Connection: DU/CU hands packets here; fiber leaves the site.",
    technical: "25 Gb/s fiber (SFP-DD), SyncE + PTP (±1.5 µs), DSCP marking, eCPRI / IP options. Microwave fallback for rural sites.",
    connections: ["ducu", "baseband", "power"],
    readouts: [
      ["Capacity", "25 Gb/s"],
      ["Timing", "±1.5 µs"],
      ["Media", "Fiber / µWave"],
    ],
  },
  {
    id: "power",
    code: "06",
    name: "Power supply",
    alias: "48 V DC plant + battery",
    icon: Zap,
    functionText: "Keeps every active component alive: conditioned −48 V DC, surge protection, and battery ride-through.",
    principle: "AC is rectified to −48 V DC; battery covers outages. Connection: feed to antenna, RF, baseband, backhaul, DU/CU.",
    technical: "−48 V DC plant, 100 Ah battery (~4 h standby), MPPT where solar-assisted, lightning protection, under-voltage lockout. Thermal limits trigger derating.",
    connections: ["antenna", "rf", "baseband", "backhaul", "ducu"],
    readouts: [
      ["Bus", "−48 V DC"],
      ["Battery", "100 Ah"],
      ["Holdover", "4 h"],
    ],
  },
  {
    id: "ducu",
    code: "07",
    name: "Network equipment",
    alias: "gNB DU / CU",
    icon: Server,
    functionText: "Terminates RRC / PDCP / SDAP and binds slices, keys, and core signaling to the radio.",
    principle: "DU handles real-time RLC/MAC; CU handles RRC and PDCP control. Connection: scheduler + baseband below, backhaul + core above.",
    technical: "F1-C / F1-U to core, slice mapping (S-NSSAI), AKA interaction, PDCP sequence numbers. Virtualized on x86/ARM with real-time kernels.",
    connections: ["scheduler", "baseband", "backhaul", "power"],
    readouts: [
      ["Stack", "RRC/PDCP"],
      ["Interface", "F1"],
      ["Slices", "eMBB/URLLC"],
    ],
  },
];

const SIM_STEPS: { component: ComponentId; title: string; detail: string; log: string }[] = [
  {
    component: "antenna",
    title: "Signal reaches antenna",
    detail: "UE uplink burst arrives at the array; beam is formed toward the device.",
    log: "ANT  RS captured −87 dBm · beam steered 12°",
  },
  {
    component: "rf",
    title: "RF unit processes",
    detail: "LNA + filtering and downconversion preserve signal quality.",
    log: "RFU  LNA gain 28 dB · DPD linearized · IQ clean",
  },
  {
    component: "baseband",
    title: "Baseband decodes",
    detail: "OFDM demodulation and LDPC decode recover the payload bits.",
    log: "BB   LDPC decode OK · CRC pass · payload 512 B",
  },
  {
    component: "scheduler",
    title: "Scheduler allocates resources",
    detail: "PRB grant and MCS chosen against QoS class and queue depth.",
    log: "SCH  grant G1: 24 PRB · MCS 19 · URLLC slice",
  },
  {
    component: "backhaul",
    title: "Backhaul forwards",
    detail: "Packet is encapsulated for IP transport toward the core.",
    log: "BH   queued on 25G fiber · DSCP EF · to 5GC",
  },
];

const PACKET_POS: Record<ComponentId, { x: number; y: number }> = {
  antenna: { x: 148, y: 118 },
  rf: { x: 148, y: 272 },
  baseband: { x: 422, y: 218 },
  scheduler: { x: 422, y: 290 },
  backhaul: { x: 422, y: 436 },
  power: { x: 422, y: 506 },
  ducu: { x: 422, y: 362 },
};

function logTime(index: number): string {
  return `T+${(index * 0.8 + 0.8).toFixed(1)}s`;
}

export default function BaseStationPage() {
  const [selected, setSelected] = useState<ComponentId>("antenna");
  const [view, setView] = useState<"all" | "tower" | "cabinet">("all");
  const [hovered, setHovered] = useState<ComponentId | null>(null);
  const [simIndex, setSimIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<{ time: string; text: string; tone: "info" | "ok" | "warn" }[]>([]);
  const [degraded, setDegraded] = useState(false);
  const [thermal, setThermal] = useState(42);
  const timeoutRef = useRef<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  usePageMeta({
    title: "Base Station Explorer",
    description:
      "Interactive base station explorer: antenna, RF, baseband, scheduler, backhaul, power, and DU/CU — with a live packet walkthrough and degraded-mode telemetry.",
  });

  const selectedComponent = COMPONENTS.find((c) => c.id === selected) ?? COMPONENTS[0];
  const connected = new Set<ComponentId>(selectedComponent.connections);
  const simComponent = simIndex >= 0 && simIndex < SIM_STEPS.length ? SIM_STEPS[simIndex].component : null;
  const progress = simIndex < 0 ? 0 : Math.min(100, ((simIndex + 1) / SIM_STEPS.length) * 100);
  const thermalTone = thermal > 85 ? "bad" : thermal > 72 ? "warn" : "good";
  const thermalLabel = thermal > 85 ? "Throttling" : thermal > 72 ? "Warm" : "Normal";

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (!running) return;
    if (simIndex >= SIM_STEPS.length) {
      setRunning(false);
      return;
    }
    if (simIndex < 0) return;
    const delay = degraded ? 1050 : 780;
    timeoutRef.current = window.setTimeout(() => {
      setSimIndex((i) => i + 1);
    }, delay);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [running, simIndex, degraded]);

  useEffect(() => {
    if (simIndex === -1) return;
    if (simIndex >= SIM_STEPS.length) {
      setLogs((prev) => [...prev, { time: `T+${(SIM_STEPS.length * 0.8 + 0.4).toFixed(1)}s`, text: "MSG delivered toward 5GC · end-to-end 3.9 ms", tone: "ok" }]);
      return;
    }
    const step = SIM_STEPS[simIndex];
    setLogs((prev) => [...prev, { time: logTime(simIndex), text: step.log, tone: "info" }]);
  }, [simIndex]);

  function startSim() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setLogs([]);
    setSimIndex(0);
    setRunning(true);
  }

  function resetSim() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setRunning(false);
    setSimIndex(-1);
    setLogs([]);
  }

  function zoneOpacity(id: ComponentId): number {
    if (view === "tower" && (id === "baseband" || id === "scheduler" || id === "backhaul" || id === "power" || id === "ducu")) return 0.22;
    if (view === "cabinet" && (id === "antenna" || id === "rf")) return 0.22;
    if (selected === id || connected.has(id) || simComponent === id || hovered === id) return 1;
    return 0.5;
  }

  function zoneStroke(id: ComponentId): string {
    if (simComponent === id) return "var(--good)";
    if (selected === id) return "var(--cyan)";
    if (hovered === id || connected.has(id)) return "var(--line-strong)";
    return "var(--line)";
  }

  function zoneFill(id: ComponentId): string {
    if (simComponent === id) return "rgba(62,230,164,.14)";
    if (selected === id) return "rgba(67,217,255,.14)";
    if (hovered === id || connected.has(id)) return "rgba(255,255,255,.06)";
    return "rgba(255,255,255,.025)";
  }

  function componentName(id: ComponentId): string {
    return COMPONENTS.find((c) => c.id === id)?.name ?? id;
  }

  const packet = simIndex >= 0 && simIndex < SIM_STEPS.length ? PACKET_POS[SIM_STEPS[simIndex].component] : null;
  const done = simIndex >= SIM_STEPS.length;

  return (
    <>
      <PageHeader
        index="06"
        eyebrow="Base Station"
        title={<>Anatomy of a<br /><span className="text-gradient">radio site.</span></>}
        description="Seven coordinated subsystems turn radio energy into routed IP traffic. Pick any zone in the elevation, read how it works, then send a message through the stack and watch each handover."
        badges={["Interactive site", "Live simulation"]}
        aside={
          <div className="glass-panel overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Site snapshot</span>
              <StatusPill label={degraded ? "Degraded" : "Nominal"} tone={degraded ? "warn" : "good"} pulse />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Stat label="Components" value="7" hint="selectable zones" />
              <Stat label="Cabinet temp" value={thermal} unit="°C" hint={thermalLabel} tone={thermalTone} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Power bus" value={degraded ? "Battery" : "−48 V"} hint={degraded ? "mains lost" : "mains normal"} tone={degraded ? "warn" : "cyan"} />
              <Stat label="TX power" value={degraded ? "38" : "46"} unit="dBm" hint={degraded ? "derated" : "full"} tone={degraded ? "warn" : "cyan"} />
            </div>
            <div className="mt-5 border-t border-[var(--line)] pt-3.5">
              <p className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Component legend — click to select</p>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {COMPONENTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(c.id)}
                    aria-pressed={selected === c.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left font-mono text-[8px] uppercase tracking-[.08em] transition-colors",
                      selected === c.id
                        ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/[.09] text-[var(--text)]"
                        : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]",
                    )}
                  >
                    <c.icon className="h-3 w-3 shrink-0 text-[var(--cyan)]" strokeWidth={1.7} />
                    <span className="truncate">{c.code} {c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <section aria-label="3D tower explorer" className="mb-10">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow>3D Tower Explorer</Eyebrow>
              <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[var(--muted)]">
                Same rooftop site in 3D. Drag to orbit, click any tower part or legend button to inspect it below.
              </p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--subtle)]">7 subsystems</span>
          </div>
          <BaseStation3D
            components={COMPONENTS.map((c) => ({
              id: c.id,
              label: c.name,
              short: ({ antenna: "ANT", rf: "RFU", baseband: "BBU", scheduler: "SCH", backhaul: "BH", power: "PWR", ducu: "DU/CU" } as Record<ComponentId, string>)[c.id],
            }))}
            selectedId={selected}
            onSelect={(id) => setSelected(id as ComponentId)}
            activeStage={simComponent ?? null}
          />
        </section>

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>Interactive elevation</Eyebrow>
            <p className="mt-2 text-[11px] text-[var(--subtle)]">Selected: {selectedComponent.name} · {selectedComponent.connections.length} connections highlighted</p>
          </div>
          <SegmentedControl
            label="Diagram focus"
            value={view}
            onChange={setView}
            options={[
              { value: "all", label: "Full site" },
              { value: "tower", label: "Tower" },
              { value: "cabinet", label: "Cabinet" },
            ]}
            className="max-w-[320px]"
            size="sm"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_.92fr]">
          {/* SVG layered site */}
          <SectionReveal className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-deep)]/70 p-4 sm:p-5">
              <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" />
              <div className="relative flex flex-wrap items-center justify-between gap-2">
                <span className="mono-label">L VECTOR / 600 × 560</span>
                <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> selected
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--good)]" /> packet
                </span>
              </div>

              <svg viewBox="0 0 600 560" className="relative mt-3 w-full" role="img" aria-label="Interactive base station tower and cabinet diagram">
                <defs>
                  <pattern id="bs-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" fill="none" stroke="var(--line)" strokeOpacity=".22" />
                  </pattern>
                  <linearGradient id="bs-mast" x1="0" x2="1">
                    <stop stopColor="#45647e" />
                    <stop offset=".5" stopColor="#c5dbea" />
                    <stop offset="1" stopColor="#52718b" />
                  </linearGradient>
                  <linearGradient id="bs-panelmetal" x1="0" x2="1">
                    <stop stopColor="#eef9ff" />
                    <stop offset=".55" stopColor="#a9c2d5" />
                    <stop offset="1" stopColor="#59758a" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="600" height="560" fill="url(#bs-grid)" opacity=".35" />
                <ellipse cx="300" cy="512" rx="255" ry="34" fill="rgba(67,217,255,.05)" />
                <line x1="20" y1="500" x2="580" y2="500" stroke="var(--line-strong)" strokeWidth="1.5" />
                <text x="22" y="490" fontSize="8" fontFamily="monospace" fill="var(--subtle)">GROUND · −48 V EARTH</text>

                {/* cables */}
                <path d="M148 186 V224" stroke="var(--cyan)" strokeOpacity=".35" strokeDasharray="4 5" />
                <path d="M198 268 C 260 268 280 218 318 218" stroke="var(--cyan)" strokeOpacity=".3" strokeDasharray="4 5" fill="none" />
                <path d="M318 290 H 282" stroke="var(--cyan)" strokeOpacity=".3" strokeDasharray="4 5" />
                <path d="M318 420 H 262 C 240 420 230 380 216 352" stroke="var(--warn)" strokeOpacity=".3" strokeDasharray="4 5" fill="none" />

                {/* tower mast */}
                <path d="M148 500 L126 186 H138 L148 92 L158 186 H170 Z" fill="url(#bs-mast)" opacity=".92" />
                <line x1="120" y1="300" x2="176" y2="320" stroke="#52718b" strokeWidth="2" />
                <line x1="120" y1="380" x2="176" y2="360" stroke="#52718b" strokeWidth="2" />
                <line x1="132" y1="430" x2="164" y2="450" stroke="#52718b" strokeWidth="2" />

                {/* ANTENNA zone */}
                <g
                  onClick={() => setSelected("antenna")}
                  onMouseEnter={() => setHovered("antenna")}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer", opacity: zoneOpacity("antenna") }}
                  role="button"
                  tabIndex={0}
                  aria-label="Select antenna"
                >
                  <rect x="52" y="56" width="192" height="132" rx="10" fill={zoneFill("antenna")} stroke={zoneStroke("antenna")} strokeWidth="1.8" />
                  {[0, 1, 2].map((i) => (
                    <g key={i} transform={`translate(${68 + i * 52} 78)`}>
                      <rect x="0" y="0" width="34" height="92" rx="5" fill="url(#bs-panelmetal)" />
                      <rect x="7" y="10" width="20" height="66" rx="2" fill="#1b3c54" opacity=".35" />
                      <circle cx="17" cy="84" r="2.4" fill="var(--cyan)" />
                    </g>
                  ))}
                  <text x="64" y="180" fontSize="9" fontFamily="monospace" fill="var(--muted)">01 ANTENNA</text>
                  <path d="M30 120 c-16 8 -24 24 -26 42 M252 118 c18 10 27 27 29 44" stroke="var(--cyan)" strokeOpacity=".25" strokeDasharray="3 6" fill="none" />
                </g>

                {/* RF zone */}
                <g
                  onClick={() => setSelected("rf")}
                  onMouseEnter={() => setHovered("rf")}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer", opacity: zoneOpacity("rf") }}
                  role="button"
                  tabIndex={0}
                  aria-label="Select RF unit"
                >
                  <rect x="88" y="224" width="120" height="96" rx="9" fill={zoneFill("rf")} stroke={zoneStroke("rf")} strokeWidth="1.8" />
                  <rect x="100" y="240" width="96" height="64" rx="6" fill="#142b41" stroke="var(--line-strong)" />
                  <rect x="110" y="250" width="30" height="6" rx="2" fill="var(--cyan)" opacity=".7" />
                  <rect x="110" y="262" width="52" height="4" rx="2" fill="#7291aa" opacity=".5" />
                  <text x="110" y="286" fontSize="9" fontFamily="monospace" fill="var(--muted)">02 RF UNIT · 46 dBm</text>
                  <circle cx="184" cy="252" r="3" fill="var(--good)" />
                </g>

                {/* Cabinet isometric */}
                <g opacity={view === "tower" ? 0.22 : 1}>
                  {/* baseband */}
                  <g
                    onClick={() => setSelected("baseband")}
                    onMouseEnter={() => setHovered("baseband")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer", opacity: zoneOpacity("baseband") }}
                    role="button"
                    tabIndex={0}
                    aria-label="Select baseband processing"
                  >
                    <polygon points="318,188 498,188 516,170 336,170" fill="rgba(255,255,255,.07)" stroke={zoneStroke("baseband")} />
                    <rect x="318" y="188" width="180" height="52" fill={zoneFill("baseband")} stroke={zoneStroke("baseband")} strokeWidth="1.8" />
                    <polygon points="498,188 516,170 516,222 498,240" fill="rgba(255,255,255,.04)" stroke={zoneStroke("baseband")} strokeOpacity=".6" />
                    <rect x="330" y="200" width="20" height="20" rx="4" fill="rgba(67,217,255,.12)" stroke="var(--cyan)" strokeOpacity=".35" />
                    <text x="360" y="210" fontSize="9.5" fontFamily="monospace" fill="var(--muted)">03 BASEBAND · LDPC</text>
                    <text x="360" y="224" fontSize="8" fontFamily="monospace" fill="var(--subtle)">FFT + decode</text>
                  </g>
                  {/* scheduler */}
                  <g
                    onClick={() => setSelected("scheduler")}
                    onMouseEnter={() => setHovered("scheduler")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer", opacity: zoneOpacity("scheduler") }}
                    role="button"
                    tabIndex={0}
                    aria-label="Select radio resource scheduler"
                  >
                    <polygon points="318,258 498,258 516,240 336,240" fill="rgba(255,255,255,.07)" stroke={zoneStroke("scheduler")} />
                    <rect x="318" y="258" width="180" height="52" fill={zoneFill("scheduler")} stroke={zoneStroke("scheduler")} strokeWidth="1.8" />
                    <polygon points="498,258 516,240 516,292 498,310" fill="rgba(255,255,255,.04)" stroke={zoneStroke("scheduler")} strokeOpacity=".6" />
                    <text x="332" y="280" fontSize="9.5" fontFamily="monospace" fill="var(--muted)">04 SCHEDULER · PRB GRANT</text>
                    <text x="332" y="295" fontSize="8" fontFamily="monospace" fill="var(--subtle)">0.125 ms slot</text>
                  </g>
                  {/* ducu */}
                  <g
                    onClick={() => setSelected("ducu")}
                    onMouseEnter={() => setHovered("ducu")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer", opacity: zoneOpacity("ducu") }}
                    role="button"
                    tabIndex={0}
                    aria-label="Select DU CU network equipment"
                  >
                    <polygon points="318,328 498,328 516,310 336,310" fill="rgba(255,255,255,.07)" stroke={zoneStroke("ducu")} />
                    <rect x="318" y="328" width="180" height="52" fill={zoneFill("ducu")} stroke={zoneStroke("ducu")} strokeWidth="1.8" />
                    <polygon points="498,328 516,310 516,362 498,380" fill="rgba(255,255,255,.04)" stroke={zoneStroke("ducu")} strokeOpacity=".6" />
                    <text x="332" y="350" fontSize="9.5" fontFamily="monospace" fill="var(--muted)">07 DU / CU · F1 TO CORE</text>
                    <text x="332" y="365" fontSize="8" fontFamily="monospace" fill="var(--subtle)">RRC / PDCP</text>
                  </g>
                  {/* backhaul */}
                  <g
                    onClick={() => setSelected("backhaul")}
                    onMouseEnter={() => setHovered("backhaul")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer", opacity: zoneOpacity("backhaul") }}
                    role="button"
                    tabIndex={0}
                    aria-label="Select backhaul interface"
                  >
                    <polygon points="318,398 498,398 516,380 336,380" fill="rgba(255,255,255,.07)" stroke={zoneStroke("backhaul")} />
                    <rect x="318" y="398" width="180" height="52" fill={zoneFill("backhaul")} stroke={zoneStroke("backhaul")} strokeWidth="1.8" />
                    <polygon points="498,398 516,380 516,432 498,450" fill="rgba(255,255,255,.04)" stroke={zoneStroke("backhaul")} strokeOpacity=".6" />
                    <circle cx="348" cy="424" r="6" fill="none" stroke="var(--good)" strokeWidth="1.5" />
                    <text x="364" y="420" fontSize="9.5" fontFamily="monospace" fill="var(--muted)">05 BACKHAUL · 25G</text>
                    <text x="364" y="435" fontSize="8" fontFamily="monospace" fill="var(--subtle)">fiber / microwave</text>
                  </g>
                  {/* power */}
                  <g
                    onClick={() => setSelected("power")}
                    onMouseEnter={() => setHovered("power")}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer", opacity: zoneOpacity("power") }}
                    role="button"
                    tabIndex={0}
                    aria-label="Select power supply"
                  >
                    <polygon points="318,468 498,468 516,450 336,450" fill="rgba(255,255,255,.07)" stroke={zoneStroke("power")} />
                    <rect x="318" y="468" width="180" height="30" fill={zoneFill("power")} stroke={zoneStroke("power")} strokeWidth="1.8" />
                    <polygon points="498,468 516,450 516,480 498,498" fill="rgba(255,255,255,.04)" stroke={zoneStroke("power")} strokeOpacity=".6" />
                    <text x="332" y="487" fontSize="9.5" fontFamily="monospace" fill="var(--muted)">06 POWER · −48 V + BATTERY</text>
                  </g>
                </g>

                {/* packet dot */}
                {packet && (
                  <g>
                    <circle cx={packet.x} cy={packet.y} r="14" fill="var(--good)" opacity=".14" />
                    <circle cx={packet.x} cy={packet.y} r="5" fill="var(--good)" stroke="#03111b" strokeWidth="1.5" />
                    <circle cx={packet.x} cy={packet.y} r="2" fill="#03111b" />
                  </g>
                )}
              </svg>

              <div className="relative mt-2 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-3 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)] sm:grid-cols-4">
                <span>RSRP {degraded ? "−94" : "−87"} dBm</span>
                <span>SINR {degraded ? "8" : "14"} dB</span>
                <span>Temp {thermal} °C · {thermalLabel}</span>
                <span>{degraded ? "BATT MODE" : "MAINS OK"}</span>
              </div>
            </div>
          </SectionReveal>

          {/* DETAIL PANEL */}
          <SectionReveal delay={0.08} className="min-w-0">
            <Panel className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Eyebrow icon={<selectedComponent.icon className="h-3.5 w-3.5" />}>Component {selectedComponent.code} · {selectedComponent.alias}</Eyebrow>
                <StatusPill label={simComponent === selectedComponent.id ? "In packet path" : degraded ? "Degraded" : "Online"} tone={simComponent === selectedComponent.id ? "good" : degraded ? "warn" : "info"} />
              </div>
              <h3 className="mt-4 font-display text-[26px] font-medium leading-none tracking-[-.04em] text-[var(--text)]">{selectedComponent.name}</h3>
              <p className="mt-3 text-[12px] leading-6 text-[var(--muted)]">{selectedComponent.functionText}</p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-3.5">
                  <p className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--cyan)]">Working principle</p>
                  <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">{selectedComponent.principle}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-3.5">
                  <p className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--violet)]">Technical explanation</p>
                  <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">{selectedComponent.technical}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-4">
                {selectedComponent.readouts.map(([label, value]) => (
                  <div key={label}>
                    <p className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">{label}</p>
                    <p className="mt-1 text-[12px] font-semibold text-[var(--text)]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[var(--line)] pt-4">
                <p className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Connected components — hover to highlight on diagram, click to inspect</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedComponent.connections.map((id) => {
                    const target = COMPONENTS.find((c) => c.id === id);
                    if (!target) return null;
                    const TargetIcon = target.icon;
                    return (
                      <button
                        key={id}
                        type="button"
                        onMouseEnter={() => setHovered(id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => setSelected(id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10.5px] font-semibold transition-colors",
                          hovered === id ? "border-[var(--cyan)]/60 bg-[var(--cyan)]/[.1] text-[var(--text)]" : "border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--text)]",
                        )}
                      >
                        <TargetIcon className="h-3 w-3 text-[var(--cyan)]" strokeWidth={1.7} />
                        {target.code} {componentName(id)}
                      </button>
                    );
                  })}
                </div>
                {hovered && hovered !== selected && (
                  <p className="mt-2.5 font-mono text-[8.5px] uppercase tracking-[.1em] text-[var(--cyan)]">Highlighting {componentName(hovered)} in diagram</p>
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-4 text-center">
                <div><p className="font-mono text-[8px] text-[var(--subtle)]">FUNC</p><p className="mt-1 text-[11px] font-semibold">Core</p></div>
                <div><p className="font-mono text-[8px] text-[var(--subtle)]">LINKS</p><p className="mt-1 text-[11px] font-semibold">{selectedComponent.connections.length} peers</p></div>
                <div><p className="font-mono text-[8px] text-[var(--subtle)]">STATE</p><p className="mt-1 text-[11px] font-semibold text-[var(--good)]">Active</p></div>
              </div>
            </Panel>
          </SectionReveal>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          {/* SIMULATION */}
          <SectionReveal>
            <Panel className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Eyebrow icon={<Activity className="h-3.5 w-3.5" />}>Live walkthrough</Eyebrow>
                <StatusPill label={done ? "Delivered" : running ? "Transmitting" : "Idle"} tone={done ? "good" : running ? "info" : "neutral"} pulse={running} />
              </div>
              <h3 className="mt-4 font-display text-[22px] font-medium tracking-[-.04em] text-[var(--text)]">Receive message — 5-stage stack walk</h3>
              <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">Simulated uplink packet through antenna → RF → baseband → scheduler → backhaul. No radio is transmitted; all values are synthetic.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={startSim} disabled={running} iconLeft={<Play className="h-3.5 w-3.5" />}>
                  {running ? "Transmitting…" : simIndex >= SIM_STEPS.length ? "Receive again" : "Receive message"}
                </Button>
                <Button variant="secondary" size="sm" onClick={resetSim} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>
                  Reset
                </Button>
                <div className="ml-auto font-mono text-[10px] tabular-nums text-[var(--cyan)]">{Math.round(progress)}%</div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--good))] transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>

              <ol className="mt-5 space-y-2.5">
                {SIM_STEPS.map((step, index) => {
                  const isActive = simIndex === index;
                  const isDoneStep = simIndex > index;
                  const TargetIcon = COMPONENTS.find((c) => c.id === step.component)?.icon ?? Antenna;
                  return (
                    <li
                      key={step.title}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                        isActive ? "border-[var(--good)]/40 bg-[var(--good)]/[.06]" : isDoneStep ? "border-[var(--line)] bg-white/[.02]" : "border-[var(--line)] bg-white/[.012] opacity-60",
                      )}
                    >
                      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg border", isActive ? "border-[var(--good)]/40 text-[var(--good)]" : isDoneStep ? "border-[var(--line)] text-[var(--good)]" : "border-[var(--line)] text-[var(--subtle)]")}>
                        {isDoneStep ? <Check className="h-4 w-4" /> : <TargetIcon className="h-4 w-4" strokeWidth={1.7} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[8px] text-[var(--subtle)]">0{index + 1}</span>
                          <span className="text-[12px] font-semibold text-[var(--text)]">{step.title}</span>
                          <span className={cn("font-mono text-[8px] uppercase tracking-[.1em]", isActive ? "text-[var(--good)]" : isDoneStep ? "text-[var(--muted)]" : "text-[var(--subtle)]")}>
                            {isActive ? "active" : isDoneStep ? "done" : "pending"}
                          </span>
                        </span>
                        <span className="mt-1 block text-[10.5px] leading-4 text-[var(--muted)]">{step.detail}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <div className="flex h-full flex-col gap-4">
              <Panel className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <Eyebrow icon={<Battery className="h-3.5 w-3.5" />}>Power & thermal</Eyebrow>
                  <StatusPill label={degraded ? "Degraded mode" : "Full power"} tone={degraded ? "warn" : "good"} />
                </div>
                <div className="mt-5 space-y-5">
                  <div className="rounded-xl border border-[var(--line)] p-4">
                    <Toggle checked={degraded} onChange={setDegraded} label="Battery / degraded mode" description="Mains lost: site runs on battery, TX derated 46 → 38 dBm, ports throttled." />
                    {degraded && (
                      <p className="mt-3 rounded-lg border border-[var(--warn)]/25 bg-[var(--warn)]/[.06] px-3 py-2 text-[11px] leading-5 text-[var(--warn)]">
                        Degraded: scheduler sheds best-effort load, backhaul queues, holdover ≈ 4 h at current thermal.
                      </p>
                    )}
                  </div>
                  <SliderField
                    label="Cabinet temperature"
                    value={thermal}
                    min={28}
                    max={95}
                    step={1}
                    unit="°C"
                    onChange={setThermal}
                    accent={thermalTone === "good" ? "cyan" : thermalTone === "warn" ? "warn" : "bad"}
                    hint="Below 60 °C nominal · 72 °C fan boost · 85 °C PA throttling begins."
                  />
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">
                    <Thermometer className="h-3.5 w-3.5 text-[var(--cyan)]" />
                    <span>Thermal: {thermal} °C — {thermalLabel}</span>
                  </div>
                </div>
              </Panel>

              <Panel className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="data-label">Event log</span>
                  <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">{logs.length} events</span>
                </div>
                <div ref={logRef} className="mt-4 h-[180px] flex-1 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/80 p-3 font-mono text-[10px] leading-6">
                  {logs.length === 0 ? (
                    <p className="text-[var(--subtle)]">Log idle. Press “Receive message”.</p>
                  ) : (
                    logs.map((entry, index) => (
                      <p key={`${entry.time}-${index}`} className={cn("whitespace-nowrap", entry.tone === "ok" ? "text-[var(--good)]" : entry.tone === "warn" ? "text-[var(--warn)]" : "text-[var(--muted)]")}>
                        <span className="text-[var(--subtle)]">{entry.time}</span>  {entry.text}
                      </p>
                    ))
                  )}
                </div>
                <InfoNote label="Educational">Packet timings are illustrative; real gNB scheduling runs at TTI boundaries with HARQ feedback.</InfoNote>
              </Panel>
            </div>
          </SectionReveal>
        </div>

        <SectionReveal className="mt-14">
          <SectionHeader
            eyebrow="Engineering notes"
            title="Why the split matters."
            description="The tower / cabinet split exists because radio physics and digital processing degrade differently. Each subsystem can be serviced, upgraded, or powered independently."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              { title: "Analog ends at the RF unit", text: "Above the RRU, everything is samples and bits. That clean boundary lets vendors swap radios without touching the baseband." },
              { title: "Scheduler is policy, not plumbing", text: "Allocating PRBs is an economic decision: who gets capacity now, who waits, and which slice gets guaranteed latency." },
              { title: "Power is availability", text: "A gNB is only as reliable as its −48 V plant. Battery holdover and thermal derating are designed, not improvised." },
            ].map((card) => (
              <Panel key={card.title} className="p-5" hover>
                <p className="text-[12.5px] font-semibold text-[var(--text)]">{card.title}</p>
                <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">{card.text}</p>
              </Panel>
            ))}
          </div>
        </SectionReveal>
      </div>
    </>
  );
}
