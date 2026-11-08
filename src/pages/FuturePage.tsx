import { useState, type ReactNode } from "react";
import { Braces, Compass, Cpu, Fish, Globe2, Waves, Wind, Zap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, StatusPill } from "@/components/ui/Panel";
import { InfoNote } from "@/components/ui/Section";
import { Tabs } from "@/components/ui/Controls";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";

type TabId = "ai" | "edge" | "marine" | "underwater" | "mimo" | "sixg" | "expansion";

type Topic = {
  id: TabId;
  title: string;
  status: "Deployed" | "Emerging" | "Research";
  statusTone: "good" | "info" | "warn";
  explanation: string;
  applications: string[];
  advantages: string[];
  challenges: string[];
  future: string;
};

const topics: Topic[] = [
  {
    id: "ai",
    title: "AI-assisted network management",
    status: "Emerging",
    statusTone: "info",
    explanation:
      "Operations data — throughput, latency, radio quality, energy — can be analysed to detect anomalies, predict congestion, and suggest tuning actions. Production systems separate models, thresholds, and human approval so recommendations remain auditable.",
    applications: ["Anomaly detection on KPI streams", "Predictive maintenance of radio sites", "Energy-aware power management"],
    advantages: ["Earlier fault detection than fixed thresholds", "Can correlate metrics across many sites", "Reduces manual monitoring load"],
    challenges: ["Data quality and labelling", "Explainability and trust", "Risk of automation errors at scale"],
    future: "AI-native control loops with human-in-the-loop approval for consequential changes.",
  },
  {
    id: "edge",
    title: "Edge computing",
    status: "Deployed",
    statusTone: "good",
    explanation:
      "Edge servers placed near factories, campuses, or cellular sites process data close to where it is generated. This shortens latency, reduces backhaul load, and keeps critical functions running if the central cloud is unreachable.",
    applications: ["Industrial control and robotics", "Video analytics", "Private 5G application hosting"],
    advantages: ["Low latency for real-time tasks", "Resilient to wide-area outages", "Lower backhaul bandwidth costs"],
    challenges: ["Distributed deployment and updates", "Power, cooling, and physical security", "Consistency across edge and cloud"],
    future: "Standardised edge platforms orchestrated with the network for location-aware services.",
  },
  {
    id: "marine",
    title: "Marine connectivity",
    status: "Deployed",
    statusTone: "good",
    explanation:
      "Vessels combine satellite links, coastal cellular, and port Wi-Fi to stay connected at sea. Safety, weather, navigation, and crew connectivity each have different latency and coverage needs, often served by different links.",
    applications: ["Fleet and cargo tracking", "Remote diagnostics and telemedicine", "Crew and passenger connectivity"],
    advantages: ["Safety and regulatory compliance", "Operational visibility across oceans", "Bandwidth on demand via satellite"],
    challenges: ["High latency and cost of satellite capacity", "Intermittent coverage at sea", "Harsh, mobile environment"],
    future: "Multi-orbit satellite constellations and integrated terrestrial-satellite handover.",
  },
  {
    id: "underwater",
    title: "Underwater acoustic communication",
    status: "Research",
    statusTone: "warn",
    explanation:
      "Radio waves barely propagate underwater, so acoustic waves carry data between submersibles, sensors, and surface buoys. Bandwidth is low and latency high, but acoustics remain the only practical long-range underwater medium.",
    applications: ["Ocean monitoring and research", "Pipeline and cable inspection", "Autonomous underwater vehicle coordination"],
    advantages: ["Longer range than optical or radio underwater", "Works with autonomous vehicles", "Enables remote ocean sensing"],
    challenges: ["Very low data rates (kbps range)", "High propagation delay", "Multipath, noise, and Doppler shift"],
    future: "Hybrid acoustic-optical links and adaptive modulation for higher-rate telemetry.",
  },
  {
    id: "mimo",
    title: "Advanced MIMO",
    status: "Emerging",
    statusTone: "info",
    explanation:
      "Multiple-input multiple-output uses many antenna elements to form focused beams and spatial streams. Massive MIMO at a base station can serve many devices simultaneously while shaping energy toward users and away from interferers.",
    applications: ["Dense urban capacity", "Fixed wireless access", "Industrial private networks"],
    advantages: ["Spectral efficiency gains", "Better cell-edge performance", "Interference control via beamforming"],
    challenges: ["RF chain cost and calibration", "Computational load", "TDD channel reciprocity limits"],
    future: "Extremely large arrays, reconfigurable intelligent surfaces, and integrated sensing.",
  },
  {
    id: "sixg",
    title: "6G research",
    status: "Research",
    statusTone: "warn",
    explanation:
      "6G research explores sub-terahertz spectrum, AI-native air interfaces, integrated sensing and communication, and non-terrestrial layers. No standard exists yet; releases are expected in the late 2020s with early deployments around 2030.",
    applications: ["Holographic and extended-reality services", "Joint sensing and communication", "Ubiquitous coverage including satellite"],
    advantages: ["Potential for 100 Gbps-class peak rates (research targets)", "Native AI design", "Sensing integrated into the network"],
    challenges: ["Spectrum and propagation physics", "Energy and hardware cost", "Standardisation and ecosystem readiness"],
    future: "Standards, prototypes, and trials before any commercial deployment; dates remain indicative.",
  },
  {
    id: "expansion",
    title: "Network expansion",
    status: "Emerging",
    statusTone: "info",
    explanation:
      "Coverage expansion combines small cells, backhaul improvements, neutral-host sharing, and non-terrestrial links. Each strategy trades capital cost, spectrum, and backhaul against density and availability.",
    applications: ["Rural coverage extension", "Venue capacity upgrades", "Resilient backhaul for remote sites"],
    advantages: ["Targeted investment where demand exists", "Sharing can lower total cost", "Satellite backhaul reaches remote areas"],
    challenges: ["Business case in low-density areas", "Backhaul availability", "Power and maintenance logistics"],
    future: "Mixed terrestrial-satellite fabrics with shared infrastructure models.",
  },
];

