import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, CircuitBoard, Code2, Fingerprint, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/Controls";
import { SectionReveal } from "@/components/ui/Reveal";
import { usePageMeta } from "@/lib/meta";

const team = [
  { name: "Abhilash R", id: "20241CSE600" },
  { name: "Shashank K", id: "20241CSE0602" },
  { name: "Lakshman J", id: "20241CSE0620" },
  { name: "Hitesh B", id: "20241CSE0622" },
  { name: "Chathan R", id: "20241CSE0595" },
];

const sections = [
  {
    id: "problem",
    label: "Problem",
    title: "Problem statement",
    body: "In distributed or remote settings, conventional public cellular coverage can be absent, congested, or financially impractical to extend. Such locations still need dependable connectivity for communication, coordination, and local services, yet building a full operator-grade network from scratch is beyond a small academic team's scope.",
  },
  {
    id: "solution",
    label: "Solution",
    title: "Proposed solution",
    body: "An independent long-range communication network: a dedicated base station and local core that provide connectivity within a defined service area, without depending on an external public carrier for local traffic. The design separates radio access, transport, core control, and application layers so each can be reasoned about independently.",
  },
  {
    id: "objectives",
    label: "Objectives",
    title: "Objectives",
    body: "Define a clear reference architecture; understand radio, core, and identity fundamentals through study; prototype the software and hardware interfaces conceptually; and document the operational, power, spectrum, and regulatory requirements a real deployment would need.",
  },
  {
    id: "architecture",
    label: "Architecture",
    title: "Architecture overview",
    body: "User devices connect via radio access to a base station, which carries traffic over backhaul to a local core. The core handles identity, sessions, and routing, then delivers traffic to local services. See the interactive explorer for the layered topology.",
    link: "/architecture",
  },
  {
    id: "hardware",
    label: "Hardware",
    title: "Hardware",
    body: "Conceptual hardware comprises antennas and an RF front end, a radio unit converting digital signals to radio waves, a baseband unit for modulation and scheduling, backhaul transport, and conditioned power with backup. Component selection, frequencies, and licensing are outside the scope of this paper design.",
  },
  {
    id: "software",
    label: "Software",
    title: "Software",
    body: "Software responsibilities include radio resource scheduling, protocol stacks, core network functions such as access, mobility, and user-plane handling, plus device provisioning and operations monitoring. This website models those ideas interactively; it is not the network software itself.",
  },
  {
    id: "basestation",
    label: "Base station",
    title: "Base station operation",
    body: "The base station schedules radio resources among connected devices, adapts modulation and coding to link quality, manages handovers toward and from the core, and enforces policy. During operation it must balance throughput, latency, and energy across its sectors.",
  },
  {
    id: "integration",
    label: "Integration",
    title: "Hardware + software integration",
    body: "Hardware and software meet at driver and firmware boundaries: baseband-to-radio interfaces, timing and synchronisation signals, telemetry feedback, and fault reporting. Integration risk concentrates at these seams, which is why interface definitions matter more than individual component choices.",
  },
  {
    id: "identity",
    label: "Identity",
    title: "Device identity",
    body: "Every device must prove its subscription identity before receiving a session. Protected credentials stored in SIM-class secure elements enable mutual authentication and prevent unauthorised devices from consuming network resources. The authentication flow is visualised in the security module.",
  },
  {
    id: "future",
    label: "Future scope",
    title: "Future scope",
    body: "Future work in a real programme would include field surveys, licensed-spectrum procurement, hardware procurement and bench verification, phased testing under qualified supervision, redundancy planning, and regulatory compliance — none of which are claimed to have been done here.",
  },
  {
    id: "conclusion",
    label: "Conclusion",
    title: "Conclusion",
    body: "An independent long-range communication network is conceptually coherent: radio access, transport, core, and services form a layered system that can be studied and reasoned about as a whole. This academic project frames that system honestly as a design and educational exercise.",
  },
] as const;

