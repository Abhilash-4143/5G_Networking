import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Building2, Car, Factory, Gauge, Glasses, HeartPulse, Siren } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, Stat, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { SegmentedControl, SliderField } from "@/components/ui/Controls";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";
import { useLocalStorage } from "@/lib/storage";
import { cn } from "@/lib/cn";

type Gen = "4g" | "5g";

const metrics = [
  {
    id: "tput",
    title: "Peak throughput",
    unit: "Gbps",
    fourTarget: "~1 Gbps planning",
    fiveTarget: "20 Gbps IMT-2020 target",
    fourTypical: "0.05–0.3 Gbps typical",
    fiveTypical: "0.5–6 Gbps typical (favourable)",
    why: "Set by bandwidth × spectral efficiency × MIMO layers. 5G wins mostly via wider channels (100–400 MHz) and massive MIMO, not a new modulation miracle.",
  },
  {
    id: "latency",
    title: "User-plane latency",
    unit: "ms",
    fourTarget: "~20–50 ms typical LTE",
    fiveTarget: "1 ms URLLC target (CUPS)",
    fourTypical: "25–50 ms typical",
    fiveTypical: "5–15 ms typical eMBB",
    why: "Numerology (slot length), TDD pattern, scheduling, and edge placement dominate. The 1 ms figure is a radio-interface target under ideal conditions.",
  },
  {
    id: "density",
    title: "Connection density",
    unit: "devices/km²",
    fourTarget: "EC-GSM/LTE-M/NB-IoT support",
    fiveTarget: "1,000,000 /km² mMTC target",
    fourTypical: "Thousands /km² typical",
    fiveTypical: "Tens of thousands /km² target",
    why: "Driven by narrowband IoT procedures, power saving (PSM/eDRX), and base-station capacity — not by raw broadband bandwidth.",
  },
  {
    id: "se",
    title: "Spectral efficiency",
    unit: "bit/s/Hz",
    fourTarget: "2×2 / 4×4 MIMO era",
    fiveTarget: "Higher via massive MIMO",
    fourTypical: "1–3 bit/s/Hz system avg.",
    fiveTypical: "2–6 bit/s/Hz system avg.",
    why: "System average matters more than the 64-QAM peak. Multi-user MIMO and better CSI feedback lift the average, especially in mid-band.",
  },
  {
    id: "slicing",
    title: "Network slicing",
    unit: "logical nets",
    fourTarget: "Limited APN / operator slices",
    fiveTarget: "Designed-in end-to-end slices",
    fourTypical: "Dedicated APNs",
    fiveTypical: "S-NSSAI per slice",
    why: "5G SA core isolates services with per-slice QoS, policy, and charging. 4G can emulate with APNs but lacks the same control granularity.",
  },
  {
    id: "mobility",
    title: "Mobility & reliability",
    unit: "km/h",
    fourTarget: "Up to 350 km/h (high-speed rail)",
    fiveTarget: "500 km/h target (IMT-2020)",
    fourTypical: "250–350 km/h proven",
    fiveTypical: "300+ km/h typical",
    why: "Doppler, channel estimation, and handover latency bound mobility. Ultra-reliable (99.999%) modes are URLLC features, not default eMBB.",
  },
];

const useCases = [
  { icon: Factory, name: "Smart manufacturing", four: 3, five: 5, note: "Industrial IoT + TSN over 5G enables cable-free AGVs and flexible cells. 4G covers basic telemetry." },
  { icon: Car, name: "Autonomous systems", four: 2, five: 5, note: "Vehicle-to-everything needs low latency + high reliability. 5G URLLC design fits; 4G is marginal for safety loops." },
  { icon: Building2, name: "Smart cities", four: 4, five: 5, note: "Dense sensors + video: 4G handles meters; 5G adds camera-scale capacity and slicing for municipal services." },
  { icon: HeartPulse, name: "Telemedicine", four: 3, five: 4, note: "HD video works on 4G; 5G eMBB + edge lowers delay for remote-guided procedures and high-res imaging." },
  { icon: Glasses, name: "AR / XR", four: 2, five: 5, note: "Sustained >100 Mbps + <20 ms motion-to-photon demands eMBB + edge. 4G struggles with downlink-heavy AR." },
  { icon: Siren, name: "Emergency communication", four: 4, five: 5, note: "Mission-critical push-to-talk exists on both; 5G adds priority, pre-emption, and multicast for large incident groups." },
];

