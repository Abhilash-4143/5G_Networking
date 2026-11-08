import { Link } from "react-router-dom";
import { Compass, Home, RadioTower } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel, Eyebrow } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { usePageMeta } from "@/lib/meta";

export default function NotFoundPage() {
  usePageMeta({
    title: "Page Not Found",
    description: "The requested module does not exist in 5G Network Explorer.",
  });

  return (
    <>
      <PageHeader
        index="404"
        eyebrow="Route not found"
        title={<>This frequency<br /><span className="text-gradient">has no signal.</span></>}
        description="The module you requested does not exist or may have moved. Retune to a known route below."
        badges={["404"]}
        aside={
          <Panel className="p-5">
            <div className="flex items-center gap-2">
              <RadioTower className="h-4 w-4 text-[var(--cyan)]" />
              <span className="font-mono text-[9px] uppercase tracking-[.13em] text-[var(--muted)]">Signal check</span>
            </div>
            <p className="mt-3 text-[11.5px] leading-5 text-[var(--muted)]">
              All 12 modules are listed in the navigation. Search (Ctrl/⌘ + K) can locate concepts quickly.
            </p>
          </Panel>
        }
      />
      <div className="page-shell py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: "/", label: "Home", detail: "Overview and 3D network model", icon: Home },
            { to: "/simulator", label: "Simulator", detail: "End-to-end message simulation", icon: RadioTower },
            { to: "/architecture", label: "Architecture", detail: "Layer-by-layer network map", icon: Compass },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="group">
              <Panel className="p-5 transition-colors group-hover:border-[var(--line-strong)]" hover>
                <item.icon className="h-5 w-5 text-[var(--cyan)]" strokeWidth={1.6} />
                <p className="mt-4 text-[13px] font-semibold text-[var(--text)]">{item.label}</p>
                <p className="mt-1 text-[10.5px] leading-5 text-[var(--muted)]">{item.detail}</p>
              </Panel>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <Button variant="primary" iconLeft={<Home className="h-4 w-4" />}>
              Return to home
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-center text-[10px] text-[var(--subtle)]">
          <Eyebrow>Hint</Eyebrow> Use global search to find concepts, components, and pages.
        </p>
      </div>
    </>
  );
}
