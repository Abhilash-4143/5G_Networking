import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Home, PhoneCall, RadioTower, Send, ShieldCheck, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";

type Stage = "ready" | "started" | "public-down" | "independent" | "sending" | "delivered" | "restored";

type LogEntry = { id: string; time: string; text: string };

const stageCopy: Record<Stage, { title: string; detail: string; tone: "neutral" | "warn" | "bad" | "info" | "good" }> = {
  ready: { title: "Ready", detail: "Start the scenario to simulate a public-network outage in a remote village.", tone: "neutral" },
  started: { title: "Scenario active", detail: "Public network is carrying traffic. Next, simulate its failure.", tone: "info" },
  "public-down": { title: "Public network failed", detail: "Public links are down. Local users cannot reach the outside network.", tone: "bad" },
  independent: { title: "Independent network active", detail: "The village local server and tower now form a local fallback network.", tone: "warn" },
  sending: { title: "Sending emergency message", detail: "The medical assistance point is transmitting toward the emergency response centre.", tone: "info" },
  delivered: { title: "Message delivered", detail: "Emergency message received by the response centre (simulated). Restore the public network to return to normal.", tone: "good" },
  restored: { title: "Public network restored", detail: "Public connectivity is back. The fallback network can stand down.", tone: "good" },
};

function Topology({ stage, sending }: { stage: Stage; sending: boolean }) {
  const publicDown = stage === "public-down" || stage === "independent" || stage === "sending" || stage === "delivered";
  const independent = stage === "independent" || stage === "sending" || stage === "delivered";
  const publicColor = publicDown ? "var(--bad)" : "var(--good)";
  const localColor = independent ? "var(--cyan)" : "var(--line-strong)";
  return (
    <svg viewBox="0 0 620 360" className="h-auto w-full" role="img" aria-label="Remote village emergency topology">
      {/* Public link */}
      <path d="M 310 150 C 310 90, 450 70, 520 90" fill="none" stroke={publicColor} strokeWidth="2" strokeDasharray={publicDown ? "4 6" : "none"} opacity={publicDown ? 0.5 : 0.9} />
      <circle cx="520" cy="90" r="5" fill={publicColor} />
      <text x="520" y="74" textAnchor="middle" fontSize="9" fill={publicColor} fontFamily="monospace">PUBLIC NETWORK {publicDown ? "DOWN" : "UP"}</text>

      {/* Local independent links */}
      <path d="M 180 250 C 180 190, 220 190, 250 160" fill="none" stroke={localColor} strokeWidth="2" opacity={independent ? 0.95 : 0.35} />
      <path d="M 260 300 C 300 260, 380 240, 420 150" fill="none" stroke={localColor} strokeWidth="2" opacity={independent ? 0.95 : 0.35} />
      <path d="M 310 150 C 340 170, 380 160, 420 150" fill="none" stroke={localColor} strokeWidth="2" opacity={independent ? 0.95 : 0.35} />

      {/* Message path from medical point to response centre */}
      <path id="emergency-message-path" d="M 110 300 C 180 300, 240 290, 260 300 C 340 315, 390 260, 420 150" fill="none" stroke="transparent" />
      {sending && (
        <circle r="6" fill="var(--warn)" stroke="var(--bg-deep)" strokeWidth="2">
          <animateMotion dur="3s" repeatCount="1">
            <mpath href="#emergency-message-path" />
          </animateMotion>
        </circle>
      )}
      {stage === "delivered" && <circle cx="420" cy="150" r="10" fill="none" stroke="var(--good)" strokeWidth="2" />}

      {/* Village */}
      <g transform="translate(60 220)">
        <rect x="0" y="30" width="70" height="40" rx="4" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <path d="M 0 30 L 35 8 L 70 30" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
        <text x="35" y="95" textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="monospace">REMOTE VILLAGE</text>
      </g>
      {/* Connected users */}
      {[70, 95, 120].map((x) => (
        <g key={x} transform={`translate(${x} 300)`}>
          <circle r="5" fill={independent ? "var(--cyan)" : "var(--muted)"} />
          <path d="M -6 14 Q 0 8 6 14" fill="none" stroke={independent ? "var(--cyan)" : "var(--muted)"} strokeWidth="1.5" />
        </g>
      ))}
      <text x="95" y="334" textAnchor="middle" fontSize="8" fill="var(--subtle)" fontFamily="monospace">CONNECTED USERS</text>

      {/* Tower */}
      <g transform="translate(310 150)">
        <path d="M 0 60 L -7 0 L 7 0 Z" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <path d="M -16 -6 L 0 -14 L 16 -6 M -16 6 L 0 -2 L 16 6" fill="none" stroke={independent ? "var(--cyan)" : "var(--muted)"} strokeWidth="1.5" />
        <circle cx="0" cy="-16" r="4" fill={independent ? "var(--cyan)" : "var(--muted)"} />
        <text x="0" y="82" textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="monospace">COMM. TOWER</text>
      </g>

      {/* Medical point */}
      <g transform="translate(60 280)">
        <rect width="42" height="42" rx="6" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <path d="M 21 10 V 32 M 10 21 H 32" stroke="var(--bad)" strokeWidth="3" />
        <text x="21" y="58" textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="monospace">MEDICAL POINT</text>
      </g>

      {/* Local server */}
      <g transform="translate(240 290)">
        <rect width="56" height="34" rx="5" fill="var(--surface-solid)" stroke={localColor} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2.5" fill={independent ? "var(--good)" : "var(--muted)"} />
        <circle cx="12" cy="22" r="2.5" fill={independent ? "var(--good)" : "var(--muted)"} />
        <text x="28" y="20" fontSize="8" fill="var(--muted)" fontFamily="monospace">LOCAL SERVER</text>
      </g>

      {/* Response centre */}
      <g transform="translate(392 120)">
        <rect width="64" height="48" rx="5" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <text x="32" y="20" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="monospace">EMERGENCY</text>
        <text x="32" y="32" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="monospace">RESPONSE CENTRE</text>
        <circle cx="32" cy="41" r="3" fill={stage === "delivered" ? "var(--good)" : "var(--muted)"} />
      </g>
    </svg>
  );
}