export default function ProjectPage() {
  usePageMeta({
    title: "Independent Long-Range Communication Network",
    description:
      "Academic project concept: problem statement, proposed solution, objectives, architecture, hardware, software, base station, integration, identity, future scope, and conclusion. Concept only — no real deployment.",
  });

  const [active, setActive] = useState<(typeof sections)[number]["id"]>("problem");
  const selected = sections.find((s) => s.id === active) ?? sections[0];

  return (
    <>
      <PageHeader
        index="11"
        eyebrow="Project"
        title={<>Independent Long-Range Communication Network: <span className="text-gradient">an academic concept.</span></>}
        description="A private-network design study covering radio, core, identity, and operations. This page describes the proposed concept only; it does not report any field deployment, test result, or performance measurement."
        badges={["Academic project", "Concept only"]}
        aside={
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">Project status</span>
              <StatusPill label="Concept only" tone="info" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2.5 text-[11px] leading-4 text-[var(--muted)]">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cyan)]" />
                Paper design and educational simulation. No invented tests, trials, or deployments are presented.
              </div>
              <div className="flex items-start gap-2.5 text-[11px] leading-4 text-[var(--muted)]">
                <CircuitBoard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cyan)]" />
                Hardware and software are described at interface level; component procurement and verification are future scope.
              </div>
              <div className="flex items-start gap-2.5 text-[11px] leading-4 text-[var(--muted)]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cyan)]" />
                A real build would require licensed spectrum, qualified engineering, and regulatory authorisation.
              </div>
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <InfoNote label="Evidence policy">
          Everything on this page is a proposed concept for study purposes. No test data, coverage maps, or deployment claims are made, and none should be read into this description.
        </InfoNote>

        <div className="mt-8 lg:hidden">
          <SegmentedControl
            label="Project sections"
            value={active}
            onChange={setActive}
            options={sections.map((s) => ({ value: s.id, label: s.label }))}
          />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Project sections" className="hidden lg:block">
            <div className="sticky top-6 space-y-1">
              {sections.map((section) => {
                const isActive = section.id === active;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActive(section.id)}
                    className={"flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[12px] font-semibold transition-colors " + (isActive ? "border-[var(--line-strong)] bg-white/[.05] text-[var(--text)]" : "border-transparent text-[var(--muted)] hover:text-[var(--text)]")}
                  >
                    {section.label}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="min-w-0">
            <SectionReveal key={selected.id}>
              <Panel className="p-6 sm:p-8" hover={false}>
                <Eyebrow icon={<GraduationCap className="h-3.5 w-3.5" />}>Academic project · {selected.label}</Eyebrow>
                <h2 className="mt-4 font-display text-[26px] font-medium leading-[1.08] tracking-[-.045em] text-[var(--text)]">{selected.title}</h2>
                <p className="mt-4 max-w-2xl text-[12.5px] leading-6 text-[var(--muted)]">{selected.body}</p>
                {"link" in selected && typeof selected.link === "string" && (
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <Link to={selected.link}>
                      <Button variant="primary" size="sm" iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}>Open architecture explorer</Button>
                    </Link>
                    <Link to="/base-station">
                      <Button variant="secondary" size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Base station module</Button>
                    </Link>
                  </div>
                )}
              </Panel>
            </SectionReveal>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Panel className="p-4" hover>
                <Code2 className="h-4 w-4 text-[var(--cyan)]" />
                <p className="mt-3 text-[11.5px] font-semibold text-[var(--text)]">Design before deployment</p>
                <p className="mt-1 text-[10.5px] leading-5 text-[var(--muted)]">Interfaces, requirements, and failure modes are documented before any hardware could be considered.</p>
              </Panel>
              <Panel className="p-4" hover>
                <Fingerprint className="h-4 w-4 text-[var(--violet)]" />
                <p className="mt-3 text-[11.5px] font-semibold text-[var(--text)]">Identity is part of the design</p>
                <p className="mt-1 text-[10.5px] leading-5 text-[var(--muted)]">Device provisioning, authentication, and session authorisation are first-class design concerns, not afterthoughts.</p>
              </Panel>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <SectionHeader eyebrow="Team" title="Built as a team." description="Five students designed and built this educational platform as an academic project." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {team.map((member) => (
              <Panel key={member.id} className="p-4 text-center" hover>
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-[var(--line-strong)] bg-white/[.03] text-[15px] font-semibold text-[var(--text)]">
                  {member.name.charAt(0)}
                </span>
                <p className="mt-3 text-[12px] font-semibold text-[var(--text)]">{member.name}</p>
                <p className="mt-0.5 font-mono text-[9px] tracking-[.08em] text-[var(--subtle)]">{member.id}</p>
              </Panel>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-2 text-[10px] leading-4 text-[var(--subtle)]">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Names and university-style IDs are reproduced as supplied for this academic project context.
          </div>
        </section>
      </div>
    </>
  );
}
