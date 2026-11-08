import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Antenna,
  BadgeCheck,
  CircuitBoard,
  Cpu,
  Fingerprint,
  GitBranch,
  Globe2,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Network,
  Radio,
  RadioTower,
  Router,
  ScanLine,
  Server,
  ShieldCheck,
  Signal,
  Smartphone,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { NetworkHero3D } from "@/components/viz/NetworkHero3D";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Panel, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { SegmentedControl } from "@/components/ui/Controls";

const architectureNodes = [
  {
    id: "ue",
    icon: Smartphone,
    label: "User equipment",
    role: "Radio endpoint",
    detail:
      "The phone, sensor, or vehicle originates traffic. It negotiates radio resources and authenticates its subscription identity before exchanging data.",
    stat: "UE",
  },
  {
    id: "ran",
    icon: Antenna,
    label: "Radio access",
    role: "RAN / gNB",
    detail:
      "The base station turns radio energy into digital transport traffic. Scheduling and modulation decide how spectrum is shared between active devices.",
    stat: "RAN",
  },
  {
    id: "backhaul",
    icon: Router,
    label: "Transport",
    role: "Backhaul",
    detail:
      "Backhaul carries traffic from the radio site to the core. Fiber is preferred; microwave and satellite links can extend sites where fiber is unavailable.",
    stat: "IP / Fiber",
  },
  {
    id: "core",
    icon: Server,
    label: "Core network",
    role: "Session & routing",
    detail:
      "The core authenticates devices, manages sessions, applies policy, and routes packets toward the right service or data network.",
    stat: "5GC",
  },
  {
    id: "service",
    icon: MessageSquare,
    label: "Service layer",
    role: "Applications",
    detail:
      "Applications deliver the actual outcome: a message, video call, telemetry stream, or emergency record. The network is only visible through the service it enables.",
    stat: "App / Edge",
  },
] as const;

const layers = [
  {
    number: "01",
    title: "Radio, re-engineered",
    description:
      "Flexible numerology, wider channels, beamforming, and massive MIMO let 5G shape radio resources around the job at hand.",
    icon: Radio,
    link: "/fundamentals",
  },
  {
    number: "02",
    title: "One network, many slices",
    description:
      "Network slicing creates logically isolated services on shared infrastructure, each with its own performance and policy profile.",
    icon: Layers3,
    link: "/architecture",
  },
  {
    number: "03",
    title: "Compute at the edge",
    description:
      "Distributed compute shortens the path between data and processing, supporting responsive and bandwidth-efficient applications.",
    icon: Cpu,
    link: "/future-network",
  },
];

const comparisonData = [
  {
    label: "Peak downlink",
    fourG: 1,
    fiveG: 20,
    fourLabel: "~1 Gbps planning",
    fiveLabel: "20 Gbps IMT-2020 target",
    fourWidth: 14,
    fiveWidth: 100,
    note: "Standardized vision, not a field measurement",
  },
  {
    label: "User-plane latency",
    fourG: 30,
    fiveG: 1,
    fourLabel: "~20–50 ms illustrative",
    fiveLabel: "1 ms URLLC target",
    fourWidth: 78,
    fiveWidth: 10,
    note: "Lower is better; deployment varies greatly",
  },
  {
    label: "Connection density",
    fourG: 200,
    fiveG: 1000,
    fourLabel: "mMTC planning range",
    fiveLabel: "1M devices / km² target",
    fourWidth: 28,
    fiveWidth: 100,
    note: "IMT-2020 target for massive machine communication",
  },
];

const hardware = [
  {
    icon: RadioTower,
    name: "Antenna & RF",
    code: "Radio front end",
    description: "Converts digital signals to radio waves and captures the return path.",
  },
  {
    icon: CircuitBoard,
    name: "Baseband unit",
    code: "Digital processing",
    description: "Handles modulation, coding, scheduling, and protocol processing.",
  },
  {
    icon: GitBranch,
    name: "Backhaul",
    code: "Transport",
    description: "Connects the radio site to the private core over fiber or microwave.",
  },
  {
    icon: Zap,
    name: "Power & protection",
    code: "Site infrastructure",
    description: "Keeps the site operational with conditioned power, backup, and thermal control.",
  },
];

const team = [
  { name: "Abhilash R", id: "20241CSE600" },
  { name: "Shashank K", id: "20241CSE0602" },
  { name: "Lakshman J", id: "20241CSE0620" },
  { name: "Hitesh B", id: "20241CSE0622" },
  { name: "Chathan R", id: "20241CSE0595" },
];

const previewStages = [
  { label: "Device A", icon: Smartphone, detail: "Payload prepared and encrypted" },
  { label: "Radio site", icon: RadioTower, detail: "Radio link scheduled" },
  { label: "Private core", icon: Server, detail: "Session authenticated and routed" },
  { label: "Device B", icon: Smartphone, detail: "Message delivered" },
];

function MiniMeter({ value, color = "var(--cyan)" }: { value: number; color?: string }) {
  return (
    <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/[.055]">
      <motion.span
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ background: color }}
        className="block rounded-full"
      />
    </span>
  );
}

