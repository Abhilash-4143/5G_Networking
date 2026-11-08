import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "@/lib/visibility";

const BG = "#102A26";
const BG_DEEP = "#0B211E";
const BLUE = "#91B7A5";
const SILVER = "#B8CCBE";
const SILVER_LIGHT = "#DCE9DC";
const STEEL = "#6E8AA3";
const DARK = "#13263E";
const PAD = "#0F1F33";

export type BaseStation3DProps = {
  components: { id: string; label: string; short: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeStage?: string | null;
};

type IdMap = {
  antenna: string | null;
  rf: string | null;
  baseband: string | null;
  scheduler: string | null;
  backhaul: string | null;
  power: string | null;
  network: string | null;
};

function supportsWebGL(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function pick(
  components: BaseStation3DProps["components"],
  matches: (id: string) => boolean,
  fallbackIndex: number,
): string | null {
  const found = components.find((c) => matches(c.id.toLowerCase()));
  if (found) return found.id;
  return components[fallbackIndex]?.id ?? null;
}

function buildIdMap(components: BaseStation3DProps["components"]): IdMap {
  return {
    antenna: pick(components, (id) => id.includes("antenna") || id.includes("array"), 0),
    rf: pick(components, (id) => id === "rf" || id.includes("rfu") || id.includes("rru"), 1),
    baseband: pick(components, (id) => id.includes("baseband") || id.includes("bbu") || id.includes("base"), 2),
    scheduler: pick(components, (id) => id.includes("sched"), 3),
    backhaul: pick(components, (id) => id.includes("backhaul") || id.includes("transport") || id === "bh", 4),
    power: pick(components, (id) => id.includes("power") || id.includes("battery") || id.includes("pwr"), 5),
    network: pick(components, (id) => id.includes("ducu") || id.includes("network") || id.includes("gnb"), 6),
  };
}

function SelectableGroup({
  id,
  short,
  position,
  onSelect,
  selected,
  pulsing,
  reducedMotion,
  ringRadius,
  ringY,
  labelPosition,
  children,
}: {
  id: string;
  short: string;
  position: [number, number, number];
  onSelect: (id: string) => void;
  selected: boolean;
  pulsing: boolean;
  reducedMotion: boolean;
  ringRadius: number;
  ringY: number;
  labelPosition: [number, number, number];
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    const target =
      pulsing && !reducedMotion
        ? 0.55 + Math.sin(t * 3.4) * 0.35
        : selected
          ? 0.6
          : 0.07;
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (mat && "emissiveIntensity" in mat) {
        mat.emissiveIntensity = target;
      }
    });
  });

  return (
    <group ref={ref} position={position}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {children}
      </group>
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ringY, 0]}>
          <torusGeometry args={[ringRadius, 0.022, 8, 72]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.92} />
        </mesh>
      )}
      <Html position={labelPosition} center distanceFactor={9} zIndexRange={[20, 0]}>
        <span
          style={{
            pointerEvents: "none",
            display: "inline-block",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: "9px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "4px 8px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
            background: "rgba(6, 13, 26, 0.78)",
            border: `1px solid ${selected ? BLUE : "rgba(145,183,165,0.28)"}`,
            color: selected ? "#ffffff" : "rgba(201,214,226,0.85)",
          }}
        >
          {short}
        </span>
      </Html>
    </group>
  );
}

