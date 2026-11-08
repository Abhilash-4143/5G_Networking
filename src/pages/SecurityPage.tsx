import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Check,
  CreditCard,
  Cpu,
  Download,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Network,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, Stat, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/Controls";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";
import { cn } from "@/lib/cn";

type SimKind = "sim" | "esim" | "isim";
type AuthMode = "success" | "fail";
type FailReason = "invalid" | "replay" | "revoked";

type AuthStep = {
  icon: typeof Smartphone;
  title: string;
  detail: string;
  log: string;
  tone: "info" | "ok" | "bad";
};

const SUCCESS_STEPS: AuthStep[] = [
  {
    icon: Smartphone,
    title: "Device requests access",
    detail: "Device performs cell selection and sends an attach request with a masked permanent identifier.",
    log: "DEV  attach request · SUCI masked · cell NR-03",
    tone: "info",
  },
  {
    icon: KeyRound,
    title: "Presents protected credentials",
    detail: "Secure element signs the network challenge. The long-term key never leaves the element.",
    log: "SE   signature over RAND · key stays in element",
    tone: "info",
  },
  {
    icon: BadgeCheck,
    title: "Network verifies",
    detail: "UDM / AuC recomputes the expected proof and checks freshness (no replay).",
    log: "UDM  proof matches · RAND fresh · counter OK",
    tone: "info",
  },
  {
    icon: Network,
    title: "Access authorized",
    detail: "Policy engine binds slice (S-NSSAI), QoS, and subscription state to this device.",
    log: "POL  authorized · slice eMBB · QoS 9",
    tone: "info",
  },
  {
    icon: ShieldCheck,
    title: "Session established",
    detail: "Integrity and ciphering keys are derived; PDCP session carries protected traffic.",
    log: "PDCP session keys derived · ciphering live · OK",
    tone: "ok",
  },
];

const FAIL_REASONS: { value: FailReason; label: string; short: string; detail: string; log: string }[] = [
  {
    value: "invalid",
    label: "Invalid credentials",
    short: "bad proof",
    detail: "Signature does not match the stored key — likely corrupted element or wrong subscription.",
    log: "AUTH FAIL · bad signature · key mismatch",
  },
  {
    value: "replay",
    label: "Replay detected",
    short: "replay",
    detail: "Challenge or counter is stale — capture replay cannot re-authenticate.",
    log: "AUTH FAIL · replay · RAND reused / counter stale",
  },
  {
    value: "revoked",
    label: "Subscription revoked",
    short: "revoked",
    detail: "Subscriber profile disabled by operator; even a valid proof is refused.",
    log: "AUTH FAIL · subscription revoked · UDM deny",
  },
];

function getFailSteps(reason: FailReason): AuthStep[] {
  const meta = FAIL_REASONS.find((r) => r.value === reason) ?? FAIL_REASONS[0];
  return [
    {
      icon: Smartphone,
      title: "Device requests access",
      detail: "Device performs cell selection and sends an attach request with a masked permanent identifier.",
      log: "DEV  attach request · SUCI masked · cell NR-03",
      tone: "info",
    },
    {
      icon: KeyRound,
      title: "Presents protected credentials",
      detail: "Secure element attempts to sign the network challenge.",
      log: "SE   signature attempt · key in element",
      tone: "info",
    },
    {
      icon: ShieldAlert,
      title: `Authentication fails — ${meta.label}`,
      detail: meta.detail,
      log: meta.log,
      tone: "bad",
    },
    {
      icon: X,
      title: "Access denied",
      detail: "No session keys issued. Failure reason is logged for audit; device may retry or fall back.",
      log: "GATE deny · no keys · event logged · retry allowed",
      tone: "bad",
    },
  ];
}

function authLogTime(index: number): string {
  return `T+${(index * 0.9 + 0.9).toFixed(1)}s`;
}