export default function EmergencyPage() {
  usePageMeta({
    title: "Emergency Network Scenario",
    description:
      "Simulated remote-village emergency: public network failure, independent local fallback network, and delivery of an emergency message over a local link.",
  });

  const [stage, setStage] = useState<Stage>("ready");
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function push(text: string) {
    const entry: LogEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: new Date().toLocaleTimeString(), text };
    setLog((prev) => [entry, ...prev].slice(0, 20));
  }

  useEffect(() => {
    if (stage !== "sending") return;
    if (reducedMotion) {
      setProgress(100);
      setStage("delivered");
      push("Emergency message delivered (reduced-motion: instant)");
      return;
    }
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 10);
        if (next >= 100) {
          window.clearInterval(id);
          setStage("delivered");
          push("Emergency message delivered to response centre (simulated)");
        }
        return next;
      });
    }, 300);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, reducedMotion]);

  function start() {
    setStage("started");
    push("Emergency scenario started in remote village");
  }
  function fail() {
    setStage("public-down");
    push("Public network failure simulated");
  }
  function activate() {
    setStage("independent");
    push("Independent local network activated via tower and local server");
  }
  function send() {
    setStage("sending");
    setProgress(0);
    push("Emergency message sent from medical assistance point");
  }
  function restore() {
    setStage("restored");
    push("Public network restored; fallback can stand down");
  }
  function reset() {
    setStage("ready");
    setProgress(0);
    push("Scenario reset");
  }

  const copy = stageCopy[stage];
  const publicPill = stage === "public-down" || stage === "independent" || stage === "sending" || stage === "delivered" ? "Public: down" : stage === "restored" ? "Public: restored" : "Public: up";

  return (
    <>
      <PageHeader
        index="09"
        eyebrow="Emergency Network"
        title={<>When the public network fails, <span className="text-gradient">a campus can still talk.</span></>}
        description="A remote village scenario in which a public-network outage is simulated, an independent local network is activated, and an emergency message travels from a medical point to a response centre over the local link."
        badges={["Scenario", "Local fallback", "Simulated"]}
        aside={
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Scenario status</span>
              <StatusPill label={copy.title} tone={copy.tone} pulse={stage === "sending" || stage === "public-down"} />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px]"><span className="text-[var(--muted)]">Public network</span><StatusPill label={publicPill} tone={publicPill === "Public: up" || publicPill === "Public: restored" ? "good" : "bad"} /></div>
              <div className="flex items-center justify-between text-[11px]"><span className="text-[var(--muted)]">Independent network</span><StatusPill label={stage === "independent" || stage === "sending" || stage === "delivered" ? "Active" : "Standby"} tone={stage === "independent" || stage === "sending" || stage === "delivered" ? "info" : "neutral"} /></div>
              <div className="flex items-center justify-between text-[11px]"><span className="text-[var(--muted)]">Message</span><StatusPill label={stage === "delivered" ? "Delivered" : stage === "sending" ? `Sending ${progress}%` : "Not sent"} tone={stage === "delivered" ? "good" : stage === "sending" ? "warn" : "neutral"} /></div>
            </div>
            <div className="mt-4 border-t border-[var(--line)] pt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[.05]">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--cyan),var(--good))]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-[10px] leading-4 text-[var(--subtle)]">{copy.detail}</p>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <InfoNote label="Important limitation" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          This website does not provide real emergency communication. It does not connect to emergency services, and messages shown here are simulated locally in your browser. In a real emergency, contact authorised emergency services through appropriate channels.
        </InfoNote>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <SectionReveal>
            <Panel className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Eyebrow icon={<RadioTower className="h-3.5 w-3.5" />}>Village topology</Eyebrow>
                  <p className="mt-2 text-[12px] text-[var(--muted)]">Remote village, tower, medical point, local server, response centre, and connected users.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--subtle)]">
                  {stage === "public-down" || stage === "independent" || stage === "sending" || stage === "delivered" ? <WifiOff className="h-3.5 w-3.5 text-[var(--bad)]" /> : <Activity className="h-3.5 w-3.5 text-[var(--good)]" />}
                  {publicPill}
                </span>
              </div>
              <div className="relative mt-5 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/60 p-3 sm:p-5">
                <Topology stage={stage} sending={stage === "sending"} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><Home className="h-3 w-3" /> Village</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><RadioTower className="h-3 w-3" /> Tower</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><PhoneCall className="h-3 w-3" /> Medical point</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><Send className="h-3 w-3" /> Response centre</span>
              </div>
            </Panel>
          </SectionReveal>

          <SectionReveal delay={0.06}>
            <div className="space-y-5">
              <Panel className="p-5 sm:p-6">
                <Eyebrow>Step-by-step scenario</Eyebrow>
                <div className="mt-4 flex flex-col gap-2">
                  <Button size="sm" variant="primary" onClick={start} disabled={stage !== "ready" && stage !== "restored"}>1 · Start emergency scenario</Button>
                  <Button size="sm" variant="danger" onClick={fail} disabled={stage !== "started"}>2 · Simulate public network failure</Button>
                  <Button size="sm" variant="secondary" onClick={activate} disabled={stage !== "public-down"}>3 · Activate independent network</Button>
                  <Button size="sm" variant="secondary" onClick={send} disabled={stage !== "independent"} iconLeft={<Send className="h-3.5 w-3.5" />}>4 · Send emergency message (medical point)</Button>
                  <Button size="sm" variant="secondary" onClick={restore} disabled={stage !== "delivered"}>5 · Restore network (public)</Button>
                  <Button size="sm" variant="quiet" onClick={reset}>Reset scenario</Button>
                </div>
                <p className="mt-4 text-[10px] leading-4 text-[var(--subtle)]">Steps unlock in sequence. Progress animates along the SVG message path; reduced-motion users receive instant delivery.</p>
              </Panel>
              <Panel className="p-5 sm:p-6">
                <Eyebrow>Event log</Eyebrow>
                <ul className="mt-3 space-y-2">
                  {log.length === 0 && <li className="text-[10.5px] text-[var(--subtle)]">No events yet.</li>}
                  {log.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-2 text-[10.5px] leading-4 text-[var(--muted)]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--cyan)]" />
                      <span><span className="font-mono text-[8px] text-[var(--subtle)]">{entry.time}</span><br />{entry.text}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </SectionReveal>
        </div>

        <section className="mt-12">
          <SectionHeader eyebrow="Why a local fallback helps — and where it stops" title="Resilience with honest limits." description="A self-contained local network can keep a remote settlement communicating when public connectivity fails, but it has hard physical, power, and legal boundaries." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Coverage", text: "Tower height, terrain, transmit power, and antenna pattern limit range. A single tower cannot cover an entire district; relay sites or repeaters would be required, forming a mesh." },
              { title: "Power", text: "Grid outages often accompany emergencies. Battery, solar, or generator backup determines how long the tower and local server can operate without mains power." },
              { title: "Regulatory authorisation", text: "Spectrum use, licensed bands, and emergency-service interconnection require authorisation from the relevant regulator and public authorities. This scenario is conceptual and does not claim any such authorisation." },
            ].map((item) => (
              <Panel key={item.title} className="p-5" hover>
                <AlertTriangle className="h-4 w-4 text-[var(--warn)]" />
                <p className="mt-3 text-[12px] font-semibold text-[var(--text)]">{item.title}</p>
                <p className="mt-1.5 text-[10.5px] leading-5 text-[var(--muted)]">{item.text}</p>
              </Panel>
            ))}
          </div>
          <InfoNote label="Not an emergency service" className="mt-6">
            Educational simulation only. Do not use this website as a substitute for real emergency communication, dispatch, or medical advice.
          </InfoNote>
        </section>
      </div>
    </>
  );
}
