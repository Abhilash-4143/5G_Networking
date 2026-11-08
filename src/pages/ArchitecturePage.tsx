import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, GitBranch, Layers3, LockKeyhole, RadioTower, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ArchitectureExplorer, LayerHandbook } from "@/components/viz/ArchitectureExplorer";
import { PacketTransmissionLab } from "@/components/viz/PacketTransmissionLab";
import Architecture3D from "@/components/viz/Architecture3D";
import { Eyebrow, Panel, StatusPill } from "@/components/ui/Panel";
import { SectionHeader, InfoNote } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { usePageMeta } from "@/lib/meta";
import { getComponent } from "@/data/architecture";

export default function ArchitecturePage() {
  const [selected, setSelected] = useState<string | null>("gnb");
  const explorerRef = useRef<HTMLDivElement>(null);
  usePageMeta({
    title: "Network Architecture",
    description:
      "Explore a private 5G network architecture layer by layer: user equipment, RAN, backhaul, core functions, and communication services.",
  });

  function selectAndFocus(id: string) {
    setSelected(id);
    explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const selectedComponent = getComponent(selected ?? "");

  return (
    <>
      <PageHeader
        index="03"
        eyebrow="Architecture"
        title={<>One network.<br /><span className="text-gradient">Five layers.</span></>}
        description="A private 5G path is a chain of specialized systems. Follow the flow from a radio endpoint through the access network, transport, core, and service layer — then inspect the engineering inside each component."
        badges={["Private network", "Interactive topology"]}
        aside={
          <div className="glass-panel overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Topology snapshot</span>
              <StatusPill label="Concept" tone="info" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
              {[
                ["Layers", "5"],
                ["Components", "8"],
                ["Core functions", "AMF · UDM · UPF"],
                ["Service endpoints", "Messaging · Edge"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">{label}</p>
                  <p className="mt-1 text-[11px] font-medium leading-4 text-[var(--text)]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[var(--line)] pt-3.5">
              <p className="text-[9.5px] leading-4 text-[var(--subtle)]">
                A logical reference model. Real deployments add redundancy, security zones, timing, and operations systems.
              </p>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <div ref={explorerRef} className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Eyebrow>Interactive engineering map</Eyebrow>
              <p className="mt-2 text-[11px] text-[var(--subtle)]">
                {selectedComponent ? `Selected: ${selectedComponent.name}` : "Select any component to begin."}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["UE", "RAN", "Transport", "5G Core", "Services"].map((layer, index) => (
                <span key={layer} className="rounded-md border border-[var(--line)] bg-white/[.02] px-2 py-1 font-mono text-[7.5px] uppercase tracking-[.08em] text-[var(--subtle)]">
                  0{index + 1} {layer}
                </span>
              ))}
            </div>
          </div>
          <ArchitectureExplorer selected={selected} setSelected={setSelected} />
        </div>

        <div className="mt-10 lg:mt-14">
          <SectionHeader
            eyebrow="3D NETWORK ENVIRONMENT"
            title="The path as a place."
            description="Step into the same five-stage path as a spatial scene — select any node to stay in sync with the explorer above."
          />
          <div className="mt-8">
            <Architecture3D selected={selected} onSelect={(id) => setSelected(id)} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { icon: RadioTower, title: "Radio is local; control is central", text: "The gNB schedules radio resources at the edge while core functions manage identity, sessions, and routing." },
            { icon: GitBranch, title: "Separate planes, different jobs", text: "Control signaling and user data take different paths. The diagram distinguishes control-plane links from user-plane flows." },
            { icon: LockKeyhole, title: "Trust is a prerequisite", text: "Access is authorized through identity and authentication before a session can carry application traffic." },
          ].map((item) => (
            <Panel key={item.title} className="p-4" hover>
              <item.icon className="h-4 w-4 text-[var(--cyan)]" strokeWidth={1.7} />
              <p className="mt-3 text-[11.5px] font-semibold text-[var(--text)]">{item.title}</p>
              <p className="mt-1.5 text-[10.5px] leading-5 text-[var(--muted)]">{item.text}</p>
            </Panel>
          ))}
        </div>

        <div className="mt-14 lg:mt-20">
          <SectionHeader
            eyebrow="PACKET TRANSMISSION LAB"
            title="One message, traced end to end."
            description="Experience how a message travels through the network, from sender to receiver. This is an educational simulation — no real SMS messages are sent and no carrier network is contacted."
            action={<StatusPill label="Interactive" tone="info" pulse />}
          />
          <div className="mt-8">
            <PacketTransmissionLab />
          </div>
        </div>
      </div>

      <section className="page-shell section-space border-t border-[var(--line)] pt-14 lg:pt-20">
        <SectionHeader
          eyebrow="Layer handbook"
          title="Inspect the system, not just the diagram."
          description="Each layer contributes a distinct capability. Expand a layer to jump into its components and read the technical detail in the explorer above."
          action={<span className="hidden items-center gap-2 font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)] sm:flex"><BookOpen className="h-3.5 w-3.5" /> 8 technical entries</span>}
        />
        <div className="mt-9">
          <LayerHandbook onSelect={selectAndFocus} />
        </div>
      </section>

      <section className="page-shell pb-16 lg:pb-24">
        <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[18px] border border-[var(--line)] bg-white/[.02] p-6 sm:p-8">
            <Eyebrow>Design principle</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(1.5rem,3vw,2.2rem)] font-medium leading-[1.06] tracking-[-.045em]">
              A private network is not a smaller public network.
            </h2>
            <p className="mt-4 max-w-2xl text-[12px] leading-6 text-[var(--muted)]">
              Independence changes the responsibility model. An organization operating its own network must plan spectrum authorization, site power, backhaul availability, identity lifecycle, support staff, cybersecurity, and regulatory compliance. The academic project frames these requirements rather than claiming that a deployment already exists.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/project">
                <Button variant="secondary" size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Project framing</Button>
              </Link>
              <Link to="/emergency-network">
                <Button variant="quiet" size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Emergency scenario</Button>
              </Link>
            </div>
          </div>
          <Panel className="p-5">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[var(--violet)]" />
              <span className="font-mono text-[9px] uppercase tracking-[.13em] text-[var(--muted)]">Scope note</span>
            </div>
            <div className="mt-4 space-y-4">
              <InfoNote label="Reference model">
                Interfaces and function names are based on 3GPP 5G concepts but simplified for education.
              </InfoNote>
              <InfoNote label="Not a deployment">
                No commercial network, spectrum license, hardware test, or field performance result is represented here.
              </InfoNote>
              <InfoNote label="Client-side">
                The topology and packet animation are generated locally. No carrier or cloud network is contacted.
              </InfoNote>
            </div>
            <div className="mt-4 flex items-start gap-2 text-[9.5px] leading-4 text-[var(--subtle)]">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
              Educational diagram only. Production design requires qualified network engineers and authorized spectrum.
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}