function StatusBadge({ status, tone }: { status: Topic["status"]; tone: Topic["statusTone"] }) {
  return <StatusPill label={status} tone={tone} />;
}

function AiDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="AI-assisted management data loop">
      <rect x="10" y="50" width="52" height="38" rx="8" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <text x="36" y="66" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="monospace">KPIS</text>
      <text x="36" y="78" textAnchor="middle" fontSize="7" fill="var(--subtle)">TELEMETRY</text>
      <path d="M 62 69 H 92" stroke="var(--cyan)" strokeWidth="2" />
      <circle cx="112" cy="69" r="22" fill="var(--cyan)" fillOpacity=".08" stroke="var(--cyan)" strokeWidth="2" />
      <text x="112" y="67" textAnchor="middle" fontSize="9" fill="var(--cyan)" fontFamily="monospace">AI</text>
      <text x="112" y="79" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="monospace">MODEL</text>
      <path d="M 134 69 H 158" stroke="var(--cyan)" strokeWidth="2" />
      <rect x="158" y="50" width="52" height="38" rx="8" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <text x="184" y="66" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="monospace">ACTION</text>
      <text x="184" y="78" textAnchor="middle" fontSize="7" fill="var(--subtle)">TUNE</text>
      <path d="M 110 91 C 110 125, 36 115, 36 88" fill="none" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="3 4" />
      <text x="110" y="140" textAnchor="middle" fontSize="7" fill="var(--subtle)" fontFamily="monospace">FEEDBACK LOOP</text>
    </svg>
  );
}

function EdgeDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="Edge computing near devices">
      <rect x="12" y="55" width="34" height="28" rx="6" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <rect x="34" y="55" width="34" height="28" rx="6" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <text x="40" y="102" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="monospace">DEVICES</text>
      <path d="M 68 69 H 100" stroke="var(--cyan)" strokeWidth="2" />
      <rect x="100" y="48" width="56" height="42" rx="8" fill="var(--cyan)" fillOpacity=".08" stroke="var(--cyan)" strokeWidth="2" />
      <text x="128" y="66" textAnchor="middle" fontSize="8" fill="var(--cyan)" fontFamily="monospace">EDGE SERVER</text>
      <text x="128" y="79" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="monospace">LOCAL</text>
      <path d="M 156 69 H 186" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="3 4" />
      <ellipse cx="200" cy="69" rx="16" ry="12" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <text x="200" y="72" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="monospace">CLOUD</text>
      <text x="110" y="125" textAnchor="middle" fontSize="7" fill="var(--subtle)" fontFamily="monospace">LOW LATENCY · LOCAL PROCESSING</text>
    </svg>
  );
}

function MarineDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="Marine connectivity with satellite">
      <path d="M0 120 Q 55 108 110 120 T 220 120" fill="none" stroke="var(--blue)" strokeWidth="2" />
      <path d="M0 132 Q 55 122 110 132 T 220 132" fill="none" stroke="var(--blue)" strokeWidth="1.5" opacity=".5" />
      <g transform="translate(95 78)">
        <path d="M0 0 L0 -18 L22 12 L-22 12 Z" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <rect x="-26" y="12" width="52" height="10" rx="3" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <path d="M0 0 L0 -26" stroke="var(--cyan)" strokeWidth="2" />
      </g>
      <path d="M95 52 C 110 30, 130 28, 150 18" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="3 4" />
      <g transform="translate(160 12)">
        <rect width="30" height="16" rx="4" fill="var(--surface-solid)" stroke="var(--cyan)" />
        <path d="M4 4 L-4 -2 M4 12 L-4 18" stroke="var(--cyan)" strokeWidth="1.5" />
        <text x="15" y="28" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="monospace">SAT</text>
      </g>
      <text x="110" y="146" textAnchor="middle" fontSize="7" fill="var(--subtle)" fontFamily="monospace">SHIP ⇔ SATELLITE ⇔ COAST</text>
    </svg>
  );
}

function UnderwaterDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="Underwater acoustic link">
      <path d="M0 34 H220" stroke="var(--line)" strokeWidth="2" />
      <text x="110" y="24" textAnchor="middle" fontSize="8" fill="var(--subtle)" fontFamily="monospace">SURFACE BUOY</text>
      <rect x="98" y="36" width="24" height="18" rx="4" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <path d="M 95 70 C 80 95, 70 100, 55 108" fill="none" stroke="var(--cyan)" strokeWidth="2" />
      <path d="M 125 70 C 140 95, 150 100, 165 108" fill="none" stroke="var(--cyan)" strokeWidth="2" />
      <path d="M 88 74 C 74 98, 66 104, 52 112" fill="none" stroke="var(--cyan)" strokeWidth="1.5" opacity=".5" />
      <path d="M 132 74 C 146 98, 154 104, 168 112" fill="none" stroke="var(--cyan)" strokeWidth="1.5" opacity=".5" />
      <g transform="translate(35 104)">
        <ellipse rx="14" ry="7" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <path d="M14 0 L22 -6 M14 0 L22 6" stroke="var(--line-strong)" strokeWidth="2" />
      </g>
      <g transform="translate(185 104)">
        <ellipse rx="14" ry="7" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        <path d="M-14 0 L-22 -6 M-14 0 L-22 6" stroke="var(--line-strong)" strokeWidth="2" />
      </g>
      <text x="110" y="143" textAnchor="middle" fontSize="7" fill="var(--subtle)" fontFamily="monospace">ACOUSTIC WAVES · LOW BANDWIDTH</text>
    </svg>
  );
}

function MimoDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="Massive MIMO beamforming">
      <g transform="translate(18 20)">
        <rect width="26" height="100" rx="4" fill="var(--surface-solid)" stroke="var(--line-strong)" />
        {[12, 32, 52, 72, 92].map((y) => (
          <circle key={y} cx="13" cy={y} r="3.5" fill="var(--cyan)" />
        ))}
        <text x="13" y="135" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="monospace">ARRAY</text>
      </g>
      <path d="M 44 40 C 90 30, 130 34, 168 44" fill="none" stroke="var(--cyan)" strokeWidth="1.5" />
      <path d="M 44 70 C 95 66, 135 66, 172 66" fill="none" stroke="var(--cyan)" strokeWidth="1.5" />
      <path d="M 44 100 C 90 110, 130 106, 168 96" fill="none" stroke="var(--cyan)" strokeWidth="1.5" />
      <rect x="176" y="34" width="26" height="20" rx="4" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <rect x="180" y="60" width="26" height="20" rx="4" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <rect x="176" y="86" width="26" height="20" rx="4" fill="var(--surface-solid)" stroke="var(--line-strong)" />
      <text x="189" y="128" textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="monospace">USERS</text>
      <text x="110" y="146" textAnchor="middle" fontSize="7" fill="var(--subtle)" fontFamily="monospace">SPATIAL MULTIPLEXING</text>
    </svg>
  );
}

function SixGDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="6G research directions">
      <polygon points="110,18 150,42 150,90 110,114 70,90 70,42" fill="none" stroke="var(--violet)" strokeWidth="2" />
      <polygon points="110,32 138,50 138,82 110,100 82,82 82,50" fill="var(--violet)" fillOpacity=".08" stroke="var(--violet)" strokeWidth="1.5" />
      <circle cx="110" cy="66" r="10" fill="var(--surface-solid)" stroke="var(--violet)" />
      <text x="110" y="70" textAnchor="middle" fontSize="9" fill="var(--violet)" fontFamily="monospace">6G</text>
      <text x="110" y="132" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="monospace">THz · SENSING · AI-NATIVE</text>
      <text x="110" y="143" textAnchor="middle" fontSize="7" fill="var(--subtle)" fontFamily="monospace">RESEARCH · ~2030 (INDICATIVE)</text>
    </svg>
  );
}

function ExpansionDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="Network expansion map">
      <path d="M 30 110 C 70 70, 120 60, 190 45" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 5" />
      {[
        { x: 30, y: 110, r: 12 },
        { x: 75, y: 92, r: 9 },
        { x: 120, y: 70, r: 9 },
        { x: 160, y: 55, r: 7 },
        { x: 195, y: 42, r: 7 },
      ].map((n) => (
        <g key={`${n.x}-${n.y}`}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="var(--cyan)" fillOpacity=".1" stroke="var(--cyan)" strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="3" fill="var(--cyan)" />
        </g>
      ))}
      <text x="30" y="132" fontSize="8" fill="var(--muted)" fontFamily="monospace">EXISTING</text>
      <text x="190" y="132" fontSize="8" fill="var(--muted)" fontFamily="monospace">NEW</text>
    </svg>
  );
}

const diagrams: Record<TabId, ReactNode> = {
  ai: <AiDiagram />,
  edge: <EdgeDiagram />,
  marine: <MarineDiagram />,
  underwater: <UnderwaterDiagram />,
  mimo: <MimoDiagram />,
  sixg: <SixGDiagram />,
  expansion: <ExpansionDiagram />,
};

const timeline = [
  { year: "2009", label: "4G LTE", note: "Mobile broadband era" },
  { year: "2019", label: "5G", note: "Enhanced broadband, low latency, massive IoT" },
  { year: "2022–", label: "5G-Advanced", note: "Modem, positioning, and energy evolution" },
  { year: "~2030", label: "6G (research)", note: "No standard yet; indicative timeframe" },
];

