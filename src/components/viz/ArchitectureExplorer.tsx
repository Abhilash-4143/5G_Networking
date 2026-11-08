import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  Fingerprint,
  Maximize2,
  MessageSquare,
  Minimize2,
  Network,
  Pause,
  Play,
  RadioTower,
  RotateCcw,
  Router,
  Route,
  SlidersHorizontal,
  Smartphone,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  architectureComponents,
  architectureConnections,
  architectureLayers,
  getComponent,
  type ArchitectureComponent,
  type ComponentLayer,
} from "@/data/architecture";
import { cn } from "@/lib/cn";
import { StatusPill } from "@/components/ui/Panel";

const iconMap: Record<ComponentLayer, typeof Smartphone> = {
  ue: Smartphone,
  ran: RadioTower,
  transport: Router,
  core: Route,
  service: MessageSquare,
};

const componentIcons: Record<string, typeof Smartphone> = {
  ue: Smartphone,
  gnb: RadioTower,
  backhaul: Router,
  amf: Network,
  udm: Fingerprint,
  upf: Route,
  messaging: MessageSquare,
  edge: Cpu,
};

const layerAccent: Record<ComponentLayer, string> = {
  ue: "var(--cyan)",
  ran: "var(--blue)",
  transport: "var(--violet)",
  core: "var(--cyan)",
  service: "var(--good)",
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function NodeGroup({
  component,
  selected,
  onSelect,
}: {
  component: ArchitectureComponent;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = componentIcons[component.id] ?? RadioTower;
  const accent = layerAccent[component.layer];
  return (
    <g
      transform={`translate(${component.x} ${component.y})`}
      onClick={() => onSelect(component.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(component.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${component.name}. ${component.summary}`}
      className="cursor-pointer outline-none"
      style={{ transition: "opacity .2s" }}
    >
      <rect
        width={component.width}
        height={component.height}
        rx="12"
        fill="var(--surface-solid)"
        stroke={selected ? accent : "var(--line-strong)"}
        strokeWidth={selected ? 2 : 1.3}
        style={{ transition: "stroke .2s" }}
      />
      <rect x="0" y="0" width="5" height={component.height} rx="2.5" fill={accent} opacity={selected ? 1 : 0.55} />
      <g transform="translate(18 20)" color={accent}>
        <Icon width="15" height="15" strokeWidth={1.7} />
      </g>
      <text x="42" y="27" fill="var(--text)" fontSize="12.5" fontWeight="600" fontFamily="Manrope Variable, sans-serif">
        {component.name}
      </text>
      <text x="42" y="45" fill="var(--muted)" fontSize="9" fontFamily="IBM Plex Mono, monospace" letterSpacing=".9">
        {component.code}
      </text>
      {selected && (
        <g transform={`translate(${component.width - 14} 13)`}>
          <circle r="3.2" fill={accent} />
          <circle r="6" fill="none" stroke={accent} strokeOpacity=".25" />
        </g>
      )}
    </g>
  );
}

function ArchitectureDiagram({
  selected,
  onSelect,
  flowOn,
  reducedMotion,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  flowOn: boolean;
  reducedMotion: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1020 684"
      role="img"
      aria-label="Interactive private 5G network architecture from user equipment through radio access, transport, core, and services"
      className="h-auto w-full min-w-[720px] select-none"
    >
      <defs>
        <linearGradient id="diagram-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity=".35" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity=".2" />
        </linearGradient>
      </defs>
      <g>
        {architectureLayers.map((layer) => (
          <g key={layer.id}>
            <text x="46" y={layer.bandY + 18} fill="var(--subtle)" fontSize="8.5" fontFamily="IBM Plex Mono, monospace" letterSpacing="1.6">
              {layer.index} / {layer.label.toUpperCase()}
            </text>
            <text x="926" y={layer.bandY + 18} fill="var(--subtle)" fontSize="7" fontFamily="monospace" letterSpacing=".6" textAnchor="end">
              {layer.id === "service" ? "OUTCOME" : layer.id === "ue" ? "ORIGIN" : "NETWORK"}
            </text>
          </g>
        ))}
      </g>

      <g>
        {architectureConnections.map((connection) => {
          const related = !selected || connection.from === selected || connection.to === selected;
          const isControl = connection.type === "control";
          return (
            <g key={`${connection.from}-${connection.to}`} opacity={related ? 1 : 0.23} style={{ transition: "opacity .25s" }}>
              <path
                d={connection.path}
                fill="none"
                stroke={related && selected ? (isControl ? "var(--violet)" : "var(--cyan)") : "var(--line-strong)"}
                strokeWidth={related && selected ? 1.3 : 1}
                strokeDasharray={isControl ? "4 5" : undefined}
                style={{ transition: "stroke .25s" }}
              />
              {related && selected && connection.label && (
                <title>{connection.label}</title>
              )}
            </g>
          );
        })}
      </g>

      {flowOn && !reducedMotion && (
        <g aria-hidden="true">
          {architectureConnections.map((connection, index) => (
            <circle key={`packet-${connection.from}-${connection.to}`} r="2.8" fill={connection.type === "control" ? "var(--violet)" : "var(--cyan)"}>
              <animateMotion dur={`${2.8 + index * 0.18}s`} repeatCount="indefinite" path={connection.path} begin={`${index * 0.32}s`} />
              <animate attributeName="opacity" values="0;.9;.9;0" dur={`${2.8 + index * 0.18}s`} repeatCount="indefinite" begin={`${index * 0.32}s`} />
            </circle>
          ))}
        </g>
      )}

      <g>
        {architectureComponents.map((component) => (
          <NodeGroup
            key={component.id}
            component={component}
            selected={selected === component.id}
            onSelect={onSelect}
          />
        ))}
      </g>

      <g opacity=".65">
        <text x="510" y="676" textAnchor="middle" fill="var(--subtle)" fontSize="7" fontFamily="monospace" letterSpacing="1">
          LOGICAL PRIVATE NETWORK · NOT A COMMERCIAL DEPLOYMENT DIAGRAM
        </text>
      </g>
    </svg>
  );
}

function MobileLayerStack({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2 lg:hidden">
      {architectureLayers.map((layer, layerIndex) => {
        const components = architectureComponents.filter((component) => component.layer === layer.id);
        const Icon = iconMap[layer.id];
        return (
          <div key={layer.id}>
            <div className="rounded-xl border border-[var(--line)] bg-white/[.018] p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--line)]" style={{ color: layer.color }}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--text)]">{layer.label}</p>
                  <p className="mt-0.5 font-mono text-[7.5px] uppercase tracking-[.1em] text-[var(--subtle)]">{layer.description}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {components.map((component) => {
                  const CmpIcon = componentIcons[component.id] ?? RadioTower;
                  const active = selected === component.id;
                  return (
                    <button
                      key={component.id}
                      type="button"
                      onClick={() => onSelect(component.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]",
                        active
                          ? "border-[var(--cyan)]/40 bg-[var(--cyan)]/[.08] text-[var(--text)]"
                          : "border-[var(--line)] bg-[var(--bg-elevated)]/60 text-[var(--muted)] hover:text-[var(--text)]",
                      )}
                    >
                      <CmpIcon className={cn("h-3.5 w-3.5 shrink-0", active && "text-[var(--cyan)]")} />
                      <span className="truncate text-[10px] font-medium">{component.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {layerIndex < architectureLayers.length - 1 && (
              <div className="flex justify-center py-1.5 text-[var(--subtle)]" aria-hidden>
                <ArrowDown className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="data-label">{label}</p>
      <div className="mt-2.5 text-[11.5px] leading-5 text-[var(--muted)]">{children}</div>
    </div>
  );
}

function ComponentDetails({
  component,
  selected,
  onSelect,
}: {
  component: ArchitectureComponent | undefined;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (!component) {
    return (
      <div className="flex h-full min-h-[380px] flex-col items-center justify-center p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-white/[.025] text-[var(--subtle)]">
          <SlidersHorizontal className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[12.5px] font-semibold text-[var(--text)]">Select a network component</p>
        <p className="mt-1 max-w-xs text-[10.5px] leading-5 text-[var(--subtle)]">
          Choose any node in the diagram to inspect its functions, interfaces, hardware, and software.
        </p>
      </div>
    );
  }
  const Icon = componentIcons[component.id] ?? RadioTower;
  const connections = architectureConnections.filter((connection) => connection.from === component.id || connection.to === component.id);
  return (
    <div className="flex h-full flex-col" aria-live="polite">
      <div className="border-b border-[var(--line)] p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--cyan)]/20 bg-[var(--cyan)]/[.06] text-[var(--cyan)]">
            <Icon className="h-4 w-4" />
          </span>
          <StatusPill label={component.layerLabel} tone="info" />
        </div>
        <h3 className="mt-4 font-display text-[22px] font-medium leading-tight tracking-[-.035em] text-[var(--text)]">{component.name}</h3>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[.13em] text-[var(--subtle)]">{component.code} · {component.role}</p>
        <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">{component.summary}</p>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5 [scrollbar-width:thin]">
        <DetailBlock label="Technical explanation">{component.technical}</DetailBlock>
        <DetailBlock label="Main functions">
          <ul className="space-y-1.5">
            {component.functions.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--good)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DetailBlock>
        <div className="grid grid-cols-2 gap-4">
          <DetailBlock label="Inputs">
            <ul className="space-y-1">
              {component.inputs.map((item) => <li key={item} className="text-[10.5px]">{item}</li>)}
            </ul>
          </DetailBlock>
          <DetailBlock label="Outputs">
            <ul className="space-y-1">
              {component.outputs.map((item) => <li key={item} className="text-[10.5px]">{item}</li>)}
            </ul>
          </DetailBlock>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DetailBlock label="Hardware">
            <div className="flex flex-wrap gap-1.5">
              {component.hardware.map((item) => <span key={item} className="rounded border border-[var(--line)] bg-white/[.025] px-1.5 py-0.5 text-[8.5px] text-[var(--muted)]">{item}</span>)}
            </div>
          </DetailBlock>
          <DetailBlock label="Software">
            <div className="flex flex-wrap gap-1.5">
              {component.software.map((item) => <span key={item} className="rounded border border-[var(--line)] bg-white/[.025] px-1.5 py-0.5 text-[8.5px] text-[var(--muted)]">{item}</span>)}
            </div>
          </DetailBlock>
        </div>
        <DetailBlock label="Real-world application">{component.realWorld}</DetailBlock>
        <DetailBlock label="Connected to">
          <div className="flex flex-wrap gap-1.5">
            {connections.map((connection) => {
              const otherId = connection.from === component.id ? connection.to : connection.from;
              const other = getComponent(otherId);
              if (!other) return null;
              return (
                <button
                  key={otherId}
                  onClick={() => onSelect(otherId)}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] px-2 py-1 text-[9px] text-[var(--muted)] transition-colors hover:border-[var(--cyan)]/30 hover:text-[var(--cyan)]"
                >
                  {other.code}
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              );
            })}
          </div>
        </DetailBlock>
        <div className="text-[8px] leading-4 text-[var(--subtle)]">
          Component descriptions are educational simplifications.{selected === component.id ? " Selection active." : ""}
        </div>
      </div>
    </div>
  );
}

export function ArchitectureExplorer({
  selected,
  setSelected,
}: {
  selected: string | null;
  setSelected: (id: string | null) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [flowOn, setFlowOn] = useState(true);
  const [full, setFull] = useState(false);
  const reducedMotion = useReducedMotion();
  const component = getComponent(selected ?? "");

  useEffect(() => {
    if (!full) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  function reset() {
    setZoom(1);
    setSelected(null);
    setFlowOn(true);
  }

  const explorer = (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface-solid)] shadow-[0_30px_100px_-40px_rgba(0,0,0,.8)]",
        full ? "rounded-none" : "rounded-[18px]",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--line)] bg-white/[.025] text-[var(--cyan)]">
            <Network className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[.15em] text-[var(--muted)]">Architecture map</p>
            <p className="hidden font-mono text-[7px] uppercase tracking-[.1em] text-[var(--subtle)] sm:block">Select a node to inspect</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFlowOn((value) => !value)}
            aria-pressed={flowOn}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white/[.025] px-2.5 text-[9.5px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            {flowOn ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            Flow {flowOn ? "on" : "off"}
          </button>
          <div className="hidden items-center rounded-lg border border-[var(--line)] bg-white/[.025] sm:flex">
            <button type="button" onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.1).toFixed(1)))} disabled={zoom <= 0.8} aria-label="Zoom out" className="grid h-8 w-8 place-items-center text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-[8px] tabular-nums text-[var(--subtle)]">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))} disabled={zoom >= 1.6} aria-label="Zoom in" className="grid h-8 w-8 place-items-center text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
          <button type="button" onClick={reset} aria-label="Reset architecture view" className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setFull((value) => !value)} aria-label={full ? "Exit full-screen architecture" : "Open full-screen architecture"} className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]">
            {full ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 border-b border-[var(--line)] xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2">
            <span className="font-mono text-[7.5px] uppercase tracking-[.12em] text-[var(--subtle)]">Synthetic topology / private core</span>
            <div className="hidden items-center gap-3 font-mono text-[7px] uppercase tracking-[.08em] text-[var(--subtle)] sm:flex">
              <span className="flex items-center gap-1"><span className="h-1 w-3 bg-[var(--cyan)]" /> user plane</span>
              <span className="flex items-center gap-1"><span className="h-px w-3 border-t border-dashed border-[var(--violet)]" /> control plane</span>
            </div>
          </div>
          <div className="lg:hidden">
            <MobileLayerStack selected={selected} onSelect={setSelected} />
          </div>
          <div className="hidden max-h-[610px] overflow-auto lg:block">
            <div className="p-4" style={{ width: `${zoom * 100}%`, minWidth: "100%" }}>
              <ArchitectureDiagram selected={selected} onSelect={setSelected} flowOn={flowOn} reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
        <aside className={cn("min-h-0 bg-[var(--bg-elevated)]/55", full ? "xl:w-[390px]" : "")}
          style={full ? undefined : undefined}
        >
          <div className={cn("h-full max-h-[610px] overflow-y-auto", full && "max-h-none")}>
            <ComponentDetails component={component} selected={selected} onSelect={setSelected} />
          </div>
        </aside>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] px-4 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[7px] uppercase tracking-[.1em] text-[var(--subtle)]">
          <span className="h-1 w-1 rounded-full bg-[var(--good)]" /> Flow simulation illustrative
        </span>
        <span className="font-mono text-[7px] uppercase tracking-[.1em] text-[var(--subtle)]">5 Layers · 8 components · 8 links</span>
      </div>
    </div>
  );

  if (full) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-[var(--bg)] p-2 sm:p-4">
        {explorer}
      </div>,
      document.body,
    );
  }

  return explorer;
}

export function LayerHandbook({ onSelect }: { onSelect: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>("ran");
  const grouped = useMemo(
    () =>
      architectureLayers.map((layer) => ({
        ...layer,
        components: architectureComponents.filter((component) => component.layer === layer.id),
      })),
    [],
  );

  return (
    <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {grouped.map((layer) => {
        const Icon = iconMap[layer.id];
        const isOpen = open === layer.id;
        return (
          <div key={layer.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : layer.id)}
              aria-expanded={isOpen}
              className="group flex w-full items-start gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--cyan)] sm:items-center"
            >
              <span className="font-mono text-[9px] text-[var(--subtle)]">{layer.index}</span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white/[.025]" style={{ color: layer.color }}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[var(--text)]">{layer.label}</span>
                <span className="mt-0.5 block text-[10.5px] text-[var(--subtle)]">{layer.description}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="hidden font-mono text-[8px] uppercase tracking-[.1em] text-[var(--subtle)] sm:block">{layer.components.length} components</span>
                <ChevronDown className={cn("h-4 w-4 text-[var(--subtle)] transition-transform", isOpen && "rotate-180")} />
              </span>
            </button>
            {isOpen && (
              <div className="grid gap-2 pb-5 pl-0 sm:grid-cols-2 sm:pl-[74px] lg:grid-cols-3">
                {layer.components.map((component) => (
                  <button
                    key={component.id}
                    type="button"
                    onClick={() => onSelect(component.id)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white/[.018] px-3.5 py-3 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-white/[.035]"
                  >
                    <span>
                      <span className="block text-[10.5px] font-semibold text-[var(--text)]">{component.name}</span>
                      <span className="mt-0.5 block text-[9px] text-[var(--subtle)]">{component.role}</span>
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-[var(--subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--cyan)]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