function BeaconRings({
  reducedMotion,
  position,
}: {
  reducedMotion: boolean;
  position: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (reducedMotion || !group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const p = (t * 0.35 + i * 0.33) % 1;
      mesh.scale.setScalar(0.55 + p * 1.5);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - p) * 0.5;
    });
  });

  return (
    <group ref={group} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[0.34, 0.008, 6, 48]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  idMap,
  shortFor,
  selectedId,
  onSelect,
  activeStage,
  reducedMotion,
}: {
  idMap: IdMap;
  shortFor: (id: string | null) => string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeStage: string | null | undefined;
  reducedMotion: boolean;
}) {
  const isSelected = (id: string | null) => id !== null && selectedId === id;
  const isPulsing = (id: string | null) => id !== null && activeStage === id;

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 12, 28]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={[SILVER, BG_DEEP, 0.6]} />
      <directionalLight position={[6, 10, 7]} intensity={1.1} color={SILVER_LIGHT} castShadow />
      <pointLight position={[0, 5.5, 4.5]} intensity={22} distance={17} color={BLUE} />
      <pointLight position={[-5, 3.5, 3]} intensity={12} distance={15} color={BLUE} />

      <group rotation={[0, -0.38, 0]} position={[0, -0.55, 0]}>
        {/* rooftop slab + pad */}
        <mesh position={[0, -0.14, 0]} receiveShadow castShadow>
          <boxGeometry args={[12, 0.28, 8]} />
          <meshStandardMaterial color={PAD} roughness={0.9} metalness={0.12} />
        </mesh>
        <mesh position={[0.3, 0.06, 1.7]} receiveShadow>
          <boxGeometry args={[10, 0.12, 2.1]} />
          <meshStandardMaterial color={DARK} roughness={0.85} metalness={0.16} />
        </mesh>

        {/* mast structure (non-selectable) */}
        <mesh position={[-1.8, 3, -0.8]} castShadow>
          <cylinderGeometry args={[0.09, 0.18, 6, 16]} />
          <meshStandardMaterial color={SILVER} roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[-1.8, 6.35, -0.8]} castShadow>
          <cylinderGeometry args={[0.03, 0.09, 0.8, 10]} />
          <meshStandardMaterial color={SILVER} roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[-1.8, 0.06, -0.8]} receiveShadow castShadow>
          <boxGeometry args={[0.75, 0.12, 0.75]} />
          <meshStandardMaterial color={STEEL} roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[-1.8, 4.7, -0.8]} castShadow>
          <boxGeometry args={[1.5, 0.08, 0.08]} />
          <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.65} />
        </mesh>
        <mesh position={[-1.8, 3.9, -0.8]} castShadow>
          <boxGeometry args={[1.2, 0.08, 0.08]} />
          <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.65} />
        </mesh>
        {/* cable tray from mast to pad */}
        <mesh position={[-0.6, 0.15, 0.35]} receiveShadow>
          <boxGeometry args={[3.4, 0.05, 0.16]} />
          <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.5} />
        </mesh>
        {/* backhaul fiber conduit */}
        <mesh position={[4.6, 0.09, 1.7]} receiveShadow>
          <boxGeometry args={[2.1, 0.07, 0.2]} />
          <meshStandardMaterial color={DARK} roughness={0.6} metalness={0.4} />
        </mesh>

        {/* antenna: 3 panels */}
        {idMap.antenna && (
          <SelectableGroup
            id={idMap.antenna}
            short={shortFor(idMap.antenna)}
            position={[-1.8, 4.75, -0.8]}
            onSelect={onSelect}
            selected={isSelected(idMap.antenna)}
            pulsing={isPulsing(idMap.antenna)}
            reducedMotion={reducedMotion}
            ringRadius={0.66}
            ringY={0}
            labelPosition={[0, 0.95, 0]}
          >
            {[0, 1, 2].map((index) => {
              const angle = (index / 3) * Math.PI * 2;
              return (
                <group
                  key={index}
                  position={[Math.cos(angle) * 0.34, 0, Math.sin(angle) * 0.34]}
                  rotation={[0, -angle + Math.PI / 2, 0]}
                >
                  <mesh castShadow>
                    <boxGeometry args={[0.52, 1.15, 0.14]} />
                    <meshStandardMaterial
                      color={SILVER_LIGHT}
                      roughness={0.35}
                      metalness={0.55}
                      emissive={BLUE}
                      emissiveIntensity={0.07}
                    />
                  </mesh>
                  <mesh position={[0, 0, 0.082]}>
                    <boxGeometry args={[0.36, 0.85, 0.016]} />
                    <meshBasicMaterial color={BLUE} transparent opacity={0.5} />
                  </mesh>
                </group>
              );
            })}
          </SelectableGroup>
        )}

        {/* beacon */}
        <mesh position={[-1.8, 6.78, -0.8]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color={BLUE} />
        </mesh>
        <BeaconRings reducedMotion={reducedMotion} position={[-1.8, 6.78, -0.8]} />

        {/* RF unit */}
        {idMap.rf && (
          <SelectableGroup
            id={idMap.rf}
            short={shortFor(idMap.rf)}
            position={[-1.38, 2.8, -0.8]}
            onSelect={onSelect}
            selected={isSelected(idMap.rf)}
            pulsing={isPulsing(idMap.rf)}
            reducedMotion={reducedMotion}
            ringRadius={0.52}
            ringY={0}
            labelPosition={[0, 0.62, 0]}
          >
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.8, 0.55]} />
              <meshStandardMaterial
                color={SILVER}
                roughness={0.4}
                metalness={0.6}
                emissive={BLUE}
                emissiveIntensity={0.07}
              />
            </mesh>
            <mesh position={[0, -0.18, 0.29]}>
              <boxGeometry args={[0.28, 0.06, 0.02]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.65} />
            </mesh>
          </SelectableGroup>
        )}

        {/* baseband cabinet */}
        {idMap.baseband && (
          <SelectableGroup
            id={idMap.baseband}
            short={shortFor(idMap.baseband)}
            position={[-3.5, 0.98, 1.7]}
            onSelect={onSelect}
            selected={isSelected(idMap.baseband)}
            pulsing={isPulsing(idMap.baseband)}
            reducedMotion={reducedMotion}
            ringRadius={0.78}
            ringY={-0.8}
            labelPosition={[0, 1.12, 0]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.1, 1.74, 0.8]} />
              <meshStandardMaterial
                color={SILVER}
                roughness={0.42}
                metalness={0.55}
                emissive={BLUE}
                emissiveIntensity={0.07}
              />
            </mesh>
            <mesh position={[0, 0.28, 0.41]}>
              <boxGeometry args={[0.8, 0.07, 0.02]} />
              <meshStandardMaterial color={DARK} roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.12, 0.41]}>
              <boxGeometry args={[0.8, 0.07, 0.02]} />
              <meshStandardMaterial color={DARK} roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.7, 0.41]}>
              <boxGeometry args={[0.6, 0.04, 0.02]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.7} />
            </mesh>
          </SelectableGroup>
        )}

        {/* scheduler node */}
        {idMap.scheduler && (
          <SelectableGroup
            id={idMap.scheduler}
            short={shortFor(idMap.scheduler)}
            position={[-2.15, 0.77, 1.7]}
            onSelect={onSelect}
            selected={isSelected(idMap.scheduler)}
            pulsing={isPulsing(idMap.scheduler)}
            reducedMotion={reducedMotion}
            ringRadius={0.6}
            ringY={-0.6}
            labelPosition={[0, 0.92, 0]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.72, 1.3, 0.6]} />
              <meshStandardMaterial
                color={SILVER}
                roughness={0.42}
                metalness={0.55}
                emissive={BLUE}
                emissiveIntensity={0.07}
              />
            </mesh>
            <mesh position={[0, 0.42, 0.31]}>
              <boxGeometry args={[0.08, 0.7, 0.02]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.75} />
            </mesh>
            <mesh position={[0, 0.68, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.28, 10]} />
              <meshBasicMaterial color={BLUE} />
            </mesh>
          </SelectableGroup>
        )}

        {/* network equipment rack (DU/CU) */}
        {idMap.network && (
          <SelectableGroup
            id={idMap.network}
            short={shortFor(idMap.network)}
            position={[-0.7, 1.1, 1.7]}
            onSelect={onSelect}
            selected={isSelected(idMap.network)}
            pulsing={isPulsing(idMap.network)}
            reducedMotion={reducedMotion}
            ringRadius={0.72}
            ringY={-0.92}
            labelPosition={[0, 1.24, 0]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.0, 1.96, 0.8]} />
              <meshStandardMaterial
                color={SILVER}
                roughness={0.42}
                metalness={0.55}
                emissive={BLUE}
                emissiveIntensity={0.07}
              />
            </mesh>
            <mesh position={[0, 0.4, 0.41]}>
              <boxGeometry args={[0.74, 0.05, 0.02]} />
              <meshStandardMaterial color={DARK} roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.1, 0.41]}>
              <boxGeometry args={[0.74, 0.05, 0.02]} />
              <meshStandardMaterial color={DARK} roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.82, 0.41]}>
              <boxGeometry args={[0.5, 0.04, 0.02]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.65} />
            </mesh>
          </SelectableGroup>
        )}

        {/* backhaul cabinet */}
        {idMap.backhaul && (
          <SelectableGroup
            id={idMap.backhaul}
            short={shortFor(idMap.backhaul)}
            position={[0.85, 0.88, 1.7]}
            onSelect={onSelect}
            selected={isSelected(idMap.backhaul)}
            pulsing={isPulsing(idMap.backhaul)}
            reducedMotion={reducedMotion}
            ringRadius={0.68}
            ringY={-0.68}
            labelPosition={[0, 1.02, 0]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.0, 1.52, 0.7]} />
              <meshStandardMaterial
                color={SILVER}
                roughness={0.42}
                metalness={0.55}
                emissive={BLUE}
                emissiveIntensity={0.07}
              />
            </mesh>
            <mesh position={[-0.2, 0.05, 0.36]}>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.18, 0.05, 0.36]}>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 0.5, 0.36]}>
              <boxGeometry args={[0.6, 0.04, 0.02]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.6} />
            </mesh>
          </SelectableGroup>
        )}

        {/* power supply + battery */}
        {idMap.power && (
          <SelectableGroup
            id={idMap.power}
            short={shortFor(idMap.power)}
            position={[2.35, 0.68, 1.7]}
            onSelect={onSelect}
            selected={isSelected(idMap.power)}
            pulsing={isPulsing(idMap.power)}
            reducedMotion={reducedMotion}
            ringRadius={0.9}
            ringY={-0.5}
            labelPosition={[0, 0.92, 0]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.0, 1.12, 0.7]} />
              <meshStandardMaterial
                color={SILVER}
                roughness={0.42}
                metalness={0.55}
                emissive={BLUE}
                emissiveIntensity={0.07}
              />
            </mesh>
            <mesh position={[0, 0.32, 0.36]}>
              <boxGeometry args={[0.62, 0.04, 0.02]} />
              <meshBasicMaterial color={BLUE} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.98, -0.12, 0]} castShadow>
              <cylinderGeometry args={[0.27, 0.27, 0.88, 20]} />
              <meshStandardMaterial
                color={SILVER_LIGHT}
                roughness={0.38}
                metalness={0.6}
                emissive={BLUE}
                emissiveIntensity={0.07}
              />
            </mesh>
          </SelectableGroup>
        )}
      </group>

      <OrbitControls
        enablePan={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.52}
        target={[0, 2.2, 0.4]}
      />
    </>
  );
}