const CONCEPTS: { icon: typeof Lock; title: string; text: string }[] = [
  { icon: CreditCard, title: "SIM", text: "Removable tamper-resistant card holding subscriber credentials. The classic, physically swappable form." },
  { icon: Download, title: "eSIM", text: "Soldered chip with a remotely downloadable profile. Switch subscriptions over the air — no card swap." },
  { icon: Cpu, title: "iSIM", text: "Integrated secure element inside the SoC/module. Factory-fused for sealed, long-life devices." },
  { icon: Lock, title: "Secure elements", text: "Isolated hardware that stores keys and signs challenges. Keys never leave the element's boundary." },
  { icon: Fingerprint, title: "Device identity", text: "SUCI/IMEI + hardware attestation prove which device and subscription are asking, without exposing the permanent ID." },
  { icon: KeyRound, title: "Authentication", text: "Mutual challenge–response: network issues fresh RAND, device proves knowledge of the shared secret." },
  { icon: BadgeCheck, title: "Credential protection", text: "Fresh challenges, masked identifiers, and replay counters stop eavesdroppers and cloned credentials." },
  { icon: Network, title: "Access control", text: "After proof, policy binds slice, QoS, and subscription state. No proof, no session — no keys." },
];

const COMPARISON_ROWS: { label: string; sim: string; esim: string; isim: string }[] = [
  { label: "Form factor", sim: "Removable nano-SIM card", esim: "Soldered chip + downloadable profile", isim: "Integrated in SoC / module" },
  { label: "Provisioning", sim: "Physical insertion of card", esim: "OTA profile (QR / app / M2M)", isim: "Factory-fused, bound at fab" },
  { label: "Security boundary", sim: "Tamper-resistant card", esim: "Secure element, encrypted profile", isim: "Integrated secure element, HW root of trust" },
  { label: "Typical use", sim: "Phones, routers, legacy IoT", esim: "Phones, wearables, tablets, fleets", isim: "Vehicles, industrial IoT, sealed modules" },
  { label: "Changeability", sim: "Swap card physically", esim: "Switch profile remotely", isim: "Replace module / reflash bound" },
  { label: "Best for", sim: "Maximum portability", esim: "Flexibility at scale", isim: "Long-life, sealed devices" },
];