function NetworkPreview() {
  const [active, setActive] = useState("ran");
  const selected = architectureNodes.find((node) => node.id === active) ?? architectureNodes[1];
  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.75fr]">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-deep)]/60 p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="relative flex items-center justify-between">
          <span className="mono-label">Signal path / synthetic</span>
          <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[.12em] text-[var(--good)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--good)]" /> Connected path
          </span>
        </div>
        <div className="relative mt-8 grid grid-cols-5 gap-1.5 sm:gap-3">
          <div className="absolute left-[8%] right-[8%] top-6 h-px bg-[var(--line-strong)]" aria-hidden>
            <motion.span
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[2px] h-[5px] w-8 rounded-full bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent"
            />
          </div>
          {architectureNodes.map((node, index) => {
            const isActive = node.id === active;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setActive(node.id)}
                aria-pressed={isActive}
                className="group relative flex min-w-0 flex-col items-center focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "relative z-10 grid h-12 w-12 place-items-center rounded-[14px] border transition-all sm:h-14 sm:w-14",
                    isActive
                      ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/[.11] text-[var(--cyan)] shadow-[0_0_32px_-8px_rgba(67,217,255,.45)]"
                      : "border-[var(--line-strong)] bg-[var(--bg-elevated)] text-[var(--muted)] group-hover:border-[var(--line-strong)] group-hover:text-[var(--text)]",
                  )}
                >
                  <node.icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.6} />
                  {isActive && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-[var(--bg-deep)] bg-[var(--cyan)]" />}
                </span>
                <span className="mt-3 hidden text-center font-mono text-[8px] uppercase tracking-[.09em] text-[var(--subtle)] sm:block">
                  0{index + 1}
                </span>
                <span className={cn("mt-1 w-full truncate text-center text-[9px] font-semibold sm:text-[10.5px]", isActive ? "text-[var(--text)]" : "text-[var(--muted)]")}>
                  {node.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative mt-7 rounded-xl border border-[var(--line)] bg-white/[.025] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--cyan)]/20 bg-[var(--cyan)]/[.06] text-[var(--cyan)]">
                <selected.icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-[12.5px] font-semibold text-[var(--text)]">{selected.label}</p>
            </div>
            <span className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">
              {selected.stat}
            </span>
          </div>
          <p className="mt-3 text-[11.5px] leading-5 text-[var(--muted)]">{selected.detail}</p>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white/[.02] p-5">
        <div>
          <p className="mono-label">Layer selector</p>
          <p className="mt-3 font-display text-[19px] leading-tight tracking-[-.03em] text-[var(--text)]">Trace a packet from radio to service.</p>
          <p className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">
            Each layer has a different job. Select a node to inspect the role it plays in a private network.
          </p>
        </div>
        <div className="space-y-2.5 border-t border-[var(--line)] pt-4">
          {[
            ["UE", "Originates and consumes"],
            ["RAN", "Translates radio ↔ IP"],
            ["Core", "Controls and routes"],
          ].map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-[10.5px]">
              <span className="font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)]">{label}</span>
              <span className="text-right text-[var(--muted)]">{text}</span>
            </div>
          ))}
        </div>
        <Link to="/architecture" className="group inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--cyan)]">
          Open full architecture
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function ComparisonPreview() {
  const [generation, setGeneration] = useState<"4g" | "5g">("5g");
  return (
    <div className="grid gap-8 lg:grid-cols-[.88fr_1.12fr] lg:gap-14">
      <div className="lg:pt-1">
        <SegmentedControl
          label="Choose generation for comparison"
          value={generation}
          onChange={setGeneration}
          options={[
            { value: "4g", label: "4G LTE" },
            { value: "5g", label: "5G" },
          ]}
          className="max-w-[260px]"
        />
        <div className="mt-8 flex items-end gap-4">
          <p className="font-display text-[clamp(4rem,10vw,7.5rem)] font-medium leading-[.8] tracking-[-.08em]">
            {generation === "4g" ? "4G" : "5G"}
          </p>
          <div className="pb-2">
            <StatusPill label={generation === "4g" ? "Established" : "Evolving"} tone={generation === "4g" ? "neutral" : "info"} />
            <p className="mt-2 max-w-[180px] text-[10px] leading-4 text-[var(--subtle)]">
              {generation === "4g"
                ? "Broad mobile broadband foundation."
                : "Designed for enhanced mobile broadband, low latency, and massive IoT."}
            </p>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {[
            ["Architecture", generation === "4g" ? "EPC · eNodeB" : "5G Core · gNB"],
            ["Slicing", generation === "4g" ? "Limited / operator-specific" : "Designed-in logical slices"],
            ["Typical design focus", generation === "4g" ? "Mobile internet" : "Diverse service classes"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 border-b border-[var(--line)] py-2.5 text-[11px]">
              <span className="text-[var(--subtle)]">{label}</span>
              <span className="text-right font-medium text-[var(--text)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4 text-[var(--cyan)]" />
            <span className="text-[11.5px] font-semibold text-[var(--text)]">Comparison envelope</span>
          </div>
          <span className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Illustrative / standards targets</span>
        </div>
        <div className="relative p-5 sm:p-6">
          <div className="absolute inset-0 dot-grid opacity-[.25]" />
          <div className="relative space-y-6">
            {comparisonData.map((row) => {
              const current = generation === "4g"
                ? { label: row.fourLabel, width: row.fourWidth }
                : { label: row.fiveLabel, width: row.fiveWidth };
              return (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[11px] font-semibold text-[var(--text)]">{row.label}</p>
                    <p className="text-right font-mono text-[9.5px] text-[var(--muted)]">{current.label}</p>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <MiniMeter value={current.width} color={generation === "5g" ? "linear-gradient(90deg,var(--cyan),var(--blue))" : "var(--muted)"} />
                    <span className="w-5 text-right font-mono text-[8px] text-[var(--subtle)]">{generation === "4g" ? "4G" : "5G"}</span>
                  </div>
                  <p className="mt-1.5 text-[9px] leading-4 text-[var(--subtle)]">{row.note}</p>
                </div>
              );
            })}
          </div>
          <div className="relative mt-7 flex items-start gap-2 rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2.5">
            <ScanLine className="mt-0.5 h-3 w-3 shrink-0 text-[var(--subtle)]" />
            <p className="text-[9.5px] leading-4 text-[var(--subtle)]">
              Values are illustrative planning figures and ITU IMT-2020 targets, not measured carrier performance. Real results depend on spectrum, load, signal quality, and configuration.
            </p>
          </div>
          <Link to="/performance" className="relative mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--cyan)]">
            Open the performance lab <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SimulatorPreview() {
  const [stage, setStage] = useState(-1);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (stage >= previewStages.length - 1) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setStage((current) => current + 1), stage < 0 ? 250 : 850);
    return () => window.clearTimeout(timer);
  }, [running, stage]);

  function run() {
    setStage(0);
    setRunning(true);
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[var(--line-strong)] bg-[var(--bg-deep)]/80 p-5 shadow-[0_30px_100px_-40px_rgba(0,0,0,.8)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" />
      <div className="pointer-events-none absolute -right-20 -top-32 h-[380px] w-[380px] rounded-full bg-[var(--cyan)]/[.055] blur-[90px]" />
      <div className="relative grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill label="Interactive preview" tone="info" />
            <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">Synthetic path</span>
          </div>
          <h3 className="mt-5 font-display text-[clamp(1.7rem,3.5vw,2.65rem)] font-medium leading-[1.04] tracking-[-.05em]">
            Watch a message cross the network.
          </h3>
          <p className="mt-4 max-w-md text-[12.5px] leading-6 text-[var(--muted)]">
            A four-stage preview of the full simulation. Device preparation, radio scheduling, core routing, and delivery — at your pace.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button variant="primary" size="md" onClick={run} disabled={running} iconLeft={<Zap className="h-4 w-4" />}>
              {running ? "Transmitting…" : stage >= previewStages.length - 1 ? "Run preview again" : "Run preview"}
            </Button>
            <Link to="/simulator">
              <Button variant="secondary" size="md" iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}>
                Full simulator
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/40 p-4 backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="font-mono text-[8px] uppercase tracking-[.15em] text-[var(--subtle)]">Transmission progress</span>
            <span className="font-mono text-[9px] tabular-nums text-[var(--cyan)]">
              {stage < 0 ? "IDLE" : stage >= previewStages.length - 1 ? "DELIVERED" : `${Math.round(((stage + 1) / previewStages.length) * 100)}%`}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-4">
            {previewStages.map((item, index) => {
              const isActive = stage === index;
              const isDone = stage > index;
              return (
                <div key={item.label} className="relative flex flex-col items-center text-center">
                  {index < previewStages.length - 1 && (
                    <span className={cn("absolute left-1/2 top-5 h-px w-full", isDone ? "bg-[var(--cyan)]/40" : "bg-[var(--line-strong)]")} />
                  )}
                  <span
                    className={cn(
                      "relative z-10 grid h-10 w-10 place-items-center rounded-xl border transition-all duration-300",
                      isActive
                        ? "border-[var(--cyan)] bg-[var(--cyan)] text-[#03111b] shadow-[0_0_24px_-4px_rgba(67,217,255,.5)]"
                        : isDone
                          ? "border-[var(--good)]/35 bg-[var(--good)]/[.12] text-[var(--good)]"
                          : "border-[var(--line-strong)] bg-[var(--bg-elevated)] text-[var(--subtle)]",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <p className={cn("mt-2.5 text-[9px] font-semibold leading-tight sm:text-[10px]", isActive || isDone ? "text-[var(--text)]" : "text-[var(--subtle)]")}>{item.label}</p>
                  <p className="mt-1 hidden min-h-[24px] text-[8px] leading-3 text-[var(--subtle)] md:block">{item.detail}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[.05]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--blue))] transition-[width] duration-500"
              style={{ width: stage < 0 ? "0%" : `${((stage + 1) / previewStages.length) * 100}%` }}
            />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[9px] text-[var(--subtle)]">
            <ShieldCheck className="h-3 w-3" />
            No real messages are sent. This preview does not use a carrier network.
          </p>
        </div>
      </div>
    </div>
  );
}

function HardwareIllustration() {
  return (
    <div className="relative h-[390px] overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--bg-deep)]/75 sm:h-[430px]">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <span className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Radio site / component map</span>
        <span className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[.1em] text-[var(--subtle)]">Concept</span>
      </div>

      <svg viewBox="0 0 460 390" className="absolute inset-x-0 bottom-0 mx-auto h-[355px] w-full max-w-[500px]" aria-label="Conceptual base station with antenna, radio unit, baseband, backhaul and power">
        <defs>
          <linearGradient id="mast" x1="0" x2="1">
            <stop stopColor="#45647e" />
            <stop offset=".45" stopColor="#c5dbea" />
            <stop offset="1" stopColor="#52718b" />
          </linearGradient>
          <linearGradient id="panelmetal" x1="0" x2="1">
            <stop stopColor="#eff9ff" />
            <stop offset=".55" stopColor="#a9c2d5" />
            <stop offset="1" stopColor="#59758a" />
          </linearGradient>
          <radialGradient id="site-glow">
            <stop stopColor="#91b7a5" stopOpacity=".15" />
            <stop offset="1" stopColor="#91b7a5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="243" cy="300" rx="160" ry="60" fill="url(#site-glow)" />
        <rect x="150" y="318" width="186" height="20" rx="4" fill="#0b1a2a" stroke="#48657e" strokeOpacity=".5" />
        <path d="M243 321 224 86h12l9-36h12l9 36h12l-20 235Z" fill="url(#mast)" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i === 0 ? -38 : i === 1 ? 8 : 48}, ${i === 2 ? 82 : 102}) rotate(${i === 0 ? -8 : i === 1 ? 0 : 8})`}>
            <rect x="0" y="0" width="30" height="107" rx="5" fill="url(#panelmetal)" />
            <rect x="6" y="10" width="18" height="81" rx="2" fill="#1b3c54" opacity=".35" />
            <circle cx="15" cy="98" r="2" fill="#91b7a5" />
          </g>
        ))}
        <path d="M183 121c-27 13-42 38-46 70M303 118c31 15 47 43 49 73" stroke="#91b7a5" strokeOpacity=".25" strokeDasharray="3 6" fill="none" />
        <g transform="translate(266 218)">
          <rect x="0" y="0" width="78" height="46" rx="8" fill="#142b41" stroke="#52718b" strokeOpacity=".55" />
          <rect x="9" y="10" width="26" height="5" rx="2" fill="#91b7a5" opacity=".55" />
          <rect x="9" y="19" width="42" height="3" rx="1.5" fill="#7291aa" opacity=".5" />
          <circle cx="65" cy="14" r="2" fill="#7fb896" />
          <text x="9" y="36" fontSize="7" fontFamily="monospace" fill="#91aec5">RADIO UNIT</text>
        </g>
        <g transform="translate(96 264)">
          <rect x="0" y="0" width="90" height="46" rx="8" fill="#142b41" stroke="#52718b" strokeOpacity=".55" />
          <rect x="9" y="10" width="18" height="18" rx="4" fill="#91b7a5" opacity=".12" stroke="#91b7a5" strokeOpacity=".3" />
          <path d="M14 15h8M14 19h8M14 23h5" stroke="#91b7a5" strokeWidth="1" opacity=".7" />
          <text x="35" y="20" fontSize="7" fontFamily="monospace" fill="#91aec5">BASEBAND</text>
          <text x="35" y="31" fontSize="6" fontFamily="monospace" fill="#597b96">SCHEDULER</text>
        </g>
        <path d="M80 286H50c-10 0-18-8-18-18v-94" stroke="#91b7a5" strokeOpacity=".24" strokeDasharray="3 6" fill="none" />
        <path d="M344 241H381c13 0 23 10 23 23v82" stroke="#91b7a5" strokeOpacity=".24" strokeDasharray="3 6" fill="none" />
        <g transform="translate(51 83)">
          <rect width="70" height="30" rx="6" fill="#0e2236" stroke="#91b7a5" strokeOpacity=".2" />
          <text x="35" y="13" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#91aec5">BACKHAUL</text>
          <text x="35" y="23" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#91b7a5" opacity=".6">FIBER / IP</text>
        </g>
        <g transform="translate(342 304)">
          <rect width="80" height="35" rx="6" fill="#0e2236" stroke="#7fb896" strokeOpacity=".2" />
          <text x="40" y="14" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#91aec5">POWER</text>
          <text x="40" y="25" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#7fb896" opacity=".7">+ BACKUP</text>
        </g>
        <line x1="238" y1="56" x2="238" y2="35" stroke="#91b7a5" strokeOpacity=".4" />
        <circle cx="238" cy="31" r="3.5" fill="#7fb896" />
      </svg>
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--bg-elevated)]/80 px-2 py-1 font-mono text-[7.5px] uppercase tracking-[.1em] text-[var(--subtle)] backdrop-blur">
        <span className="h-1 w-1 rounded-full bg-[var(--good)]" /> Simplified site elevation
      </div>
    </div>
  );
}

function AiPreview() {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[var(--line-strong)] bg-[var(--bg-deep)]/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--good)]" />
          <span className="font-mono text-[8px] uppercase tracking-[.15em] text-[var(--muted)]">Operations sandbox / synthetic</span>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">Rule engine v1.0</span>
      </div>
      <div className="grid gap-px bg-[var(--line)] sm:grid-cols-[1fr_1.55fr]">
        <div className="bg-[var(--bg-deep)]/95 p-4 sm:p-5">
          <p className="mono-label">Current alerts</p>
          <div className="mt-4 space-y-2.5">
            {[
              { title: "Elevated RAN latency", time: "12s ago", tone: "warn" as const },
              { title: "Sector load > 82%", time: "1m ago", tone: "warn" as const },
              { title: "Backhaul nominal", time: "4m ago", tone: "good" as const },
            ].map((alert) => (
              <div key={alert.title} className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2.5">
                <span className={cn("mt-1 h-1.5 w-1.5 rounded-full", alert.tone === "warn" ? "bg-[var(--warn)]" : "bg-[var(--good)]")} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-medium text-[var(--text)]">{alert.title}</p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/ai-network" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--cyan)]">
            Open NOC sandbox <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="bg-[var(--bg-deep)]/95 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="mono-label">Aggregate health</p>
            <StatusPill label="Attention" tone="warn" />
          </div>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full" style={{ background: "conic-gradient(var(--warn) 0 72%, var(--line) 72% 100%)" }}>
              <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-[var(--bg-deep)]">
                <div className="text-center">
                  <p className="font-display text-lg leading-none text-[var(--text)]">72</p>
                  <p className="mt-1 font-mono text-[6px] uppercase tracking-[.1em] text-[var(--subtle)]">Health</p>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              {[
                ["RAN traffic", 78, "var(--warn)"],
                ["Core health", 94, "var(--good)"],
                ["Packet loss", 26, "var(--blue)"],
              ].map(([label, value, color]) => (
                <div key={label as string}>
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="text-[var(--muted)]">{label}</span>
                    <span className="font-mono text-[var(--subtle)]">{value}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[.06]">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: color as string }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-[var(--warn)]/20 bg-[var(--warn)]/[.04] px-3 py-2.5">
            <p className="font-mono text-[7px] uppercase tracking-[.12em] text-[var(--warn)]">Suggested action</p>
            <p className="mt-1 text-[9.5px] leading-4 text-[var(--muted)]">Shift load to the adjacent sector and inspect scheduler queue depth.</p>
          </div>
        </div>
      </div>
      <p className="border-t border-[var(--line)] px-4 py-2 font-mono text-[7.5px] uppercase tracking-[.12em] text-[var(--subtle)] sm:px-5">
        Demonstration only · Rule-based detection, not a machine-learning model
      </p>
    </div>
  );
}

export default function HomePage() {
  usePageMeta({
    title: "Interactive 5G Learning & Simulation Platform",
    description:
      "Explore 5G fundamentals, private network architecture, interactive simulations, security, and future connectivity in one educational platform.",
  });

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-[.28] [mask-image:radial-gradient(ellipse_at_50%_35%,black,transparent_72%)]" />
        <div className="page-shell relative grid items-center gap-12 pb-14 pt-12 sm:pt-16 lg:grid-cols-[.92fr_1.08fr] lg:gap-10 lg:pb-20 lg:pt-20 xl:gap-16">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill label="Interactive 3D experience" tone="info" />
              <span className="font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)]">Independent long-range network</span>
            </div>
            <h1 className="mt-7 max-w-[650px] font-display text-[clamp(2.4rem,5.2vw,4.2rem)] font-medium leading-[1.02] tracking-[-.035em]">
              Connecting the World Beyond Limits.
            </h1>
            <p className="mt-6 max-w-[520px] text-[14px] leading-7 text-[var(--muted)] sm:text-[15px]">
              Discover the architecture, technology and intelligence behind next-generation wireless communication.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/architecture">
                <Button variant="primary" size="lg" iconLeft={<Network className="h-4 w-4" />} iconRight={<ArrowRight className="h-4 w-4" />}>
                  Explore 5G Architecture
                </Button>
              </Link>
              <Link to="/simulator">
                <Button variant="secondary" size="lg" iconLeft={<Zap className="h-4 w-4" />}>
                  Launch Network Simulator
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-[440px] grid-cols-3 gap-3 border-t border-[var(--line)] pt-5">
              {[
                ["12", "guided modules"],
                ["08", "interactive labs"],
                ["100%", "client-side"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-[19px] font-medium tracking-[-.03em] text-[var(--text)]">{value}</p>
                  <p className="mt-1 font-mono text-[8px] uppercase tracking-[.11em] text-[var(--subtle)]">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2 text-[9.5px] text-[var(--subtle)]">
              <ShieldCheck className="h-3 w-3" />
              Educational simulations only. Not connected to a commercial carrier network.
            </p>
          </div>

          <div className="relative z-[1] lg:-mr-4 xl:-mr-8">
            <NetworkHero3D />
          </div>
        </div>

        <div className="page-shell relative pb-12">
          <div className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-white/[.018] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-[var(--muted)]">
              <span className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Systems covered</span>
              <span className="h-3 w-px bg-[var(--line-strong)]" />
              {["RAN", "Private core", "Security", "Edge", "Network automation"].map((label) => (
                <span key={label} className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[.08em]">
                  {label}
                </span>
              ))}
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)]">Build 2026 · Academic concept</span>
          </div>
        </div>
      </section>

      <SectionReveal>
        <section className="page-shell section-space pt-6 lg:pt-12">
          <SectionHeader
            eyebrow="01 / The premise"
            title={<>5G is not simply faster LTE.<br className="hidden sm:block" /> It is a different way to engineer a network.</>}
            description="The generational label hides the interesting part. 5G rethinks radio flexibility, service isolation, and where computation happens — enabling networks to be shaped around outcomes rather than one-size-fits-all traffic."
            action={
              <Link to="/fundamentals">
                <Button variant="quiet" size="md" iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}>
                  Start with the fundamentals
                </Button>
              </Link>
            }
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-[.9fr_1.1fr] lg:gap-8">
            <Panel className="relative overflow-hidden p-5 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)]/40 to-transparent" />
              <div className="flex items-center justify-between">
                <Eyebrow>Operating envelope</Eyebrow>
                <Wifi className="h-4 w-4 text-[var(--cyan)]/60" />
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { band: "Sub-1 GHz", use: "Coverage & penetration", value: "Wide reach", width: "92%" },
                  { band: "3.5 GHz", use: "Capacity & private networks", value: "Balanced", width: "68%" },
                  { band: "mmWave", use: "Dense capacity", value: "Short range", width: "34%" },
                ].map((row) => (
                  <div key={row.band}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-[72px] font-mono text-[9.5px] text-[var(--text)]">{row.band}</span>
                        <span className="text-[10px] text-[var(--muted)]">{row.use}</span>
                      </div>
                      <span className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">{row.value}</span>
                    </div>
                    <div className="mt-2 h-[3px] rounded-full bg-white/[.05]">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--violet))]" style={{ width: row.width }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4">
                <span className="max-w-[250px] text-[9.5px] leading-4 text-[var(--subtle)]">
                  Spectrum choice is an engineering trade-off between coverage, capacity, and deployment cost.
                </span>
                <a href="https://www.itu.int/en/ITU-R/study-groups/rsg5/rwp5d/imt-2020/Pages/default.aspx" target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)] transition-colors hover:text-[var(--cyan)]">
                  ITU IMT-2020 <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
              </div>
            </Panel>

            <div className="space-y-0 border-t border-[var(--line)]">
              {layers.map((layer) => (
                <Link
                  key={layer.number}
                  to={layer.link}
                  className="group grid gap-4 border-b border-[var(--line)] py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6"
                >
                  <span className="font-mono text-[9px] text-[var(--subtle)]">{layer.number}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <layer.icon className="h-4 w-4 text-[var(--cyan)]" strokeWidth={1.7} />
                      <h3 className="font-display text-[18px] font-medium tracking-[-.025em] text-[var(--text)]">{layer.title}</h3>
                    </div>
                    <p className="mt-2 max-w-lg text-[11.5px] leading-5 text-[var(--muted)]">{layer.description}</p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] text-[var(--subtle)] transition-all group-hover:border-[var(--cyan)]/30 group-hover:text-[var(--cyan)]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="border-y border-[var(--line)] bg-white/[.012]">
          <div className="page-shell section-space">
            <SectionHeader
              eyebrow="02 / Anatomy of a connection"
              title={<>Every message travels through a layered system.</>}
              description="A wireless network is not one device. It is a chain of radio, transport, control, and application systems — each with a distinct responsibility and failure mode."
              action={<StatusPill label="Interactive preview" tone="info" pulse />}
            />
            <div className="mt-10">
              <NetworkPreview />
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="page-shell section-space">
          <SectionHeader
            eyebrow="03 / Generational shift"
            title="More than a number."
            description="Compare the design intent behind 4G LTE and 5G. Standardized targets describe capability envelopes, not what every subscriber will experience."
            action={<Link to="/performance"><Button variant="quiet" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Open comparison lab</Button></Link>}
          />
          <div className="mt-10">
            <ComparisonPreview />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="page-shell pb-16 sm:pb-20 lg:pb-24">
          <SimulatorPreview />
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="border-y border-[var(--line)] bg-white/[.012]">
          <div className="page-shell section-space">
            <SectionHeader
              eyebrow="04 / Physical layer"
              title="Software is only half of the network."
              description="Radio hardware determines what the network can do before a single packet is routed. Antennas, RF chains, baseband processing, backhaul, and power must be designed as one system."
              action={
                <Link to="/base-station">
                  <Button variant="quiet" iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}>Explore base station</Button>
                </Link>
              }
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
              <HardwareIllustration />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {hardware.map((item, index) => (
                  <Link
                    key={item.name}
                    to="/base-station"
                    className="group flex items-start gap-4 rounded-xl border border-[var(--line)] bg-white/[.018] p-4 transition-colors hover:border-[var(--line-strong)] hover:bg-white/[.038]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-[var(--line)] bg-white/[.025] text-[var(--muted)] transition-colors group-hover:text-[var(--cyan)]">
                      <item.icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-[var(--text)]">{item.name}</span>
                        <span className="font-mono text-[7.5px] uppercase tracking-[.1em] text-[var(--subtle)]">0{index + 1}</span>
                      </span>
                      <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[.1em] text-[var(--cyan)]/60">{item.code}</span>
                      <span className="mt-1.5 block text-[10.5px] leading-4 text-[var(--subtle)]">{item.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="page-shell section-space">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
            <div>
              <Eyebrow>05 / Identity & access</Eyebrow>
              <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,3.1rem)] font-medium leading-[1.04] tracking-[-.05em]">
                Trust begins with a <span className="text-gradient">verified identity.</span>
              </h2>
              <p className="mt-5 max-w-lg text-[13px] leading-6 text-[var(--muted)]">
                Before data moves, the network verifies that the device is who it claims to be. SIM, eSIM, and iSIM each hold protected credentials in different physical forms. The authentication exchange establishes a session — without exposing the underlying key.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["SIM", "eSIM", "iSIM", "Secure element", "Network access control"].map((tag) => (
                  <span key={tag} className="rounded-md border border-[var(--line)] bg-white/[.025] px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-[.08em] text-[var(--muted)]">
                    {tag}
                  </span>
                ))}
              </div>
              <Link to="/security" className="mt-7 inline-flex items-center gap-2 text-[11.5px] font-semibold text-[var(--cyan)] hover:underline">
                Run the authentication simulator <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <Panel className="relative overflow-hidden p-5 sm:p-7">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[var(--violet)]/[.08] blur-[60px]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--cyan)]/20 bg-[var(--cyan)]/[.06] text-[var(--cyan)]">
                    <LockKeyhole className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11.5px] font-semibold">Authentication exchange</span>
                </div>
                <StatusPill label="Protected" tone="good" />
              </div>
              <div className="relative mt-7">
                <div className="absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-[var(--cyan)]/50 via-[var(--line-strong)] to-[var(--good)]/40" />
                {[
                  { icon: Smartphone, title: "Device requests access", detail: "A protected subscription identity is presented." },
                  { icon: Fingerprint, title: "Network issues a challenge", detail: "A fresh random value prevents replay." },
                  { icon: BadgeCheck, title: "Credentials are verified", detail: "Both sides prove knowledge of the shared secret." },
                  { icon: Network, title: "Session is authorized", detail: "Policy and slice selection follow." },
                ].map((step, index) => (
                  <div key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
                    <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--bg-elevated)] text-[var(--cyan)]">
                      <step.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[7.5px] text-[var(--subtle)]">0{index + 1}</span>
                        <p className="text-[11.5px] font-semibold text-[var(--text)]">{step.title}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] leading-4 text-[var(--subtle)]">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <InfoNote className="mt-2" label="Safe simulation" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                No real credentials, SIM data, or personal information are collected.
              </InfoNote>
            </Panel>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="border-y border-[var(--line)] bg-white/[.012]">
          <div className="page-shell section-space">
            <div className="grid gap-8 lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:gap-14">
              <div>
                <Eyebrow>06 / Network operations</Eyebrow>
                <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,3.1rem)] font-medium leading-[1.04] tracking-[-.05em]">
                  Observability, before autonomy.
                </h2>
                <p className="mt-5 max-w-lg text-[13px] leading-6 text-[var(--muted)]">
                  A useful operations layer starts with clear telemetry, thresholds, and traceable decisions. Our sandbox demonstrates a rule-based monitoring workflow — not a production AI system — and explains the recommendations it produces.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Synthetic traffic, latency, and failure conditions",
                    "Deterministic alert rules with visible causes",
                    "Suggested recovery actions, not automated changes",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[11.5px] leading-5 text-[var(--muted)]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--cyan)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/ai-network" className="mt-7 inline-flex items-center gap-2 text-[11.5px] font-semibold text-[var(--cyan)] hover:underline">
                  Open network operations sandbox <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <AiPreview />
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="page-shell section-space">
          <SectionHeader
            eyebrow="07 / What comes next"
            title="The network is becoming a sensing and compute platform."
            description="Beyond 5G, research is exploring AI-native air interfaces, integrated sensing, new spectrum, and non-terrestrial coverage. These are directions — not deployed consumer services."
            action={<Link to="/future-network"><Button variant="quiet" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Explore future networks</Button></Link>}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link to="/future-network" className="group relative min-h-[250px] overflow-hidden rounded-[20px] border border-[var(--line-strong)] bg-[linear-gradient(145deg,rgba(19,51,78,.72),rgba(7,17,31,.9))] p-6 md:col-span-2">
              <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-40">
                <div className="absolute right-10 top-10 h-48 w-48 rounded-full border border-[var(--cyan)]/20" />
                <div className="absolute right-[70px] top-[70px] h-28 w-28 rounded-full border border-[var(--cyan)]/25" />
                <div className="absolute right-[100px] top-[100px] h-8 w-8 rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/[.06]" />
                <div className="absolute right-4 top-[150px] h-px w-52 bg-gradient-to-r from-transparent to-[var(--cyan)]/30" />
              </div>
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--cyan)]/25 bg-[var(--cyan)]/[.07] text-[var(--cyan)]">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--cyan)]">Research horizon</span>
                  </div>
                  <h3 className="mt-6 max-w-md font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-[1.08] tracking-[-.04em] text-white">
                    Toward 6G: AI-native, sensing-aware networks.
                  </h3>
                  <p className="mt-3 max-w-md text-[11.5px] leading-5 text-white/50">
                    Standardization is still forming. Explore the research themes without treating them as current commercial capability.
                  </p>
                </div>
                <span className="mt-8 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-white/40 transition-colors group-hover:text-white/80">
                  Research roadmap <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
            <Link to="/future-network" className="group rounded-[20px] border border-[var(--line)] bg-white/[.02] p-6 transition-colors hover:border-[var(--line-strong)] hover:bg-white/[.04]">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white/[.025] text-[var(--violet)]">
                <Cpu className="h-4 w-4" />
              </span>
              <p className="mt-6 font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Edge computing</p>
              <h3 className="mt-2 font-display text-[20px] font-medium leading-tight tracking-[-.03em]">Compute closer to the physical world.</h3>
              <p className="mt-2.5 text-[11px] leading-5 text-[var(--muted)]">Process data near its source to reduce response time and transport load.</p>
              <span className="mt-6 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[.12em] text-[var(--muted)] group-hover:text-[var(--cyan)]">
                Open technology map <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
            <div className="relative overflow-hidden rounded-[20px] border border-[var(--line)] bg-white/[.02] p-6 lg:col-span-2">
              <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-[var(--cyan)]" />
                    <span className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Coverage beyond land</span>
                  </div>
                  <h3 className="mt-4 font-display text-[20px] font-medium leading-tight tracking-[-.03em]">Marine & underwater links.</h3>
                  <p className="mt-2 max-w-sm text-[11px] leading-5 text-[var(--muted)]">
                    Acoustic communication operates under fundamentally different physics and latency constraints from radio.
                  </p>
                  <Link to="/future-network" className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--cyan)]">
                    Explore marine connectivity <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="flex h-[90px] items-end gap-1.5" aria-hidden>
                  {[18, 26, 36, 24, 44, 56, 36, 62, 48, 70, 34, 22, 16].map((height, index) => (
                    <span key={index} className="w-1.5 rounded-full bg-[linear-gradient(to_top,var(--cyan),transparent)]" style={{ height, opacity: 0.2 + height / 100 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="page-shell pb-6">
          <div className="overflow-hidden rounded-[24px] border border-[var(--line-strong)] bg-gradient-to-br from-white/[.045] to-transparent">
            <div className="grid lg:grid-cols-[1.15fr_.85fr]">
              <div className="border-b border-[var(--line)] p-6 sm:p-9 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
                  <span className="font-mono text-[9px] uppercase tracking-[.17em] text-[var(--cyan)]">Academic project</span>
                </div>
                <h2 className="mt-5 max-w-2xl font-display text-[clamp(1.7rem,3.5vw,2.8rem)] font-medium leading-[1.04] tracking-[-.05em]">
                  Independent Long-Range Communication Network
                </h2>
                <p className="mt-4 max-w-xl text-[12px] leading-6 text-[var(--muted)]">
                  A proposed independently managed communication architecture for environments where conventional public coverage is unavailable, unreliable, or disrupted. The project explores how private 5G-era components could support a locally controlled network — while clearly separating concept from deployment.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Concept architecture", "Private RAN", "Local core", "Device identity"].map((tag) => (
                    <span key={tag} className="rounded border border-[var(--line)] px-2 py-1 font-mono text-[8px] uppercase tracking-[.08em] text-[var(--subtle)]">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to="/project" className="mt-7 inline-flex items-center gap-2 text-[11.5px] font-semibold text-[var(--cyan)] hover:underline">
                  Open full project demonstration <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="p-6 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[.15em] text-[var(--subtle)]">Project team</span>
                  <span className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">CSE · 2024</span>
                </div>
                <div className="mt-5 divide-y divide-[var(--line)]">
                  {team.map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3 py-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-white/[.045] font-mono text-[8px] text-[var(--muted)]">
                        {member.name.split(" ").map((part) => part[0]).join("")}
                      </span>
                      <span className="min-w-0 flex-1 text-[11.5px] font-medium text-[var(--text)]">{member.name}</span>
                      <span className="font-mono text-[8px] tracking-[.04em] text-[var(--subtle)]">{member.id}</span>
                      <span className="hidden font-mono text-[7.5px] text-[var(--subtle)] sm:block">0{index + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[9.5px] leading-4 text-[var(--subtle)]">
                  Academic concept. No commercial deployment, field benchmark, or operational service is claimed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>
    </>
  );
}