export default function BaseStation3D({
  components,
  selectedId,
  onSelect,
  activeStage,
}: BaseStation3DProps) {
  const [webgl] = useState(supportsWebGL);
  const reducedMotion = usePrefersReducedMotion();
  const idMap = useMemo(() => buildIdMap(components), [components]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, webgl);

  const shortFor = (id: string | null): string => {
    if (!id) return "";
    return components.find((c) => c.id === id)?.short ?? id;
  };

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden rounded-2xl border bg-[#102A26]"
      style={{ borderColor: "rgba(145,183,165,0.22)" }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-2.5"
        style={{ borderColor: "rgba(145,183,165,0.14)" }}
      >
        <span
          className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em]"
          style={{ color: "rgba(201,214,226,0.65)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: BLUE, boxShadow: `0 0 8px ${BLUE}` }}
          />
          Interactive 3D
        </span>
        <span
          className="hidden font-mono text-[9px] uppercase tracking-[0.12em] sm:block"
          style={{ color: "rgba(145,183,165,0.45)" }}
        >
          Drag to orbit · Scroll to zoom · Click part to select
        </span>
      </div>

      <div className="relative h-[420px] w-full sm:h-[470px]">
        {webgl ? (
          <Canvas
            dpr={[1, 1.5]}
            shadows
            frameloop={inView ? "always" : "never"}
            camera={{ position: [7.6, 5.2, 9.6], fov: 38, near: 0.1, far: 50 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => gl.setClearColor(BG)}
          >
            <Suspense fallback={null}>
              <Scene
                idMap={idMap}
                shortFor={shortFor}
                selectedId={selectedId}
                onSelect={onSelect}
                activeStage={activeStage}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </Canvas>
        ) : (
          <div
            role="status"
            className="flex h-full flex-col items-center justify-center px-6 text-center"
            style={{ background: BG_DEEP }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: BLUE }}>
              3D view unavailable
            </p>
            <p className="mt-3 max-w-md text-[12px] leading-6" style={{ color: "rgba(201,214,226,0.7)" }}>
              WebGL is not detected on this device. Select a subsystem from the list below to continue
              the walkthrough.
            </p>
          </div>
        )}
      </div>

      <div
        className="border-t px-4 py-4"
        style={{ borderColor: "rgba(145,183,165,0.14)", background: "rgba(6,13,26,0.55)" }}
      >
        <p
          className="font-mono text-[8px] uppercase tracking-[0.14em]"
          style={{ color: "rgba(145,183,165,0.5)" }}
        >
          Site legend — click to select
        </p>
        {components.length === 0 ? (
          <p className="mt-3 text-[11px]" style={{ color: "rgba(201,214,226,0.6)" }}>
            No components provided.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {components.map((c, index) => {
              const selected = selectedId === c.id;
              const active = activeStage === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-pressed={selected}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
                    reducedMotion ? "" : "hover:border-[rgba(145,183,165,0.6)]"
                  }`}
                  style={{
                    borderColor: selected ? BLUE : "rgba(145,183,165,0.22)",
                    background: selected ? "rgba(145,183,165,0.12)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <span
                    className="font-mono text-[9px] tabular-nums"
                    style={{ color: selected ? BLUE : "rgba(145,183,165,0.55)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="rounded-md px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
                    style={{
                      background: selected ? BLUE : "rgba(145,183,165,0.12)",
                      color: selected ? "#06101c" : "rgba(201,214,226,0.8)",
                    }}
                  >
                    {c.short}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-[11px] font-medium"
                    style={{ color: selected ? "#ffffff" : "rgba(201,214,226,0.75)" }}
                  >
                    {c.label}
                  </span>
                  {active && (
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${reducedMotion ? "" : "animate-pulse"}`}
                      style={{ background: BLUE }}
                      aria-label="In packet path"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