export default function SecurityPage() {
  const [mode, setMode] = useState<AuthMode>("success");
  const [reason, setReason] = useState<FailReason>("invalid");
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<{ time: string; text: string; tone: string }[]>([]);
  const [selectedSim, setSelectedSim] = useState<SimKind>("esim");
  const timeoutRef = useRef<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  usePageMeta({
    title: "Security & Identity",
    description:
      "SIM, eSIM, iSIM, secure elements, device identity, and network access control — with a safe authentication simulator. Never collects real credentials.",
  });

  const steps = mode === "success" ? SUCCESS_STEPS : getFailSteps(reason);
  const progress = step < 0 ? 0 : Math.min(100, ((step + 1) / steps.length) * 100);
  const finished = step >= steps.length;
  const status = running ? "verifying" : finished ? (mode === "success" ? "authenticated" : "denied") : "idle";

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (!running) return;
    if (step >= steps.length || step < 0) {
      if (step >= steps.length) setRunning(false);
      return;
    }
    timeoutRef.current = window.setTimeout(() => setStep((i) => i + 1), 900);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, step, mode, reason]);

  useEffect(() => {
    if (step === -1) return;
    if (step >= steps.length) {
      const text = mode === "success" ? "SESSION LIVE · ciphering + integrity active" : "SESSION DENIED · no keys issued";
      setLogs((prev) => [...prev, { time: `T+${(steps.length * 0.9 + 0.4).toFixed(1)}s`, text, tone: mode === "success" ? "ok" : "bad" }]);
      return;
    }
    const s = steps[step];
    if (s) setLogs((prev) => [...prev, { time: authLogTime(step), text: s.log, tone: s.tone }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mode, reason]);

  function run() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setLogs([]);
    setStep(0);
    setRunning(true);
  }

  function reset() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setRunning(false);
    setStep(-1);
    setLogs([]);
  }

  function changeMode(next: AuthMode) {
    setMode(next);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setRunning(false);
    setStep(-1);
    setLogs([]);
  }

  function changeReason(next: FailReason) {
    setReason(next);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setRunning(false);
    setStep(-1);
    setLogs([]);
  }

  const reasonMeta = FAIL_REASONS.find((r) => r.value === reason) ?? FAIL_REASONS[0];

  return (
    <>
      <PageHeader
        index="07"
        eyebrow="Security"
        title={<>Trust begins with<br /><span className="text-gradient">verified identity.</span></>}
        description="Before any data moves, the network verifies who is asking. SIM, eSIM, and iSIM each guard protected credentials differently — and authentication proves knowledge without ever revealing the key."
        badges={["Educational simulation", "No real credentials"]}
        aside={
          <div className="glass-panel overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Trust snapshot</span>
              <StatusPill label={status === "authenticated" ? "Authenticated" : status === "denied" ? "Denied" : status === "verifying" ? "Verifying" : "Idle"} tone={status === "authenticated" ? "good" : status === "denied" ? "bad" : status === "verifying" ? "info" : "neutral"} pulse={status === "verifying"} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Stat label="Sim modes" value="2" hint="success / failure" />
              <Stat label="Steps" value={String(steps.length)} hint="current scenario" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Credentials" value="0" hint="never collected" tone="good" />
              <Stat label="Keys on wire" value="0" hint="keys stay in SE" tone="cyan" />
            </div>
            <div className="mt-5 border-t border-[var(--line)] pt-3.5">
              <p className="text-[9.5px] leading-4 text-[var(--subtle)]">
                All identifiers here are synthetic (e.g. SUCI •••1234). Nothing you type or see leaves this page.
              </p>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <SectionReveal>
          <SectionHeader
            eyebrow="Identity fabric"
            title="Four ideas, one guarantee."
            description="SIM/eSIM/iSIM are the credential carriers; secure elements are the vaults; authentication is the proof; access control is the gate. Remove any one and the chain fails."
          />
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CONCEPTS.map((c) => (
              <Panel key={c.title} className="p-4" hover>
                <c.icon className="h-4 w-4 text-[var(--cyan)]" strokeWidth={1.7} />
                <p className="mt-3 text-[12px] font-semibold text-[var(--text)]">{c.title}</p>
                <p className="mt-1.5 text-[10.5px] leading-5 text-[var(--muted)]">{c.text}</p>
              </Panel>
            ))}
          </div>
        </SectionReveal>

        {/* AUTH SIMULATOR */}
        <SectionReveal className="mt-14">
          <SectionHeader
            eyebrow="Authentication simulator"
            title="Run the handshake. No real identity involved."
            description="Pick a scenario, run it, and watch the event log. The device proves knowledge of a secret; the secret itself is never transmitted or stored on this page."
            action={
              <SegmentedControl
                label="Authentication outcome"
                value={mode}
                onChange={changeMode}
                options={[
                  { value: "success", label: "Successful" },
                  { value: "fail", label: "Failed" },
                ]}
                className="w-full max-w-[280px]"
              />
            }
          />
          <InfoNote label="Safety notice" icon={<Lock className="h-3.5 w-3.5" />} className="mt-5">
            This simulator never collects, stores, or transmits real credentials, SIM data, or personal information. All challenges, proofs, and identifiers are synthetic.
          </InfoNote>

          {mode === "fail" && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Failure reason</span>
              {FAIL_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => changeReason(r.value)}
                  aria-pressed={reason === r.value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    reason === r.value ? "border-[var(--bad)]/50 bg-[var(--bad)]/[.1] text-[var(--text)]" : "border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--text)]",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            {/* steps */}
            <Panel className="p-5 sm:p-6">
              <div
                className={cn(
                  "rounded-xl border px-4 py-3.5",
                  status === "authenticated" && "border-[var(--good)]/30 bg-[var(--good)]/[.07]",
                  status === "denied" && "border-[var(--bad)]/30 bg-[var(--bad)]/[.07]",
                  (status === "idle" || status === "verifying") && "border-[var(--line)] bg-white/[.02]",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--text)]">
                    {status === "authenticated" ? <ShieldCheck className="h-4 w-4 text-[var(--good)]" /> : status === "denied" ? <ShieldAlert className="h-4 w-4 text-[var(--bad)]" /> : <span className="h-2 w-2 rounded-full bg-[var(--cyan)]" />}
                    {status === "authenticated" ? "Authenticated — session established" : status === "denied" ? `Access denied — ${reasonMeta.label}` : status === "verifying" ? "Verifying credentials…" : "Ready — press Run authentication"}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-[var(--cyan)]">{Math.round(progress)}%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--blue))] transition-[width] duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant={mode === "success" ? "primary" : "danger"} size="sm" onClick={run} disabled={running} iconLeft={running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}>
                  {running ? "Running…" : finished ? "Run again" : "Run authentication"}
                </Button>
                <Button variant="secondary" size="sm" onClick={reset} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>
                  Reset
                </Button>
                <span className="ml-auto self-center font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">
                  {mode === "success" ? "5 steps · happy path" : `4 steps · ${reasonMeta.short}`}
                </span>
              </div>

              <ol className="mt-5 space-y-2.5">
                {steps.map((s, index) => {
                  const isActive = step === index;
                  const isDone = step > index;
                  const StepIcon = s.icon;
                  return (
                    <li
                      key={s.title}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-3.5 py-3",
                        s.tone === "bad" && (isActive || isDone) ? "border-[var(--bad)]/35 bg-[var(--bad)]/[.06]" : isActive ? "border-[var(--good)]/40 bg-[var(--good)]/[.06]" : isDone ? "border-[var(--line)] bg-white/[.02]" : "border-[var(--line)] bg-white/[.012] opacity-60",
                      )}
                    >
                      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg border", isActive || isDone ? (s.tone === "bad" ? "border-[var(--bad)]/40 text-[var(--bad)]" : "border-[var(--good)]/40 text-[var(--good)]") : "border-[var(--line)] text-[var(--subtle)]")}>
                        {isDone ? (s.tone === "bad" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />) : <StepIcon className="h-4 w-4" strokeWidth={1.7} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[8px] text-[var(--subtle)]">0{index + 1}</span>
                          <span className="text-[12px] font-semibold text-[var(--text)]">{s.title}</span>
                          <span className={cn("font-mono text-[8px] uppercase tracking-[.1em]", isActive ? (s.tone === "bad" ? "text-[var(--bad)]" : "text-[var(--good)]") : isDone ? "text-[var(--muted)]" : "text-[var(--subtle)]")}>
                            {isActive ? "active" : isDone ? (s.tone === "bad" ? "failed" : "done") : "pending"}
                          </span>
                        </span>
                        <span className="mt-1 block text-[10.5px] leading-4 text-[var(--muted)]">{s.detail}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 font-mono text-[8px] uppercase tracking-[.12em] text-[var(--subtle)]">AKA intuition · keys derived · no secret on the wire</p>
            </Panel>

            {/* log */}
            <Panel className="flex flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <Eyebrow>Security event log</Eyebrow>
                <StatusPill label={logs.length === 0 ? "Idle" : finished ? (mode === "success" ? "Session live" : "Denied") : "Logging"} tone={logs.length === 0 ? "neutral" : finished ? (mode === "success" ? "good" : "bad") : "info"} />
              </div>
              <div ref={logRef} className="mt-4 h-[320px] flex-1 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/80 p-3 font-mono text-[10px] leading-6">
                {logs.length === 0 ? (
                  <p className="text-[var(--subtle)]">No events. Choose a mode and press Run authentication.</p>
                ) : (
                  logs.map((entry, index) => (
                    <p key={`${entry.time}-${index}`} className={cn("whitespace-nowrap", entry.tone === "ok" ? "text-[var(--good)]" : entry.tone === "bad" ? "text-[var(--bad)]" : "text-[var(--muted)]")}>
                      <span className="text-[var(--subtle)]">{entry.time}</span>  {entry.text}
                    </p>
                  ))
                )}
              </div>
              <div className="mt-4 rounded-xl border border-[var(--line)] bg-white/[.02] p-3.5">
                <p className="font-mono text-[8px] uppercase tracking-[.14em] text-[var(--cyan)]">Why failure is the point</p>
                <p className="mt-2 text-[10.5px] leading-5 text-[var(--muted)]">
                  {mode === "success"
                    ? "Mutual proof + freshness + policy = session. The device can be sure it talks to the real network; the network can be sure the device holds a valid subscription."
                    : `This scenario: ${reasonMeta.detail} The gate denies without keys, and the denial itself is auditable.`}
                </p>
              </div>
              <InfoNote label="Educational">Real AKA runs between device, gNB, and UDM. This simulation abstracts the messages and uses no cryptographic material.</InfoNote>
            </Panel>
          </div>
        </SectionReveal>

        {/* COMPARISON */}
        <SectionReveal className="mt-14">
          <SectionHeader
            eyebrow="SIM vs eSIM vs iSIM"
            title="Same job. Different physical trust."
            description="All three guard the same subscriber secret. What changes is where it lives, how it arrives, and whether it can ever leave."
            action={
              <SegmentedControl
                label="Select credential type"
                value={selectedSim}
                onChange={setSelectedSim}
                options={[
                  { value: "sim", label: "SIM" },
                  { value: "esim", label: "eSIM" },
                  { value: "isim", label: "iSIM" },
                ]}
                className="w-full max-w-[300px]"
              />
            }
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-[.92fr_1.08fr]">
            {/* diagram */}
            <Panel className="overflow-hidden p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="data-label">Form factor diagram</span>
                <StatusPill label={selectedSim === "sim" ? "Removable" : selectedSim === "esim" ? "Soldered + OTA" : "Integrated"} tone="info" />
              </div>
              <div className="relative mt-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/70 p-4">
                <svg viewBox="0 0 420 260" className="w-full" role="img" aria-label={`Diagram of ${selectedSim}`}>
                  {selectedSim === "sim" && (
                    <g>
                      <rect x="70" y="30" width="280" height="200" rx="14" fill="rgba(255,255,255,.03)" stroke="var(--line-strong)" />
                      <rect x="150" y="70" width="120" height="120" rx="12" fill="rgba(67,217,255,.08)" stroke="var(--cyan)" strokeWidth="1.8" />
                      <path d="M150 92 L168 70 H210 V120 H150 Z" fill="rgba(67,217,255,.1)" stroke="var(--cyan)" strokeOpacity=".6" />
                      <rect x="182" y="130" width="52" height="10" rx="2" fill="var(--cyan)" opacity=".45" />
                      <rect x="182" y="146" width="36" height="6" rx="2" fill="#7291aa" opacity=".5" />
                      <text x="210" y="215" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted)">SIM CARD · INSERTABLE</text>
                      <text x="210" y="62" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--cyan)">PHONE TRAY</text>
                    </g>
                  )}
                  {selectedSim === "esim" && (
                    <g>
                      <rect x="70" y="30" width="280" height="200" rx="14" fill="rgba(255,255,255,.03)" stroke="var(--line-strong)" />
                      <rect x="150" y="60" width="120" height="140" rx="10" fill="rgba(155,140,255,.08)" stroke="var(--violet)" strokeWidth="1.8" />
                      <rect x="182" y="96" width="56" height="48" rx="6" fill="rgba(155,140,255,.14)" stroke="var(--violet)" strokeOpacity=".7" />
                      <text x="210" y="122" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--violet)">eSIM CHIP</text>
                      <text x="210" y="134" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--muted)">PROFILE</text>
                      <path d="M120 52 C 160 30 220 28 260 48" stroke="var(--cyan)" strokeDasharray="4 5" fill="none" />
                      <path d="M256 42 L262 56 L250 56 Z" fill="var(--cyan)" />
                      <text x="190" y="42" fontSize="8" fontFamily="monospace" fill="var(--cyan)">OTA DOWNLOAD</text>
                      <text x="210" y="224" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted)">SOLDERED · REMOTE PROFILE</text>
                    </g>
                  )}
                  {selectedSim === "isim" && (
                    <g>
                      <rect x="70" y="30" width="280" height="200" rx="14" fill="rgba(255,255,255,.03)" stroke="var(--line-strong)" />
                      <rect x="140" y="50" width="140" height="160" rx="10" fill="rgba(62,230,164,.07)" stroke="var(--good)" strokeWidth="1.8" />
                      <rect x="172" y="86" width="76" height="76" rx="8" fill="rgba(62,230,164,.13)" stroke="var(--good)" strokeOpacity=".8" />
                      <rect x="186" y="104" width="48" height="8" rx="2" fill="var(--good)" opacity=".5" />
                      <rect x="186" y="118" width="32" height="6" rx="2" fill="var(--good)" opacity=".35" />
                      <text x="210" y="140" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--good)">iSIM / SE</text>
                      <text x="210" y="196" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--muted)">SoC · FACTORY FUSED</text>
                      <text x="210" y="222" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted)">INTEGRATED · SEALED</text>
                    </g>
                  )}
                </svg>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-[var(--muted)]">
                {selectedSim === "sim" && "The card can be pulled and reinserted — maximum portability, but physical theft / loss is possible. The secret stays on the card."}
                {selectedSim === "esim" && "The chip is soldered; the subscription arrives as an encrypted profile. Switching carriers needs no hardware change."}
                {selectedSim === "isim" && "Credential storage is fused into the silicon at fabrication. Ideal for vehicles and sealed IoT where the module is never opened."}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4">
                <div><p className="font-mono text-[8px] uppercase text-[var(--subtle)]">Provisioning</p><p className="mt-1 text-[11px] font-semibold text-[var(--text)]">{selectedSim === "sim" ? "Insert card" : selectedSim === "esim" ? "OTA profile" : "Factory fuse"}</p></div>
                <div><p className="font-mono text-[8px] uppercase text-[var(--subtle)]">Key exposure</p><p className="mt-1 text-[11px] font-semibold text-[var(--good)]">Never on wire</p></div>
              </div>
            </Panel>

            {/* table */}
            <div className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-white/[.015]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--bg-deep)]/60">
                      <th className="px-4 py-3.5 font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">Attribute</th>
                      {(["sim", "esim", "isim"] as SimKind[]).map((kind) => (
                        <th key={kind} className={cn("px-4 py-3.5 font-mono text-[8px] uppercase tracking-[.14em]", selectedSim === kind ? "text-[var(--cyan)]" : "text-[var(--subtle)]")}>
                          {kind === "sim" ? "SIM" : kind === "esim" ? "eSIM" : "iSIM"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map((row) => (
                      <tr key={row.label} className="border-b border-[var(--line)] last:border-0">
                        <td className="px-4 py-3.5 font-semibold text-[var(--text)]">{row.label}</td>
                        {(["sim", "esim", "isim"] as SimKind[]).map((kind) => (
                          <td key={kind} className={cn("px-4 py-3.5 leading-5", selectedSim === kind ? "bg-[var(--cyan)]/[.05] text-[var(--text)]" : "text-[var(--muted)]")}>
                            {row[kind]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[var(--line)] px-4 py-3.5">
                <InfoNote label="Takeaway">
                  Form factor changes logistics, not the security model: in all three, proof is computed inside a tamper-resistant boundary.
                </InfoNote>
              </div>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal className="mt-14 pb-4">
          <div className="rounded-[18px] border border-[var(--warn)]/25 bg-[var(--warn)]/[.05] p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[var(--warn)]" />
              <span className="font-mono text-[9px] uppercase tracking-[.14em] text-[var(--warn)]">Educational use only</span>
            </div>
            <p className="mt-3 max-w-3xl text-[12px] leading-6 text-[var(--muted)]">
              This page teaches *how* authentication works. It does not perform authentication: no real SIM, eSIM profile, IMSI, IMEI, or secret is requested, generated, or checked. Use real credentials only through your operator's official channels.
            </p>
          </div>
        </SectionReveal>
      </div>
    </>
  );
}
