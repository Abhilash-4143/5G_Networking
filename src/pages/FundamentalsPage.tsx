import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Antenna,
  Building2,
  Calculator,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Radio,
  RefreshCcw,
  Waves,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, Stat, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { SegmentedControl, SliderField, Toggle } from "@/components/ui/Controls";
import { Button } from "@/components/ui/Button";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";
import { useLocalStorage } from "@/lib/storage";
import { cn } from "@/lib/cn";

const C = 299_792_458;

function wavePath(cycles: number, w = 600, h = 120, amp = 34) {
  const mid = h / 2;
  let d = `M 0 ${mid.toFixed(1)}`;
  for (let x = 0; x <= w; x += 2) {
    const y = mid - amp * Math.sin((2 * Math.PI * cycles * x) / w);
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d;
}

function noisyWavePath(snrdB: number, w = 600, h = 120, amp = 32) {
  const mid = h / 2;
  const snrLin = Math.pow(10, snrdB / 10);
  const noiseAmp = Math.max(1, amp / Math.sqrt(snrLin));
  let d = `M 0 ${mid.toFixed(1)}`;
  for (let x = 0; x <= w; x += 2) {
    const clean = Math.sin((2 * Math.PI * 3 * x) / w) * amp;
    const n = Math.sin(x * 12.7 + snrdB) * 0.55 + Math.sin(x * 3.1 + 2) * 0.45;
    const y = mid - (clean + n * noiseAmp * 1.6);
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d;
}

function berLabel(snrDb: number) {
  if (snrDb >= 20) return { label: "Very clean · BER ≲ 10⁻⁵ illustrative", tone: "good" as const };
  if (snrDb >= 12) return { label: "Usable · BER ~10⁻³–10⁻⁴ illustrative", tone: "info" as const };
  if (snrDb >= 7) return { label: "Marginal · BER ~10⁻² illustrative", tone: "warn" as const };
  return { label: "Unreliable · BER > 10⁻¹ illustrative", tone: "bad" as const };
}

type Concept = {
  id: string;
  title: string;
  short: string;
  simple: string;
  technical: string;
  example: string;
  metric: string;
};

const concepts: Concept[] = [
  {
    id: "waves",
    title: "Radio waves",
    short: "Electricity changing in sync with magnetism",
    simple:
      "Radio waves are disturbances that travel through space carrying energy from one place to another without a wire. They can pass through walls, be reflected by buildings, and be captured by an antenna as a faint electrical wiggle.",
    technical:
      "A time-varying current in an antenna produces coupled time-varying E and H fields that propagate at c in free space. The wave is transverse in the far field; wavelength λ = c/f. Field strength, polarization, and phase determine how energy is received.",
    example:
      "An FM station at 100 MHz has a wavelength of ~3 m. A car roof antenna roughly a quarter-wave tall (~75 cm) resonates efficiently because it is a significant fraction of that wavelength.",
    metric: "λ = c / f",
  },
  {
    id: "frequency",
    title: "Frequency",
    short: "How fast the wave oscillates — cycles per second",
    simple:
      "Frequency is how many times the wave repeats every second, measured in Hertz (Hz). Higher frequency means more cycles crammed into the same distance, so the wave looks more ‘dense’ and each cycle is shorter.",
    technical:
      "f sets the carrier position in the spectrum, the electrical size of antennas (~λ/4), free-space path loss (∝ f² for fixed gain antennas), and regulatory band. In 5G, frequency selection trades coverage for capacity.",
    example:
      "700 MHz propagates far and penetrates walls well (λ ≈ 43 cm). 28 GHz mmWave propagates a few hundred metres line-of-sight (λ ≈ 1.07 cm) but offers huge contiguous bandwidth.",
    metric: "f = c / λ",
  },
  {
    id: "bandwidth",
    title: "Bandwidth",
    short: "How wide the channel is — the information pipe",
    simple:
      "Bandwidth is the width of the frequency slice you are allowed to use, measured in Hertz. A wider pipe can carry more information per second, because the signal can change faster without smearing into neighbouring channels.",
    technical:
      "In Shannon–Hartley terms, capacity ≈ B·log₂(1+SNR) bits/s. B is the channel bandwidth. Symbol rate scales with B (modulated by pulse shaping / roll-off), so spectral efficiency (bit/s/Hz) separates coding/modulation gains from raw width.",
    example:
      "A 20 MHz LTE channel at 4 bit/s/Hz gives ~80 Mbps theoretical. A 400 MHz 5G mmWave channel at the same efficiency gives ~1.6 Gbps theoretical — width, not magic.",
    metric: "C ≈ B·log₂(1+SNR)",
  },
  {
    id: "modulation",
    title: "Modulation",
    short: "Imprinting bits onto the wave",
    simple:
      "Modulation is how you write data onto a radio wave. You vary amplitude, phase, frequency, or a combination — like choosing different positions on a map (a constellation) to represent bits. More positions = more bits per symbol, but each position is closer together and easier to confuse in noise.",
    technical:
      "QPSK encodes 2 bit/symbol (4 phase states), 16-QAM encodes 4 (16 states), 64-QAM 6 (64 states). Symbol rate ≈ B/(1+α) with root-raised-cosine filtering. Constellation distance shrinks as M grows, so higher orders demand higher SNR for the same BER.",
    example:
      "A video call on a weak rural link may drop from 64-QAM to QPSK automatically. Fewer bits arrive per symbol, but almost all symbols are correct — the call stays alive rather than freezing.",
    metric: "k = log₂(M) bits/symbol",
  },
  {
    id: "antennas",
    title: "Antennas",
    short: "The interface between wires and waves",
    simple:
      "Antennas are metal shapes that turn electrical signals into radio waves and back again. Their shape and arrangement decide where the wave goes — a single dipole radiates in all directions, while an array of elements can steer a narrow beam like a torch.",
    technical:
      "Array factor AF(θ) = Σ wₙ·e^{j(n−1)ψ}, ψ = k·d·sinθ + β. Gain, beamwidth (~50–70°/N for uniform broadside arrays), sidelobe level, and polarization (co-/cross-pol discrimination) are set by weighting wₙ, spacing d, and element pattern. Massive MIMO exploits channel diversity and spatial multiplexing.",
    example:
      "A 64-element massive-MIMO panel at 3.5 GHz can form pencil beams toward individual users, reusing the same spectrum in different directions — like 64 carefully aimed torches sharing airspace.",
    metric: "AF = sin(Nψ/2)/sin(ψ/2)",
  },
  {
    id: "noise",
    title: "Noise & interference",
    short: "Unwanted energy that masks your signal",
    simple:
      "Noise is random hiss from electronics and nature (thermal noise ~−174 dBm/Hz) that adds jitter to your signal. Interference is structured — signals from other devices on the same frequency that look like a badly-timed neighbour talking over you.",
    technical:
      "SNR (dB) = P_signal − P_noise. Noise figure of the receiver, noise bandwidth, and interference power set effective SINR. Coding (LDPC/polar in 5G) provides gain for a given BER; lower-order modulation tolerates lower SINR at the cost of spectral efficiency.",
    example:
      "Free-space thermal noise in 100 MHz at 290 K is about −174 + 80 = −94 dBm before receiver noise figure. A phone with 7 dB NF needs a signal comfortably above −87 dBm to decode reliably — physics, not marketing.",
    metric: "SNR(dB) = 10·log₁₀(Pₛ/Pₙ)",
  },
  {
    id: "propagation",
    title: "Signal propagation",
    short: "How waves travel, bounce, and bend",
    simple:
      "Waves do not always travel in a straight line. They reflect off buildings, diffract around corners, scatter off foliage, and are absorbed by rain and walls. The receiver hears the sum of many copies arriving at slightly different times — which can reinforce (strong) or cancel (fade) the signal.",
    technical:
      "Link budget: Pᵣ = Pₜ + Gₜ + Gᵣ − L_fs − L_env. Path-loss exponent n (2 free space, 3–4 dense urban), shadowing, and multipath fading (Rayleigh/Rician) shape large- and small-scale variation. Delay spread limits flat-fading assumption; OFDM combats with cyclic prefix.",
    example:
      "In a city street, a phone may receive the direct signal plus 3 reflections delayed by 100–300 ns. Subcarriers help each narrowband channel experience near-flat fading even though the wideband signal fades.",
    metric: "Pᵣ = Pₜ·Gₜ·Gᵣ·(λ/4πd)²·L",
  },
];

const quiz: {
  q: string;
  options: string[];
  answer: number;
  why: string;
}[] = [
  {
    q: "A carrier moves from 3.5 GHz to 28 GHz with the same antenna gain in dBi. Ignoring environment, what happens to free-space path loss?",
    options: ["It falls by ~18 dB", "It rises by ~18 dB", "It stays the same", "It rises by 3 dB"],
    answer: 1,
    why: "FSPL ∝ (f·d)². 28/3.5 = 8 → 20·log₁₀(8) ≈ 18.06 dB more loss. Real arrays recover this with higher gain from many small elements.",
  },
  {
    q: "Doubling bandwidth from 50 MHz to 100 MHz at fixed SNR does what to Shannon capacity?",
    options: ["Quadruples it", "Doubles it", "Adds 3 dB", "Does nothing"],
    answer: 1,
    why: "C ≈ B·log₂(1+SNR). Capacity is linear in B when SNR is fixed, so doubling B doubles C (until other limits — coding, HARQ, scheduling — dominate).",
  },
  {
    q: "64-QAM carries 6 bits/symbol versus 2 for QPSK. What is the main cost of that gain?",
    options: ["More power amplifiers", "Lower symbol rate", "Need for higher SNR / closer constellation points", "Lower carrier frequency"],
    answer: 2,
    why: "64 points packed into the same average power give ~⅓ the minimum distance of QPSK. Error probability rises sharply unless SNR improves or coding is stronger.",
  },
  {
    q: "Increasing array elements from 4 to 16 (same spacing in wavelengths) primarily:",
    options: ["Doubles coverage range", "Narrows the main beam and raises gain", "Removes polarization dependence", "Halves bandwidth"],
    answer: 1,
    why: "Array gain grows ~ N and beamwidth shrinks ~ 1/N. Range does not double; the power is concentrated into a narrower, more useful direction.",
  },
  {
    q: "A building blocks the direct path but a reflected path via another facade arrives. The receiver may experience:",
    options: ["Only stronger signal, always", "Multipath fading with frequency-selective variation", "No effect at all", "A carrier frequency shift"],
    answer: 1,
    why: "Two or more copies with different delays sum as vectors. At some frequencies they add, at others they cancel — creating deep notches across the channel, mitigated by OFDM.",
  },
];

function ConceptViz({ id }: { id: string }) {
  if (id === "frequency") {
    return (
      <svg viewBox="0 0 300 110" className="h-full w-full" aria-label="Wave cycles">
        <line x1="0" y1="55" x2="300" y2="55" stroke="var(--line-strong)" strokeWidth="1" />
        <path d={wavePath(2, 300, 110, 30)} fill="none" stroke="var(--cyan)" strokeWidth="2" />
        <path d={wavePath(6, 300, 110, 30)} fill="none" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4 3" opacity=".7" />
      </svg>
    );
  }
  if (id === "modulation") {
    return (
      <svg viewBox="0 0 300 110" className="h-full w-full" aria-label="Constellation preview">
        {[-1, 1].map((sx) =>
          [-1, 1].map((sy) => (
            <circle key={`${sx}-${sy}`} cx={150 + sx * 55} cy={55 - sy * 28} r="6" fill="var(--cyan)" />
          )),
        )}
        <line x1="150" y1="5" x2="150" y2="105" stroke="var(--line)" />
        <line x1="30" y1="55" x2="270" y2="55" stroke="var(--line)" />
      </svg>
    );
  }
  if (id === "antennas") {
    return (
      <svg viewBox="0 0 300 110" className="h-full w-full" aria-label="Beam pattern preview">
        <path d="M150 100 C 90 95 95 30 150 25 C 205 30 210 95 150 100 Z" fill="var(--cyan)" opacity="0.25" stroke="var(--cyan)" strokeWidth="1.5" />
        <circle cx="150" cy="100" r="4" fill="var(--cyan)" />
        <path d="M150 100 L 60 20 M150 100 L 240 20" stroke="var(--line-strong)" strokeDasharray="3 4" />
      </svg>
    );
  }
  if (id === "propagation") {
    return (
      <svg viewBox="0 0 300 110" className="h-full w-full" aria-label="Propagation preview">
        <rect x="135" y="30" width="30" height="70" rx="3" fill="var(--blue)" opacity="0.35" stroke="var(--blue)" />
        <circle cx="30" cy="80" r="6" fill="var(--cyan)" />
        <circle cx="270" cy="80" r="6" fill="var(--good)" />
        <path d="M30 80 L 270 80" stroke="var(--bad)" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d="M30 80 L 150 30 L 270 80" stroke="var(--cyan)" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }
  if (id === "noise") {
    return (
      <svg viewBox="0 0 300 110" className="h-full w-full" aria-label="Noise preview">
        <path d={wavePath(3, 300, 110, 28)} fill="none" stroke="var(--cyan)" strokeWidth="2" />
        <path d={noisyWavePath(4, 300, 110, 28)} fill="none" stroke="var(--warn)" strokeWidth="1.4" opacity=".8" />
      </svg>
    );
  }
  if (id === "bandwidth") {
    return (
      <svg viewBox="0 0 300 110" className="h-full w-full" aria-label="Bandwidth preview">
        {[30, 80, 140, 210].map((x) => (
          <rect key={x} x={x} y={70 - (x % 90)} width="36" height={20 + (x % 90)} rx="3" fill="var(--cyan)" opacity="0.5" />
        ))}
        <line x1="10" y1="90" x2="290" y2="90" stroke="var(--line-strong)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 110" className="h-full w-full" aria-label="Radio wave preview">
      <path d="M150 55 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" fill="var(--cyan)" />
      <path d="M150 55 m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0" fill="none" stroke="var(--cyan)" opacity="0.5" />
      <path d="M150 55 m-48 0 a48 48 0 1 0 96 0 a48 48 0 1 0 -96 0" fill="none" stroke="var(--cyan)" opacity="0.25" />
    </svg>
  );
}

export default function FundamentalsPage() {
  usePageMeta({
    title: "Radio Fundamentals",
    description:
      "Interactive radio fundamentals: waves, frequency, bandwidth, modulation, antennas, noise and propagation with hands-on experiments and a knowledge check.",
  });

  const [conceptId, setConceptId] = useState("waves");
  const concept = concepts.find((c) => c.id === conceptId) ?? concepts[0];

  const [freqSlider, setFreqSlider] = useLocalStorage("fundamentals-freq-slider", 45);
  const [bwMHz, setBwMHz] = useLocalStorage("fundamentals-bandwidth", 100);
  const [snrDb, setSnrDb] = useLocalStorage("fundamentals-snr", 15);
  const [noiseSnr, setNoiseSnr] = useLocalStorage("fundamentals-noise-snr", 12);
  const [bestScore, setBestScore] = useLocalStorage("fundamentals-quiz-best", 0);

  const [mod, setMod] = useState<"qpsk" | "qam16" | "qam64">("qam16");
  const [modNoise, setModNoise] = useState(false);
  const [antennaN, setAntennaN] = useState(8);
  const [polar, setPolar] = useState<"vertical" | "horizontal">("vertical");
  const [building, setBuilding] = useState(true);

  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
  const [submitted, setSubmitted] = useState(false);

  const freqMHz = useMemo(() => {
    const lo = Math.log10(700);
    const hi = Math.log10(28000);
    const pos = lo + ((hi - lo) * freqSlider) / 100;
    return Math.pow(10, pos);
  }, [freqSlider]);

  const freqGHz = freqMHz / 1000;
  const lambdaM = C / (freqMHz * 1e6);
  const lambdaCm = lambdaM * 100;
  const freqNorm = (Math.log10(freqMHz) - Math.log10(700)) / (Math.log10(28000) - Math.log10(700));
  const cycles = 1 + freqNorm * 11;

  const snrLin = Math.pow(10, snrDb / 10);
  const capacityMbps = bwMHz * Math.log2(1 + snrLin);
  const capData = useMemo(
    () =>
      [10, 25, 50, 100, 200, 400].map((b) => ({
        name: `${b} MHz`,
        capacity: Math.round(b * Math.log2(1 + snrLin) * 10) / 10,
      })),
    [snrLin],
  );

  const modInfo = { qpsk: { m: 4, bits: 2, label: "QPSK", levels: 2 }, qam16: { m: 16, bits: 4, label: "16-QAM", levels: 4 }, qam64: { m: 64, bits: 6, label: "64-QAM", levels: 8 } }[mod];

  const constellation = useMemo(() => {
    const Lv = modInfo.levels;
    const pts: { x: number; y: number; i: number }[] = [];
    for (let i = 0; i < Lv; i++) {
      for (let j = 0; j < Lv; j++) {
        const baseX = ((i - (Lv - 1) / 2) / ((Lv - 1) / 2 || 1)) * 95;
        const baseY = ((j - (Lv - 1) / 2) / ((Lv - 1) / 2 || 1)) * 95;
        let dx = 0;
        let dy = 0;
        if (modNoise) {
          const k = i * Lv + j;
          dx = Math.sin(k * 12.3 + 1.7) * 16;
          dy = Math.cos(k * 7.9 + 0.4) * 16;
        }
        pts.push({ x: 150 + baseX + dx, y: 110 - baseY + dy, i: i * Lv + j });
      }
    }
    return pts;
  }, [modInfo.levels, modNoise]);

  const beamData = useMemo(() => {
    const pts: { angle: number; gain: number }[] = [];
    for (let a = -90; a <= 90; a += 2) {
      const theta = (a * Math.PI) / 180;
      const psi = Math.PI * Math.sin(theta);
      const af = Math.abs(Math.sin((antennaN * psi) / 2) / (Math.sin(psi / 2) || 1e-6));
      pts.push({ angle: a, gain: af });
    }
    return pts;
  }, [antennaN]);
  const beamPath = useMemo(() => {
    const w = 600;
    const h = 160;
    const midY = h - 20;
    const scaleX = w / 180;
    const scaleY = 120;
    return beamData.map((p, idx) => `${idx === 0 ? "M" : "L"} ${(p.angle + 90) * scaleX} ${(midY - p.gain * scaleY).toFixed(1)}`).join(" ");
  }, [beamData]);
  const beamwidth = Math.round(70 / antennaN);
  const arrayGainDb = (10 * Math.log10(antennaN)).toFixed(1);

  const ber = berLabel(noiseSnr);
  const strength = building ? 42 : 88;
  const strengthTone = building ? "Fading / obstructed" : "Strong direct path";

  const score = answers.filter((a, i) => a === quiz[i].answer).length;
  const answered = answers.filter((a) => a !== null).length;

  function retry() {
    setAnswers([null, null, null, null, null]);
    setSubmitted(false);
  }

  return (
    <>
      <PageHeader
        index="02"
        eyebrow="Fundamentals"
        title={
          <>
            Radio, <span className="text-gradient">from first principles.</span>
          </>
        }
        description="Seven core ideas behind every wireless system — each with a plain-language version, the engineering version, and a working experiment you can push around. No carrier, no measurement claim: everything below is a local educational model."
        badges={["Interactive labs", "Radio physics", "Quiz included"]}
        aside={
          <div className="glass-panel overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Learning path</span>
              <GraduationCap className="h-4 w-4 text-[var(--cyan)]" />
            </div>
            <ol className="mt-5 space-y-2.5">
              {["Waves & frequency", "Bandwidth & Shannon", "Modulation & constellations", "Antennas & beams", "Noise, SNR & BER", "Propagation & fading"].map(
                (s, i) => (
                  <li key={s} className="flex gap-3 text-[11px]">
                    <span className="font-mono text-[9px] text-[var(--cyan)]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[var(--muted)]">{s}</span>
                  </li>
                ),
              )}
            </ol>
            <div className="mt-5 border-t border-[var(--line)] pt-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">Quiz best score</span>
                <span className="font-mono text-[10px] text-[var(--text)]">{bestScore} / 5</span>
              </div>
              <p className="mt-1.5 text-[9.5px] leading-4 text-[var(--subtle)]">
                Finish the check at the bottom. Your best score is kept locally in this browser.
              </p>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        {/* Concepts */}
        <SectionReveal>
          <SectionHeader
            eyebrow="The seven building blocks"
            title="Pick a concept. Read it two ways."
            description="Every card pairs a simple explanation with the technical model engineers actually use, plus a real-world anchor."
            action={<StatusPill label={`${concepts.length} concepts · 2 depths`} tone="info" />}
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {concepts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConceptId(c.id)}
                  aria-pressed={c.id === conceptId}
                  className={cn(
                    "min-w-[210px] rounded-xl border p-3.5 text-left transition-colors lg:min-w-0",
                    c.id === conceptId
                      ? "border-[var(--cyan)]/40 bg-[var(--cyan)]/[.07]"
                      : "border-[var(--line)] bg-white/[.02] hover:border-[var(--line-strong)]",
                  )}
                >
                  <p className="text-[12px] font-semibold text-[var(--text)]">{c.title}</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-[var(--muted)]">{c.short}</p>
                  <p className="mt-2 font-mono text-[9px] text-[var(--cyan)]">{c.metric}</p>
                </button>
              ))}
            </div>

            <Panel className="overflow-hidden p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Eyebrow>{concept.title}</Eyebrow>
                  <p className="mt-2 font-display text-[22px] leading-tight tracking-[-.03em] text-[var(--text)]">{concept.short}</p>
                </div>
                <span className="rounded-md border border-[var(--line)] bg-[var(--bg-deep)]/50 px-2.5 py-1 font-mono text-[9px] text-[var(--cyan)]">
                  {concept.metric}
                </span>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)]">In plain terms</p>
                  <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">{concept.simple}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)]">The technical model</p>
                  <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">{concept.technical}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2.5 rounded-xl border border-[var(--cyan)]/15 bg-[var(--cyan)]/[.04] p-4">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan)]" />
                <p className="text-[11.5px] leading-5 text-[var(--muted)]">
                  <span className="font-semibold text-[var(--text)]">Real-world anchor: </span>
                  {concept.example}
                </p>
              </div>
              <div className="mt-4 h-[110px] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/40 p-2">
                <ConceptViz id={concept.id} />
              </div>
            </Panel>
          </div>
        </SectionReveal>

        {/* Frequency */}
        <SectionReveal className="mt-16 lg:mt-20">
          <SectionHeader
            eyebrow="Experiment 01 — Frequency"
            title="Stretch and squeeze the wave."
            description="Drag the log-slider from 700 MHz to 28 GHz. Watch the same window hold more cycles as frequency rises, and read the true wavelength (λ = c/f) at each step."
            action={<StatusPill label="Log scale · illustrative" tone="info" />}
          />
          <Panel className="mt-8 overflow-hidden p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_300px]">
              <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-3">
                <svg viewBox="0 0 600 120" className="h-auto w-full" aria-label="Frequency wave density">
                  <line x1="0" y1="60" x2="600" y2="60" stroke="var(--line-strong)" strokeDasharray="3 5" />
                  <path d={wavePath(cycles)} fill="none" stroke="var(--cyan)" strokeWidth="2.2" />
                  <path d={wavePath(Math.max(1, cycles * 0.5))} fill="none" stroke="var(--violet)" strokeWidth="1.3" strokeDasharray="5 4" opacity=".55" />
                </svg>
                <div className="mt-2 flex justify-between px-1 font-mono text-[9px] text-[var(--subtle)]">
                  <span>1 cycle stretch (low f)</span>
                  <span>{cycles.toFixed(1)} cycles shown</span>
                  <span>dense (high f)</span>
                </div>
              </div>
              <div className="space-y-4">
                <SliderField label="Frequency (log)" value={freqSlider} min={0} max={100} unit="" onChange={setFreqSlider} hint="Log-spaced from 700 MHz to 28 GHz. Settings persist locally." />
                <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-3.5">
                  <p className="font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Carrier</p>
                  <p className="mt-1 font-display text-[26px] leading-none tracking-[-.03em] text-[var(--text)]">
                    {freqGHz < 1 ? `${freqMHz.toFixed(0)}` : `${freqGHz.toFixed(2)}`} <span className="text-[13px] text-[var(--muted)]">{freqGHz < 1 ? "MHz" : "GHz"}</span>
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">λ = {lambdaCm.toFixed(1)} cm</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Period" value={(1 / (freqMHz * 1e6) * 1e9).toFixed(2)} unit="ns" hint="T = 1/f" />
                  <Stat label="FSPL drift" value={`${(20 * Math.log10(freqMHz / 700)).toFixed(1)}`} unit="dB" hint="vs 700 MHz, same d" />
                </div>
                <p className="text-[10px] leading-4 text-[var(--subtle)]">
                  λ/4 antenna ≈ {(lambdaCm / 4).toFixed(1)} cm — why sub-1 GHz handsets need long antennas and mmWave arrays fit dozens of elements.
                </p>
              </div>
            </div>
          </Panel>
        </SectionReveal>

        {/* Bandwidth */}
        <SectionReveal className="mt-16 lg:mt-20">
          <SectionHeader
            eyebrow="Experiment 02 — Bandwidth & Shannon"
            title="Width is capacity."
            description="Set channel bandwidth and SNR, then read Shannon capacity B·log₂(1+SNR). The bar chart re-derives capacity at six bandwidths for your SNR."
            action={<StatusPill label="Simplified model" tone="warn" />}
          />
          <Panel className="mt-8 p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <SliderField label="Channel bandwidth" value={bwMHz} min={5} max={400} step={5} unit="MHz" onChange={setBwMHz} />
                <SliderField label="SNR" value={snrDb} min={0} max={30} step={1} unit="dB" onChange={setSnrDb} accent="warn" hint="Signal-to-noise ratio at the receiver." />
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Shannon capacity</p>
                  <p className="mt-1 font-display text-[clamp(30px,4vw,44px)] leading-none tracking-[-.05em] text-[var(--text)]">
                    {capacityMbps >= 1000 ? `${(capacityMbps / 1000).toFixed(2)}` : `${Math.round(capacityMbps)}`}
                    <span className="ml-1.5 text-[15px] text-[var(--muted)]">{capacityMbps >= 1000 ? "Gbps" : "Mbps"}</span>
                  </p>
                  <p className="mt-2 font-mono text-[10px] leading-4 text-[var(--muted)]">
                    = {bwMHz} MHz × log₂(1 + {snrLin.toFixed(1)})
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--blue))]"
                      animate={{ width: `${Math.min(100, (capacityMbps / 2500) * 100).toFixed(1)}%` }}
                      transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    />
                  </div>
                </div>
                <InfoNote label="Disclaimer">
                  Simplified educational model (AWGN only). Real throughput is lower due to coding overhead, cyclic prefix, scheduling, HARQ, MIMO layers, and interference.
                </InfoNote>
              </div>
              <div className="min-w-0 rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/40 p-3">
                <p className="px-2 pt-2 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">
                  Capacity vs bandwidth @ {snrDb} dB SNR (Mbps)
                </p>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
                      <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
                      <Tooltip
                        contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--line-strong)", borderRadius: 10, fontSize: 11 }}
                        formatter={(v) => [`${v} Mbps`, "Capacity"]}
                      />
                      <Bar dataKey="capacity" radius={[6, 6, 0, 0]} fill="var(--cyan)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Panel>
        </SectionReveal>

        {/* Modulation */}
        <SectionReveal className="mt-16 lg:mt-20">
          <SectionHeader
            eyebrow="Experiment 03 — Modulation"
            title="More bits per symbol, closer calls."
            description="Switch between QPSK, 16-QAM and 64-QAM. The constellation shows symbol positions; add noise and watch the clouds merge."
            action={<StatusPill label={`${modInfo.bits} bit/symbol · ${modInfo.m} states`} tone="info" />}
          />
          <Panel className="mt-8 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SegmentedControl label="Modulation scheme" value={mod} onChange={setMod} options={[{ value: "qpsk", label: "QPSK" }, { value: "qam16", label: "16-QAM" }, { value: "qam64", label: "64-QAM" }]} className="max-w-[360px]" />
              <div className="w-full max-w-[280px]">
                <Toggle label="Add channel noise" checked={modNoise} onChange={setModNoise} description="Scatter each symbol like a noisy channel would." />
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-3">
                <p className="px-2 pt-1 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Constellation — {modInfo.label}{modNoise ? " · noisy" : ""}</p>
                <svg viewBox="0 0 300 220" className="h-auto w-full" aria-label="Modulation constellation">
                  <line x1="150" y1="10" x2="150" y2="210" stroke="var(--line)" />
                  <line x1="20" y1="110" x2="280" y2="110" stroke="var(--line)" />
                  <circle cx="150" cy="110" r="4" fill="var(--line-strong)" />
                  {constellation.map((p) => (
                    <circle key={p.i} cx={p.x} cy={p.y} r={mod === "qam64" ? 2.6 : 4.5} fill={modNoise ? "var(--warn)" : "var(--cyan)"} opacity="0.88" />
                  ))}
                </svg>
                <p className="px-2 pb-1 text-[10px] text-[var(--subtle)]">Each point is one symbol. Decision regions are the Voronoi cells — symbols crossing a boundary are errors.</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Symbol waveform strip (I)</p>
                  <svg viewBox="0 0 400 90" className="mt-3 h-auto w-full" aria-label="Waveform strip">
                    <path
                      d={(() => {
                        const seq = mod === "qpsk" ? [1, -1, 1, 1, -1] : mod === "qam16" ? [1, 0.33, -0.33, -1, 0.33, 1] : [1, 0.71, 0.43, -0.14, -0.43, -0.71, 0.14, 1];
                        const points = seq.map((v, i) => `M ${10 + i * 60} 45 L ${10 + i * 60} ${45 - v * 30} L ${10 + i * 60 + 60} ${45 - v * 30}`);
                        return points.join(" ");
                      })()}
                      fill="none"
                      stroke="var(--cyan)"
                      strokeWidth="2"
                    />
                    <line x1="0" y1="45" x2="400" y2="45" stroke="var(--line)" strokeDasharray="3 4" />
                  </svg>
                  <p className="mt-2 text-[10px] leading-4 text-[var(--subtle)]">Stepped levels are the I-channel symbol values. Q-channel is orthogonal (90° phase).</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Bits/symbol" value={modInfo.bits} />
                  <Stat label="States" value={modInfo.m} />
                  <Stat label="SNR need" value={mod === "qpsk" ? "Low" : mod === "qam16" ? "Medium" : "High"} hint={modNoise ? "Noise on" : "Noise off"} />
                </div>
                <InfoNote label="Trade-off">
                  {mod === "qpsk" ? "Robust choice on poor links; spectral efficiency is sacrificed." : mod === "qam16" ? "Good middle ground for mid-range links." : "Best near the cell with excellent SNR; collapses quickly as SNR falls."}
                </InfoNote>
              </div>
            </div>
          </Panel>
        </SectionReveal>

        {/* Antennas */}
        <SectionReveal className="mt-16 lg:mt-20">
          <SectionHeader
            eyebrow="Experiment 04 — Antennas & beams"
            title="Add elements. Steer the beam."
            description="A uniform array concentrates energy into a narrower main lobe as element count N grows. The plot below is the normalized array factor."
            action={<StatusPill label={`${beamwidth}° beam · ${arrayGainDb} dB gain`} tone="good" />}
          />
          <Panel className="mt-8 p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <SliderField label="Array elements" value={antennaN} min={2} max={16} step={1} unit="el" onChange={setAntennaN} hint="Uniform linear array, broadside steering." />
                <SegmentedControl label="Polarization" value={polar} onChange={setPolar} options={[{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }]} />
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Main beamwidth" value={`~${beamwidth}`} unit="°" hint="~70°/N illustrative" />
                  <Stat label="Array gain" value={arrayGainDb} unit="dB" hint="10·log₁₀(N)" />
                </div>
                <InfoNote label="Polarization">
                  {polar === "vertical" ? "Vertical E-field matches typical phone orientation; good in urban multipath." : "Horizontal suits base-station / rooftop runs and reduces multipath depolarization in some links."} Both
                  preserve co-polar signal; cross-pol leakage is a design metric.
                </InfoNote>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-3">
                <p className="px-2 pt-1 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Normalized array factor |AF| vs angle (N={antennaN}, {polar})</p>
                <svg viewBox="0 0 600 180" className="h-auto w-full" aria-label="Array factor pattern">
                  <line x1="0" y1="160" x2="600" y2="160" stroke="var(--line-strong)" />
                  <line x1="300" y1="10" x2="300" y2="160" stroke="var(--line)" strokeDasharray="3 4" />
                  <path d={beamPath} fill="none" stroke="var(--cyan)" strokeWidth="2.2" />
                  <path d={`${beamPath} L 600 160 L 0 160 Z`} fill="var(--cyan)" opacity="0.08" />
                  <text x="300" y="174" textAnchor="middle" fontSize="9" fill="var(--subtle)">Broadside 0°</text>
                  <text x="12" y="174" fontSize="9" fill="var(--subtle)">−90°</text>
                  <text x="588" y="174" textAnchor="end" fontSize="9" fill="var(--subtle)">+90°</text>
                </svg>
                <div className="mt-2 flex flex-wrap gap-2 px-2 pb-1">
                  {Array.from({ length: Math.min(antennaN, 8) }, (_, i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-[var(--cyan)]" title={`Element ${i + 1}`} />
                  ))}
                  {antennaN > 8 ? <span className="font-mono text-[9px] text-[var(--muted)]">+{antennaN - 8} more elements</span> : null}
                </div>
              </div>
            </div>
          </Panel>
        </SectionReveal>

        {/* Noise */}
        <SectionReveal className="mt-16 lg:mt-20">
          <SectionHeader
            eyebrow="Experiment 05 — Noise & interference"
            title="Hear the noise rise."
            description="Lower SNR and the clean sine collapses into jitter. Watch the qualitative BER band change with it."
            action={<StatusPill label={ber.label} tone={ber.tone} />}
          />
          <Panel className="mt-8 p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <SliderField label="SNR" value={noiseSnr} min={0} max={25} step={1} unit="dB" onChange={setNoiseSnr} accent="warn" />
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Noise power" value={(-(-174 + Math.log10(100e6) * 10)).toFixed(0)} unit="dBm" hint="100 MHz thermal,629" />
                  <Stat label="Verdict" value={noiseSnr >= 12 ? "Decodable" : noiseSnr >= 7 ? "Marginal" : "Unreliable"} />
                </div>
                <p className="text-[10.5px] leading-5 text-[var(--muted)]">
                  Thermal noise floor (kTB, 100 MHz) ≈ −94 dBm. Interference from neighbours adds on top — effective SINR is what the decoder sees, not the transmitter power.
                </p>
                <InfoNote label="BER bands">
                  Labels are qualitative and modulation-dependent. Strong FEC (LDPC) shifts curves by several dB — never compare raw BER across code rates without the code.
                </InfoNote>
              </div>
              <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-3">
                <p className="px-2 pt-1 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--subtle)]">Clean vs noisy (SNR {noiseSnr} dB)</p>
                <svg viewBox="0 0 600 140" className="h-auto w-full" aria-label="Clean and noisy waveforms">
                  <line x1="0" y1="70" x2="600" y2="70" stroke="var(--line-strong)" strokeDasharray="3 5" />
                  <path d={wavePath(3, 600, 140, 36)} fill="none" stroke="var(--cyan)" strokeWidth="2" />
                  <path d={noisyWavePath(noiseSnr, 600, 140, 36)} fill="none" stroke="var(--warn)" strokeWidth="1.5" opacity=".9" />
                </svg>
                <div className="flex gap-4 px-2 pb-1 font-mono text-[9px]">
                  <span className="flex items-center gap-1.5 text-[var(--cyan)]"><span className="h-1.5 w-4 rounded bg-[var(--cyan)]" /> Clean</span>
                  <span className="flex items-center gap-1.5 text-[var(--warn)]"><span className="h-1.5 w-4 rounded bg-[var(--warn)]" /> With noise</span>
                </div>
              </div>
            </div>
          </Panel>
        </SectionReveal>

        {/* Propagation */}
        <SectionReveal className="mt-16 lg:mt-20">
          <SectionHeader
            eyebrow="Experiment 06 — Propagation"
            title="Walls, corners, and quiet zones."
            description="Toggle the building. Watch the direct ray get blocked and slower reflected / diffracted copies carry the link — with fading to match."
            action={<StatusPill label={strengthTone} tone={building ? "warn" : "good"} />}
          />
          <Panel className="mt-8 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="w-full max-w-[300px]">
                <Toggle label="Building obstacle" checked={building} onChange={setBuilding} description="Block the line-of-sight path." />
              </div>
              <div className="flex items-center gap-6">
                <Stat label="Received power" value={`${-112 + strength / 1.2}`} unit="dBm" hint="Illustrative link budget" />
                <Stat label="Fading depth" value={building ? "12–18" : "2–3"} unit="dB" hint={building ? "Rayleigh-like" : "Rician-like"} />
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/50">
              <svg viewBox="0 0 700 300" className="h-auto w-full" aria-label="Propagation scene">
                <rect x="0" y="260" width="700" height="40" fill="var(--bg-elevated)" />
                <line x1="0" y1="260" x2="700" y2="260" stroke="var(--line-strong)" />
                <g>
                  <rect x="70" y="95" width="10" height="165" fill="var(--blue)" />
                  <rect x="62" y="85" width="26" height="22" rx="4" fill="var(--cyan)" />
                  <text x="75" y="78" textAnchor="middle" fontSize="9" fill="var(--muted)">gNB</text>
                </g>
                <g>
                  <rect x="600" y="200" width="16" height="60" rx="4" fill="var(--good)" />
                  <text x="608" y="192" textAnchor="middle" fontSize="9" fill="var(--muted)">UE</text>
                </g>
                {building ? (
                  <>
                    <rect x="330" y="110" width="90" height="150" rx="6" fill="var(--violet)" opacity="0.2" stroke="var(--violet)" strokeWidth="1.5" />
                    <text x="375" y="100" textAnchor="middle" fontSize="9" fill="var(--muted)">Building</text>
                    <path d="M75 96 L 608 200" stroke="var(--bad)" strokeWidth="2" strokeDasharray="6 5" />
                    <path d="M75 96 L 375 110 L 608 200" stroke="var(--cyan)" strokeWidth="2" fill="none" />
                    <path d="M75 96 L 330 130 Q 300 190 375 235 L 608 200" stroke="var(--warn)" strokeWidth="1.6" fill="none" strokeDasharray="2 5" />
                    <text x="340" y="125" fontSize="9" fill="var(--bad)">Direct blocked</text>
                    <text x="430" y="120" fontSize="9" fill="var(--cyan)">Reflected</text>
                    <text x="220" y="205" fontSize="9" fill="var(--warn)">Diffracted</text>
                  </>
                ) : (
                  <>
                    <path d="M75 96 L 608 200" stroke="var(--cyan)" strokeWidth="2.5" />
                    <path d="M75 96 L 375 150 L 608 200" stroke="var(--cyan)" strokeWidth="1.2" strokeDasharray="4 4" opacity=".45" fill="none" />
                    <text x="340" y="130" fontSize="9" fill="var(--cyan)">Line-of-sight</text>
                    <text x="430" y="165" fontSize="9" fill="var(--muted)">Weak reflection</text>
                  </>
                )}
              </svg>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { t: "Reflection", d: "Specular bounce off smooth surfaces. Delayed copies add vectorially with the direct ray." },
                { t: "Diffraction", d: "Bending around edges/corners. Dominates when the direct path is fully blocked (NLOS)." },
                { t: "Fading", d: "Small-scale amplitude fluctuation from many copies. OFDM + MIMO diversity are the countermeasures." },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-[var(--line)] bg-white/[.02] p-3.5">
                  <p className="text-[11.5px] font-semibold text-[var(--text)]">{c.t}</p>
                  <p className="mt-1 text-[10.5px] leading-5 text-[var(--muted)]">{c.d}</p>
                </div>
              ))}
            </div>
          </Panel>
        </SectionReveal>

        {/* Quiz */}
        <SectionReveal className="mt-16 lg:mt-20">
          <SectionHeader
            eyebrow="Knowledge check"
            title="Can you hold the ideas together?"
            description="Five questions, immediate explanations. Best score persists locally."
            action={
              <div className="flex items-center gap-2">
                <StatusPill label={`Best ${bestScore}/5`} tone="info" />
                <Button variant="quiet" size="sm" onClick={retry} iconLeft={<RefreshCcw className="h-3.5 w-3.5" />}>
                  Retry
                </Button>
              </div>
            }
          />
          <div className="mt-8 space-y-4">
            {quiz.map((item, qi) => {
              const picked = answers[qi];
              return (
                <Panel key={item.q} className="p-5">
                  <p className="text-[13px] font-semibold leading-6 text-[var(--text)]">
                    <span className="mr-2 font-mono text-[10px] text-[var(--cyan)]">Q{qi + 1}</span>
                    {item.q}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {item.options.map((opt, oi) => {
                      const isPicked = picked === oi;
                      const correct = submitted && oi === item.answer;
                      const wrong = submitted && isPicked && oi !== item.answer;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                          aria-pressed={isPicked}
                          className={cn(
                            "rounded-lg border px-3.5 py-3 text-left text-[12px] leading-5 transition-colors",
                            correct
                              ? "border-[var(--good)]/40 bg-[var(--good)]/[.08] text-[var(--text)]"
                              : wrong
                                ? "border-[var(--bad)]/40 bg-[var(--bad)]/[.07] text-[var(--text)]"
                                : isPicked
                                  ? "border-[var(--cyan)]/50 bg-[var(--cyan)]/[.07] text-[var(--text)]"
                                  : "border-[var(--line)] bg-white/[.02] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]",
                          )}
                        >
                          <span className="mr-2 font-mono text-[9px]">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && picked !== null && (
                    <div className="mt-3 flex gap-2 rounded-lg border border-[var(--line)] bg-white/[.02] px-3.5 py-3">
                      {picked === item.answer ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--good)]" /> : <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--bad)]" />}
                      <p className="text-[11px] leading-5 text-[var(--muted)]">{item.why}</p>
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-deep)]/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.13em] text-[var(--subtle)]">Progress</p>
              <p className="mt-1 font-display text-[22px] leading-none tracking-[-.03em] text-[var(--text)]">
                {answered} / 5 <span className="text-[13px] font-normal text-[var(--muted)]">answered</span>
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">Submit when all five are answered to lock in your score.</p>
            </div>
            <Button
              variant="primary"
              disabled={answered < 5 || submitted}
              onClick={() => {
                setSubmitted(true);
                setBestScore((b) => Math.max(b, score));
              }}
              iconLeft={<GraduationCap className="h-4 w-4" />}
            >
              {submitted ? `Score: ${score} / 5` : "Submit & check"}
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {[Radio, Waves, Calculator, Antenna, Activity, Building2, Zap].map((Icon, i) => (
              <span key={i} className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white/[.02] text-[var(--subtle)]">
                <Icon className="h-3.5 w-3.5" />
              </span>
            ))}
            <span className="ml-2 text-[10px] text-[var(--subtle)]">All models are local and illustrative — no network measurements are claimed.</span>
          </div>
        </SectionReveal>
      </div>
    </>
  );
}
