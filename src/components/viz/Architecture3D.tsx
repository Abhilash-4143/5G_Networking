import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  architectureComponents,
  architectureConnections,
  architectureLayers,
  getComponent,
  type ArchitectureComponent,
} from "@/data/architecture";
import { Panel } from "@/components/ui/Panel";
import { useInView } from "@/lib/visibility";

const BLUE = "#91B7A5";
const NODE = "#B8CCBE";
const NODE_LIGHT = "#DCE9DC";
const BG = "#102A26";
const GROUND = "#0B211E";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
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

const Z_BY_LAYER: Record<string, number> = {
  ue: 2.0,
  ran: 0.7,
  transport: -0.5,
  core: -1.3,
  service: -2.0,
};

function positionFor(component: ArchitectureComponent): [number, number, number] {
  const cx = component.x + component.width / 2;
  const cy = component.y + component.height / 2;
  const x = (cx - 510) / 95;
  const y = (350 - cy) / 105;
  const z = Z_BY_LAYER[component.layer] ?? 0;
  return [x, y, z];
}

function NodeBody({
  id,
  selected,
  hovered,
}: {
  id: string;
  selected: boolean;
  hovered: boolean;
}) {
  const emissive = selected ? BLUE : hovered ? "#2a4a6b" : "#0b2036";
  const emissiveIntensity = selected ? 0.85 : hovered ? 0.35 : 0.15;
  const metal = 0.55;
  const rough = 0.38;

  if (id === "ue") {
    return (
      <group>
        <RoundedBox args={[0.56, 0.92, 0.14]} radius={0.07} smoothness={3} castShadow>
          <meshStandardMaterial
            color={NODE_LIGHT}
            roughness={rough}
            metalness={metal}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </RoundedBox>
        <mesh position={[0, 0.06, 0.085]}>
          <planeGeometry args={[0.44, 0.72]} />
          <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.42 : 0.22} />
        </mesh>
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[0.78, 0.014, 8, 60]} />
          <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.85 : 0.35} />
        </mesh>
      </group>
    );
  }

  if (id === "gnb") {
    return (
      <group>
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.13, 1.05, 12]} />
          <meshStandardMaterial
            color={NODE}
            roughness={rough}
            metalness={metal}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        <group position={[0, 0.52, 0]}>
          <RoundedBox args={[0.62, 0.52, 0.2]} radius={0.05} smoothness={3} castShadow>
            <meshStandardMaterial
              color={NODE_LIGHT}
              roughness={rough}
              metalness={metal}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
            />
          </RoundedBox>
        </group>
        <mesh position={[0, 0.52, 0.115]}>
          <planeGeometry args={[0.5, 0.4]} />
          <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.5 : 0.28} />
        </mesh>
      </group>
    );
  }

  if (id === "backhaul") {
    return (
      <group>
        <RoundedBox args={[0.84, 0.44, 0.56]} radius={0.06} smoothness={3} castShadow>
          <meshStandardMaterial
            color={NODE}
            roughness={rough}
            metalness={metal}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </RoundedBox>
        <mesh position={[0.22, 0.32, 0]} castShadow>
          <boxGeometry args={[0.05, 0.34, 0.05]} />
          <meshStandardMaterial color={NODE_LIGHT} roughness={rough} metalness={metal} />
        </mesh>
        <mesh position={[0.22, 0.52, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={BLUE} />
        </mesh>
        <mesh position={[-0.12, 0, 0.29]}>
          <boxGeometry args={[0.5, 0.06, 0.01]} />
          <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.7 : 0.4} />
        </mesh>
      </group>
    );
  }

  if (id === "messaging") {
    return (
      <group>
        <RoundedBox args={[0.72, 0.56, 0.56]} radius={0.06} smoothness={3} castShadow>
          <meshStandardMaterial
            color={NODE}
            roughness={rough}
            metalness={metal}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </RoundedBox>
        <mesh position={[0, 0.44, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={NODE_LIGHT} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.12, 0.29]}>
          <planeGeometry args={[0.44, 0.28]} />
          <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.45 : 0.25} />
        </mesh>
      </group>
    );
  }

  if (id === "edge") {
    return (
      <group>
        <RoundedBox args={[0.72, 0.56, 0.56]} radius={0.06} smoothness={3} castShadow>
          <meshStandardMaterial
            color={NODE}
            roughness={rough}
            metalness={metal}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </RoundedBox>
        <group position={[0, 0.4, 0]}>
          <RoundedBox args={[0.3, 0.24, 0.3]} radius={0.04} smoothness={2} castShadow>
            <meshStandardMaterial color={NODE_LIGHT} roughness={0.32} metalness={0.6} />
          </RoundedBox>
        </group>
        <mesh position={[0, 0, 0.29]}>
          <planeGeometry args={[0.44, 0.06]} />
          <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.7 : 0.4} />
        </mesh>
      </group>
    );
  }

  // Core server racks: amf, udm, upf
  return (
    <group>
      <RoundedBox args={[0.68, 0.64, 0.6]} radius={0.05} smoothness={3} castShadow>
        <meshStandardMaterial
          color={NODE}
          roughness={rough}
          metalness={metal}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </RoundedBox>
      <mesh position={[0, 0.18, 0.31]}>
        <boxGeometry args={[0.54, 0.06, 0.01]} />
        <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.85 : 0.5} />
      </mesh>
      <mesh position={[0, -0.02, 0.31]}>
        <boxGeometry args={[0.54, 0.06, 0.01]} />
        <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.6 : 0.32} />
      </mesh>
    </group>
  );
}