export default function FuturePage() {
  usePageMeta({
    title: "Future of Networking",
    description:
      "Seven emerging directions: AI-assisted management, edge computing, marine, underwater acoustics, MIMO, 6G research, and network expansion — plus a 4G to 6G timeline.",
  });

  const [active, setActive] = useState<TabId>("ai");
  const topic = topics.find((t) => t.id === active) ?? topics[0];

  return (
    <>
      <PageHeader
        index="10"
        eyebrow="Future Network"
        title={<>What comes after 5G <span className="text-gradient">is still being researched.</span></>}
        description="Seven directions that extend connectivity beyond today's networks. Dates and capabilities for future generations are research targets, not deployed consumer services."
        badges={["Research outlook", "7 topics", "Timeline"]}
        aside={
          <div className="glass-panel p-5">
            <span className="data-label">Outlook</span>
            <p className="mt-3 font-display text-[22px] leading-tight tracking-[-.03em] text-[var(--text)]">Networks are becoming sensing, compute, and AI platforms.</p>
            <p className="mt-2 text-[10.5px] leading-5 text-[var(--muted)]">Each topic below separates deployed reality from emerging practice and open research.</p>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <SectionReveal>
          <Panel className="p-5 sm:p-7">
            <Eyebrow icon={<Compass className="h-3.5 w-3.5" />}>Generational timeline</Eyebrow>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {timeline.map((item, index) => (
                <div key={item.label} className="relative rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
                  <span className="font-mono text-[9px] tracking-[.12em] text-[var(--cyan)]">{item.year}</span>
                  <p className="mt-2 text-[13px] font-semibold text-[var(--text)]">{item.label}</p>
                  <p className="mt-1 text-[10.5px] leading-4 text-[var(--muted)]">{item.note}</p>
                  {index < timeline.length - 1 && <span className="absolute right-[-12px] top-1/2 hidden h-px w-4 bg-[var(--line-strong)] md:block" />}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-[var(--subtle)]">4G (2009) → 5G (2019) → 5G-Advanced → 6G research (~2030, indicative only).</p>
          </Panel>
        </SectionReveal>

        <div className="mt-10">
          <Eyebrow>Seven directions</Eyebrow>
          <div className="mt-4">
            <Tabs
              label="Future network topics"
              value={active}
              onChange={setActive}
              tabs={[
                { value: "ai", label: "AI management", icon: <Braces className="h-3.5 w-3.5" /> },
                { value: "edge", label: "Edge", icon: <Cpu className="h-3.5 w-3.5" /> },
                { value: "marine", label: "Marine", icon: <Globe2 className="h-3.5 w-3.5" /> },
                { value: "underwater", label: "Underwater", icon: <Fish className="h-3.5 w-3.5" /> },
                { value: "mimo", label: "MIMO", icon: <Waves className="h-3.5 w-3.5" /> },
                { value: "sixg", label: "6G", icon: <Zap className="h-3.5 w-3.5" /> },
                { value: "expansion", label: "Expansion", icon: <Wind className="h-3.5 w-3.5" /> },
              ]}
            />
          </div>

          <SectionReveal key={active} className="mt-6">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
              <Panel className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-[24px] font-medium tracking-[-.035em] text-[var(--text)]">{topic.title}</h2>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-[var(--subtle)]">Status</p>
                  </div>
                  <StatusBadge status={topic.status} tone={topic.statusTone} />
                </div>
                <p className="mt-4 text-[12px] leading-6 text-[var(--muted)]">{topic.explanation}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mono-label">Applications</p>
                    <ul className="mt-2 space-y-1.5">
                      {topic.applications.map((item) => (
                        <li key={item} className="flex gap-2 text-[10.5px] leading-4 text-[var(--muted)]"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--cyan)]" />{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mono-label">Advantages</p>
                    <ul className="mt-2 space-y-1.5">
                      {topic.advantages.map((item) => (
                        <li key={item} className="flex gap-2 text-[10.5px] leading-4 text-[var(--muted)]"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--good)]" />{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-[var(--warn)]/20 bg-[var(--warn)]/[.04] p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[.13em] text-[var(--warn)]">Challenges</p>
                  <ul className="mt-2 space-y-1.5">
                    {topic.challenges.map((item) => (
                      <li key={item} className="flex gap-2 text-[10.5px] leading-4 text-[var(--muted)]"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--warn)]" />{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 text-[11px] leading-5 text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">Future possibilities: </span>{topic.future}</p>
              </Panel>
              <div className="space-y-5">
                <Panel className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="mono-label">Technical diagram</span>
                    <StatusBadge status={topic.status} tone={topic.statusTone} />
                  </div>
                  <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg-deep)]/60 p-3">
                    {diagrams[topic.id]}
                  </div>
                  <p className="mt-3 text-[9.5px] leading-4 text-[var(--subtle)]">Simplified concept diagram for education. Not to scale; interfaces are illustrative.</p>
                </Panel>
                <InfoNote label="Maturity note">
                  “Deployed” means in service in some form; “Emerging” means early or selective deployments; “Research” means pre-standard investigation. Capability figures quoted for 6G remain research targets.
                </InfoNote>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </>
  );
}