const factors = [
  "Available spectrum & channel width (B)",
  "Cell load / active users (scheduling contention)",
  "Signal quality (SINR, fading, interference)",
  "MIMO configuration & device capability",
  "Backhaul / fronthaul capacity & core placement",
  "Edge compute distance to the application",
  "Device power, thermal, and antenna design",
  "Band propagation (path loss, blockage, penetration)",
];

function suitLabel(score: number) {
  if (score >= 5) return "Excellent fit";
  if (score === 4) return "Strong fit";
  if (score === 3) return "Workable";
  if (score === 2) return "Marginal";
  return "Weak fit";
}

function suitColor(score: number) {
  if (score >= 4) return "text-[var(--good)] border-[var(--good)]/25 bg-[var(--good)]/[.07]";
  if (score === 3) return "text-[var(--warn)] border-[var(--warn)]/25 bg-[var(--warn)]/[.07]";
  return "text-[var(--bad)] border-[var(--bad)]/25 bg-[var(--bad)]/[.07]";
}

function SuitDots({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("h-1.5 w-4 rounded-full", i <= score ? "bg-[var(--cyan)]" : "bg-white/[.08]")} />
      ))}
    </span>
  );
}

export default function PerformancePage() {
  usePageMeta({
    title: "Performance Lab — 4G vs 5G",
    description:
      "Compare 4G LTE and 5G across throughput, latency, density, spectral efficiency and slicing, with tunable illustrative conditions and IMT-2020 target labels.",
  });

  const [gen, setGen] = useState<Gen>("5g");
  const [bwMHz, setBwMHz] = useLocalStorage("performance-bandwidth", 100);
  const [loadPct, setLoadPct] = useLocalStorage("performance-load", 35);
  const [focusMetric, setFocusMetric] = useState("tput");

  const loadFactor = 1 - loadPct / 100;
  const fourTput = Math.max(0.02, 0.8 * (bwMHz / 40) * (1 - loadPct / 140));
  const fiveTput = Math.max(0.05, 8 * (bwMHz / 100) * (1 - loadPct / 140));
  const fourLat = 28 + loadPct * 0.25;
  const fiveLat = 7 + loadPct * 0.12;
  const fiveSe = 2.2 + (bwMHz / 200) * 1.2;
  const fourSe = 1.4 + (bwMHz / 300) * 0.4;

  const tputData = useMemo(
    () => [
      { name: "4G LTE", throughput: Number(fourTput.toFixed(2)), latency: Number(fourLat.toFixed(1)) },
      { name: "5G", throughput: Number(fiveTput.toFixed(2)), latency: Number(fiveLat.toFixed(1)) },
    ],
    [fourTput, fiveTput, fourLat, fiveLat],
  );

  const radarData = useMemo(
    () => [
      { axis: "Throughput", four: 32, five: Math.min(100, 45 + fiveTput * 6) },
      { axis: "Latency", four: 38, five: Math.min(100, 96 - fiveLat * 2) },
      { axis: "Density", four: 45, five: 92 },
      { axis: "Spectral eff.", four: (() => Math.min(100, fourSe * 22))(), five: Math.min(100, fiveSe * 15) },
      { axis: "Slicing", four: 28, five: 95 },
      { axis: "Mobility", four: 68, five: 90 },
    ],
    [fourSe, fiveSe, fiveTput, fiveLat],
  );

  const activeMetric = metrics.find((m) => m.id === focusMetric) ?? metrics[0];
  const focusScore = Math.min(100, (gen === "5g" ? fiveTput * 8 : fourTput * 25)).toFixed(0);

  return (
    <>
      <PageHeader
        index="05"
        eyebrow="Performance"
        title={
          <>
            4G LTE <span className="text-[var(--muted)]">vs</span> <span className="text-gradient">5G</span> — measured against targets, not hype.
          </>
        }
        description="A comparison lab, not a benchmark contest. Every number below is either an ITU IMT-2020 target or a clearly labelled illustrative range. Tune the network conditions and watch the illustrative values move."
        badges={["IMT-2020 targets", "Illustrative ranges", "Tunables"]}
        aside={
          <div className="glass-panel overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Honesty box</span>
              <Gauge className="h-4 w-4 text-[var(--warn)]" />
            </div>
            <p className="mt-3 text-[11.5px] leading-5 text-[var(--muted)]">
              No bar-speed tests, no carrier claims. Targets describe what the standard <em>aims</em> for; typicals describe what good field deployments often achieve under favourable conditions.
            </p>
            <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-3.5">
              <p className="flex justify-between text-[10px]"><span className="text-[var(--subtle)]">Source framing</span><span className="font-mono text-[9px] text-[var(--text)]">ITU-R IMT-2020</span></p>
              <p className="flex justify-between text-[10px]"><span className="text-[var(--subtle)]">Nature of values</span><span className="font-mono text-[9px] text-[var(--text)]">Illustrative</span></p>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        {/* Focus toggle + conditions */}
        <SectionReveal>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
            <div className="rounded-[22px] border border-[var(--line-strong)] bg-[var(--bg-deep)]/70 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <SegmentedControl label="Focus generation" value={gen} onChange={setGen} options={[{ value: "4g", label: "4G LTE" }, { value: "5g", label: "5G" }]} className="max-w-[260px]" />
                <StatusPill label={gen === "4g" ? "Established broadband" : "Design targets + typicals"} tone={gen === "4g" ? "neutral" : "info"} />
              </div>
              <div className="mt-7 flex items-end gap-4">
                <p className="font-display text-[clamp(56px,10vw,96px)] font-medium leading-[.82] tracking-[-.07em] text-[var(--text)]">
                  {gen === "4g" ? "4G" : "5G"}
                </p>
                <p className="max-w-[240px] pb-1 text-[11px] leading-5 text-[var(--muted)]">
                  {gen === "4g"
                    ? "Mobile broadband foundation. EPC, eNodeB, 2×2–4×4 MIMO. Slicing is limited to APNs."
                    : "eMBB + URLLC + mMTC design. 5GC, gNB, massive MIMO, S-NSSAI slicing, edge-ready."}
                </p>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Throughput*" value={(gen === "4g" ? fourTput : fiveTput).toFixed(2)} unit="Gbps" hint="Illustrative now" />
                <Stat label="Latency*" value={(gen === "4g" ? fourLat : fiveLat).toFixed(0)} unit="ms" hint="Illustrative now" />
                <Stat label="Spectral eff." value={(gen === "4g" ? fourSe : fiveSe).toFixed(1)} unit="b/s/Hz" />
                <Stat label="Focus score" value={focusScore} unit="/100" hint="Throughput-scaled" tone="cyan" />
              </div>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--blue))]"
                  animate={{ width: `${focusScore}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 18 }}
                />
              </div>
              <p className="mt-2 text-[9.5px] leading-4 text-[var(--subtle)]">
                * Scaled by slidable conditions on the right. Illustrative only — not a measurement, not a promise.
              </p>
            </div>

            <Panel className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--cyan)]" />
                <span className="text-[12px] font-semibold text-[var(--text)]">Network conditions</span>
              </div>
              <div className="mt-5 space-y-5">
                <SliderField label="Spectrum bandwidth" value={bwMHz} min={10} max={400} step={10} unit="MHz" onChange={setBwMHz} hint="Forces realistic scaling: wider → faster." />
                <SliderField label="Cell load" value={loadPct} min={0} max={90} step={5} unit="%" onChange={setLoadPct} accent="warn" hint="Higher load reduces effective throughput." />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2.5 text-center">
                  <p className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">4G illustr.</p>
                  <p className="mt-1 font-display text-[18px] text-[var(--text)]">{fourTput.toFixed(2)} <span className="text-[10px] text-[var(--muted)]">Gbps</span></p>
                </div>
                <div className="rounded-lg border border-[var(--cyan)]/25 bg-[var(--cyan)]/[.05] px-3 py-2.5 text-center">
                  <p className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">5G illustr.</p>
                  <p className="mt-1 font-display text-[18px] text-[var(--cyan)]">{fiveTput.toFixed(2)} <span className="text-[10px]">Gbps</span></p>
                </div>
              </div>
              <p className="mt-3 text-[9.5px] leading-4 text-[var(--subtle)]">
                Load factor ×{loadFactor.toFixed(2)}. Values re-scale live; they never represent carrier performance.
              </p>
            </Panel>
          </div>
        </SectionReveal>

        {/* Charts */}
        <SectionReveal className="mt-14">
          <SectionHeader
            eyebrow="Side-by-side"
            title="Same conditions, two generations."
            description="Bar chart: illustrative throughput at your bandwidth/load. Radar: capability profile (0–100, relative — not a benchmark). Read both as ‘by design’ rather than ‘in the wild’."
            action={<StatusPill label="Illustrative · local model" tone="warn" />}
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Panel className="p-4">
              <p className="px-2 pt-2 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Illustrative peak throughput (Gbps)</p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tputData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--line-strong)", borderRadius: 10, fontSize: 11 }} formatter={(v) => [`${v} Gbps`, "Throughput"]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="throughput" name="Throughput (Gbps)" radius={[6, 6, 0, 0]} fill="var(--cyan)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <InfoNote label="Note">IMT-2020 peak target (20 Gbps) is an idealized evaluation scenario — not a subscriber expectation.</InfoNote>
            </Panel>
            <Panel className="p-4">
              <p className="px-2 pt-2 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Capability profile (relative 0–100)</p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="var(--line)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted)", fontSize: 10 }} />
                    <Radar name="4G LTE" dataKey="four" stroke="var(--muted)" fill="var(--muted)" fillOpacity={0.14} />
                    <Radar name="5G" dataKey="five" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.22} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--line-strong)", borderRadius: 10, fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <InfoNote label="Read carefully">Scores are editorial normalizations for teaching — higher is ‘more capable by design’, not ‘faster in your city’.</InfoNote>
            </Panel>
          </div>
        </SectionReveal>

        {/* Metric explorer */}
        <SectionReveal className="mt-14">
          <SectionHeader
            eyebrow="Metric explorer"
            title="Six numbers that actually separate the generations."
            description="Select a metric to see its targets, typical ranges, and the engineering reason it moves."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {metrics.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setFocusMetric(m.id)}
                aria-pressed={focusMetric === m.id}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-[11.5px] font-semibold transition-colors",
                  focusMetric === m.id ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/[.08] text-[var(--text)]" : "border-[var(--line)] bg-white/[.02] text-[var(--muted)] hover:text-[var(--text)]",
                )}
              >
                {m.title}
              </button>
            ))}
          </div>
          <Panel className="mt-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Eyebrow>{activeMetric.title}</Eyebrow>
                <p className="mt-2 font-display text-[22px] tracking-[-.03em] text-[var(--text)]">{activeMetric.why}</p>
              </div>
              <span className="rounded-md border border-[var(--line)] bg-[var(--bg-deep)]/50 px-2.5 py-1 font-mono text-[9px] text-[var(--muted)]">{activeMetric.unit}</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">4G LTE — targets vs typicals</p>
                <p className="mt-2 text-[12px] font-semibold text-[var(--text)]">{activeMetric.fourTarget}</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">{activeMetric.fourTypical}</p>
              </div>
              <div className="rounded-xl border border-[var(--cyan)]/20 bg-[var(--cyan)]/[.04] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">5G — targets vs typicals</p>
                <p className="mt-2 text-[12px] font-semibold text-[var(--text)]">{activeMetric.fiveTarget}</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">{activeMetric.fiveTypical}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {metrics.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFocusMetric(m.id)}
                  className={cn("rounded-lg border px-3.5 py-3 text-left transition-colors", m.id === focusMetric ? "border-[var(--line-strong)] bg-white/[.03]" : "border-[var(--line)] bg-white/[.015] hover:bg-white/[.03]")}
                >
                  <p className="text-[11.5px] font-semibold text-[var(--text)]">{m.title}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--subtle)]">4G: {m.fourTypical} · 5G: {m.fiveTypical}</p>
                </button>
              ))}
            </div>
          </Panel>
        </SectionReveal>

        {/* Use cases */}
        <SectionReveal className="mt-14">
          <SectionHeader
            eyebrow="Where each generation fits"
            title="Applications expose the real difference."
            description="Suitability ratings are architectural fit (1–5), not speedtest results. The same app can run on 4G — the question is whether it can run well, reliably, and at scale."
            action={<StatusPill label="Architectural fit" tone="info" />}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <Panel key={u.name} className="p-5" hover>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--cyan)]/20 bg-[var(--cyan)]/[.06] text-[var(--cyan)]">
                    <u.icon className="h-4 w-4" />
                  </span>
                  <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[.1em]", suitColor(u.five))}>{suitLabel(u.five)} on 5G</span>
                </div>
                <p className="mt-3 font-display text-[17px] leading-tight tracking-[-.02em] text-[var(--text)]">{u.name}</p>
                <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">{u.note}</p>
                <div className="mt-4 space-y-2.5 border-t border-[var(--line)] pt-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">4G</span>
                    <SuitDots score={u.four} />
                    <span className="font-mono text-[10px] text-[var(--muted)]">{u.four}/5</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--cyan)]">5G</span>
                    <SuitDots score={u.five} />
                    <span className="font-mono text-[10px] text-[var(--cyan)]">{u.five}/5</span>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </SectionReveal>

        {/* Factors */}
        <SectionReveal className="mt-14">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <Panel className="p-5 sm:p-6">
              <Eyebrow>Why your speed test disagrees</Eyebrow>
              <h3 className="mt-3 font-display text-[21px] leading-tight tracking-[-.03em] text-[var(--text)]">Real performance is a budget, not a sticker.</h3>
              <p className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">
                Anyone quoting a single Gbps figure without these eight factors is marketing. A private-network engineer sizes all of them before promising a service level.
              </p>
              <ul className="mt-5 space-y-2.5">
                {factors.map((f, i) => (
                  <li key={f} className="flex items-start gap-3 text-[12px] text-[var(--muted)]">
                    <span className="mt-0.5 font-mono text-[9px] text-[var(--cyan)]">{String(i + 1).padStart(2, "0")}</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel className="p-5 sm:p-6">
              <Eyebrow>Worked reading</Eyebrow>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">At your current sliders</p>
                  <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                    {bwMHz} MHz · {loadPct}% load → illustrative <span className="font-semibold text-[var(--text)]">{fourTput.toFixed(2)} Gbps (4G)</span> vs{" "}
                    <span className="font-semibold text-[var(--cyan)]">{fiveTput.toFixed(2)} Gbps (5G)</span>, latency {fourLat.toFixed(0)} ms vs {fiveLat.toFixed(0)} ms. Narrow the
                    bandwidth or raise load and both collapse — 5G simply starts from a wider pipe.
                  </p>
                </div>
                <InfoNote label="Sources & labels">
                  IMT-2020 figures reference ITU-R targets (peak 20 Gbps, 1 ms URLLC, 1M devices/km²). “Typical” ranges are indicative of favourable field conditions and vary by operator, band, and device.
                </InfoNote>
                <InfoNote label="What this is not">
                  Not a benchmark, not a carrier ranking, and not a prediction for any city, campus, or route. Use the sliders to build intuition, then verify with qualified RF engineering.
                </InfoNote>
              </div>
            </Panel>
          </div>
        </SectionReveal>
      </div>
    </>
  );
}