function NodeGroup({
  component,
  position,
  selected,
  onSelect,
}: {
  component: ArchitectureComponent;
  position: [number, number, number];
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(component.id);
  };

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <ringGeometry args={[selected ? 0.62 : 0.56, selected ? 0.68 : 0.6, 48]} />
        <meshBasicMaterial
          color={BLUE}
          transparent
          opacity={selected ? 0.95 : hovered ? 0.55 : 0.28}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.545, 0]}>
        <circleGeometry args={[0.56, 32]} />
        <meshBasicMaterial color={BLUE} transparent opacity={selected ? 0.12 : 0.05} side={THREE.DoubleSide} />
      </mesh>
      <group
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <NodeBody id={component.id} selected={selected} hovered={hovered} />
      </group>
    </group>
  );
}

function Packet({
  curve,
  offset,
  reduced,
}: {
  curve: THREE.QuadraticBezierCurve3;
  offset: number;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (reduced || !ref.current) return;
    const t = (clock.getElapsedTime() * 0.16 + offset) % 1;
    ref.current.position.copy(curve.getPoint(t));
    const material = ref.current.material as THREE.MeshBasicMaterial;
    material.opacity = Math.sin(t * Math.PI) * 0.8 + 0.15;
  });

  if (reduced) {
    const staticPos = curve.getPoint(0.5);
    return (
      <mesh position={staticPos}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.8} />
      </mesh>
    );
  }

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshBasicMaterial color={BLUE} transparent opacity={0.85} />
    </mesh>
  );
}

function Scene({
  selected,
  onSelect,
  reduced,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  reduced: boolean;
}) {
  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    architectureComponents.forEach((component) => {
      map.set(component.id, positionFor(component));
    });
    return map;
  }, []);

  const curves = useMemo(() => {
    return architectureConnections.map((connection) => {
      const from = positions.get(connection.from) ?? [0, 0, 0];
      const to = positions.get(connection.to) ?? [0, 0, 0];
      const start = new THREE.Vector3(from[0], from[1], from[2]);
      const end = new THREE.Vector3(to[0], to[1], to[2]);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.y += 0.55;
      return new THREE.QuadraticBezierCurve3(start, mid, end);
    });
  }, [positions]);

  const layerAnchors = useMemo(() => {
    return architectureLayers.map((layer) => {
      const items = architectureComponents.filter((c) => c.layer === layer.id);
      const avgY = items.reduce((sum, c) => sum + positionFor(c)[1], 0) / Math.max(items.length, 1);
      const avgZ = items.reduce((sum, c) => sum + positionFor(c)[2], 0) / Math.max(items.length, 1);
      return { layer, anchor: [-5.4, avgY, avgZ] as [number, number, number] };
    });
  }, []);

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 12, 26]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={[NODE_LIGHT, GROUND, 0.6]} />
      <directionalLight position={[6, 10, 8]} intensity={1.2} color={NODE_LIGHT} castShadow />
      <pointLight position={[0, 3, 4]} intensity={8} distance={13} color={BLUE} />
      <pointLight position={[-5, 1.5, -4]} intensity={5} distance={11} color={BLUE} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color={GROUND} roughness={0.92} metalness={0.05} />
      </mesh>
      {[3.2, 5.6, 8].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.19, 0]}>
          <ringGeometry args={[radius, radius + 0.015, 96]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <group>
        {architectureConnections.map((connection, index) => (
          <group key={`${connection.from}-${connection.to}`}>
            <Line
              points={curves[index].getPoints(32)}
              color={BLUE}
              lineWidth={1}
              transparent
              opacity={0.42}
              dashed
              dashSize={0.12}
              gapSize={0.09}
            />
            <Packet curve={curves[index]} offset={index * 0.13} reduced={reduced} />
          </group>
        ))}
      </group>

      <group>
        {architectureComponents.map((component) => (
          <NodeGroup
            key={component.id}
            component={component}
            position={positions.get(component.id) ?? [0, 0, 0]}
            selected={selected === component.id}
            onSelect={onSelect}
          />
        ))}
      </group>

      <group>
        {layerAnchors.map(({ layer, anchor }) => (
          <Html key={layer.id} position={anchor} distanceFactor={14} center>
            <div
              className="pointer-events-none select-none whitespace-nowrap text-center"
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.14em",
                color: BLUE,
                opacity: 0.85,
                textTransform: "uppercase",
              }}
            >
              {layer.index} · {layer.label}
            </div>
          </Html>
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={0.35}
        maxPolarAngle={1.25}
        autoRotate={!reduced}
        autoRotateSpeed={0.5}
        target={[0, -0.2, 0]}
      />
    </>
  );
}

