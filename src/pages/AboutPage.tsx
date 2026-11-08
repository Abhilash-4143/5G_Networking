import { Link } from "react-router-dom";
import { ArrowRight, Award, Code2, Cpu, GraduationCap, Layers3, Mail, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Eyebrow, Panel, StatusPill } from "@/components/ui/Panel";
import { InfoNote, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { usePageMeta } from "@/lib/meta";

const team = [
  { name: "Abhilash R", id: "20241CSE600" },
  { name: "Shashank K", id: "20241CSE0602" },
  { name: "Lakshman J", id: "20241CSE0620" },
  { name: "Hitesh B", id: "20241CSE0622" },
  { name: "Chathan R", id: "20241CSE0595" },
];

const technologies = [
  { name: "React 18", role: "UI library", detail: "Component model driving every module and simulation." },
  { name: "Vite", role: "Build tool", detail: "Fast development server and production bundler." },
  { name: "TypeScript", role: "Type safety", detail: "Strict typing (noUnusedLocals) to keep the codebase honest." },
  { name: "Tailwind CSS", role: "Styling", detail: "Utility classes over CSS variables for navy glass design." },
  { name: "Three.js", role: "3D visualisation", detail: "Hero scene and spatial network rendering." },
  { name: "Recharts", role: "Charts", detail: "Telemetry history in the operations sandbox." },
];

export default function AboutPage() {
  usePageMeta({
    title: "About",
    description:
      "About the 5G Network Explorer: project introduction, objectives, technologies, educational purpose, the five-student team, and acknowledgement.",
  });

  return (
    <>
      <PageHeader
        index="12"
        eyebrow="About"
        title={<>An educational platform about <span className="text-gradient">next-generation networks.</span></>}
        description="The 5G Network Explorer is an interactive learning site that explains cellular fundamentals, private-network architecture, security, simulation, and future connectivity — entirely client-side and entirely educational."
        badges={["Educational", "Client-side"]}
        aside={
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <span className="data-label">What this is</span>
              <StatusPill label="Learning platform" tone="info" />
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">Interactive explanations, simulations, and diagrams — not a carrier, not a deployment, and not an emergency service.</p>
            <div className="mt-4 flex items-start gap-2 border-t border-[var(--line)] pt-3 text-[10px] leading-4 text-[var(--subtle)]">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--good)]" />
              No real network traffic, credentials, or personal data are processed.
            </div>
          </div>
        }
      />

      <div className="page-shell py-10 lg:py-14">
        <section>
          <SectionHeader eyebrow="Project introduction" title="Why build this?" description="Cellular generations are often reduced to marketing numbers. This project instead teaches the engineering underneath: radio, architecture, identity, operations, and what might come next." />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: GraduationCap, title: "Educational purpose", text: "Make abstract networking tangible through interactive simulations and layered diagrams, suitable for undergraduate study." },
              { icon: Layers3, title: "One system, many layers", text: "Connect radio fundamentals to core architecture, base-station hardware, security, operations, emergency use, and future research." },
              { icon: Sparkles, title: "Interactive first", text: "Every major module lets visitors change parameters and observe consequences in the browser, rather than reading static text." },
            ].map((item) => (
              <Panel key={item.title} className="p-5" hover>
                <item.icon className="h-4 w-4 text-[var(--cyan)]" />
                <p className="mt-3 text-[12px] font-semibold text-[var(--text)]">{item.title}</p>
                <p className="mt-1.5 text-[10.5px] leading-5 text-[var(--muted)]">{item.text}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionHeader eyebrow="Objectives" title="What the project set out to do." description="Four outcomes guided the build." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Explain 5G and private-network concepts accurately without overstating capability.",
              "Provide honest, clearly-labelled simulations that distinguish synthetic data from measurement.",
              "Visualise layered architecture, identity, and failure modes in an accessible way.",
              "Survey future connectivity directions while marking research speculation as research.",
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-white/[.02] px-4 py-3.5">
                <span className="font-mono text-[10px] text-[var(--cyan)]">0{index + 1}</span>
                <p className="text-[11px] leading-5 text-[var(--muted)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionHeader eyebrow="Technologies used" title="Modern web stack, chosen for clarity." description="The platform runs entirely in the visitor's browser." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech) => (
              <Panel key={tech.name} className="p-4" hover>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[var(--text)]">{tech.name}</span>
                  <span className="font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)]">{tech.role}</span>
                </div>
                <p className="mt-1.5 text-[10.5px] leading-4 text-[var(--muted)]">{tech.detail}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionHeader eyebrow="Team" title="Five students, one platform." action={<span className="inline-flex items-center gap-2 font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)]"><Users className="h-3.5 w-3.5" /> Academic project</span>} />
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
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Panel className="p-5 sm:p-6">
              <Eyebrow icon={<Mail className="h-3.5 w-3.5" />}>Acknowledgement</Eyebrow>
              <p className="mt-3 text-[12px] leading-6 text-[var(--muted)]">
                Grateful to our faculty mentors and the wider open-source community for React, Vite, TypeScript, Tailwind CSS, Three.js, and Recharts — and to the standards and research communities whose published material grounds the concepts in this site.
              </p>
              <div className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-[var(--subtle)]">
                <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warn)]" />
                Concept diagrams are simplified for teaching and are not engineering drawings.
              </div>
            </Panel>
            <Panel className="p-5 sm:p-6">
              <Eyebrow icon={<Cpu className="h-3.5 w-3.5" />}>Scope note</Eyebrow>
              <p className="mt-3 text-[12px] leading-6 text-[var(--muted)]">
                This site is a student learning resource. It does not offer carrier services, emergency communication, certified training, or professional network design.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link to="/project"><Button variant="secondary" size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Project concept</Button></Link>
                <Link to="/"><Button variant="quiet" size="sm" iconRight={<Code2 className="h-3.5 w-3.5" />}>Back to home</Button></Link>
              </div>
            </Panel>
          </div>
        </section>

        <footer className="mt-14 border-t border-[var(--line)] pt-6">
          <p className="text-[10px] leading-5 text-[var(--subtle)]">
            5G Network Explorer · Educational platform · Built by Abhilash R, Shashank K, Lakshman J, Hitesh B, and Chathan R as an academic project. All simulations are synthetic and run locally; no real network is involved.
          </p>
          <InfoNote label="Professional note" className="mt-4">
            For certified instruction, licensed-spectrum engineering, or production network deployment, consult qualified educators and engineers.
          </InfoNote>
        </footer>
      </div>
    </>
  );
}