function Fallback({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Panel className="bg-[#0B211E] p-6 sm:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[.14em] text-[var(--subtle)]">
        3D unavailable · WebGL not supported
      </p>
      <p className="mt-3 text-[12.5px] leading-6 text-[var(--muted)]">
        The spatial environment needs WebGL. Select a component below to continue exploring the same eight
        network elements — selection stays in sync with the 2D explorer above.
      </p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {architectureComponents.map((component) => {
          const active = selected === component.id;
          return (
            <button
              key={component.id}
              type="button"
              onClick={() => onSelect(component.id)}
              aria-pressed={active}
              className={
                active
                  ? "rounded-lg border border-[#91B7A5]/60 bg-[#91B7A5]/10 px-3 py-2.5 text-left"
                  : "rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5 text-left hover:border-white/25"
              }
            >
              <span className="block font-mono text-[8px] uppercase tracking-[.12em] text-[#91B7A5]">
                {component.code}
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-white">{component.name}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

export default function Architecture3D({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [webgl] = useState(supportsWebGL);
  const reduced = usePrefersReducedMotion();
  const selectedComponent = getComponent(selected ?? "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, webgl);

  if (!webgl) {
    return <Fallback selected={selected} onSelect={onSelect} />;
  }

  return (
    <div ref={wrapRef}>
      <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#102A26] shadow-[0_30px_100px_-40px_rgba(0,0,0,.8)]">
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.15em] text-white/60 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#91B7A5]" />
          5 stages · 8 components
        </div>
        <div className="absolute right-4 top-4 z-10 hidden font-mono text-[8px] uppercase tracking-[.13em] text-white/35 sm:block">
          Drag to orbit · Scroll to zoom
        </div>
        <div className="h-[460px] w-full sm:h-[540px]">
          <Canvas
            dpr={[1, 1.5]}
            shadows
            frameloop={inView ? "always" : "never"}
            camera={{ position: [7.5, 4.5, 10], fov: 35, near: 0.1, far: 60 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => gl.setClearColor(BG)}
          >
            <Suspense
              fallback={
                <Html center>
                  <span className="font-mono text-[9px] uppercase tracking-[.16em] text-white/40">
                    Loading spatial model
                  </span>
                </Html>
              }
            >
              <Scene selected={selected} onSelect={onSelect} reduced={reduced} />
            </Suspense>
          </Canvas>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#102A26] via-[#102A26]/80 to-transparent px-4 pb-4 pt-12 sm:px-5">
          <div className="flex items-end justify-between gap-4">
            <div className="max-w-[360px]">
              <p className="font-mono text-[8px] uppercase tracking-[.15em] text-[#91B7A5]">
                {selectedComponent ? selectedComponent.layerLabel : "Select a node"}
              </p>
              <p className="mt-1 font-display text-[16px] font-medium tracking-[-.02em] text-white">
                {selectedComponent ? selectedComponent.name : "User Equipment → Services"}
              </p>
              <p className="mt-1 hidden text-[10.5px] leading-4 text-white/45 sm:block">
                {selectedComponent
                  ? selectedComponent.summary
                  : "Click any node to sync selection with the explorer above."}
              </p>
            </div>
            <span className="shrink-0 font-mono text-[7.5px] uppercase tracking-[.1em] text-white/25">
              3D / WebGL
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Components">
        {architectureComponents.map((component) => {
          const active = selected === component.id;
          return (
            <button
              key={component.id}
              type="button"
              onClick={() => onSelect(component.id)}
              aria-pressed={active}
              className={
                active
                  ? "rounded-md border border-[#91B7A5]/60 bg-[#91B7A5]/10 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.1em] text-white"
                  : "rounded-md border border-[var(--line)] bg-white/[.02] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.1em] text-[var(--muted)] hover:text-white"
              }
            >
              {component.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
