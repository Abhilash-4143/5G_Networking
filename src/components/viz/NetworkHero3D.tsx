import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ArrowUpRight, Box, MousePointer2, RadioTower, Smartphone, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/lib/visibility";

const PALETTE = {
  bg: "#0B211E",
  navy: "#102A26",
  navySoft: "#12253A",
  navyMid: "#162E47",
  steel: "#B8CCBE",
  silver: "#DCE9DC",
  ice: "#EAF2FA",
  white: "#EFF5EC",
  electric: "#91B7A5",
  blue: "#477B6C",
  green: "#7FB896",
};

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
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

function Tower() {
  const beacon = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (beacon.current) {
      const material = beacon.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.55 + Math.sin(time * 2.2) * 0.35;
    }
    if (rings.current) {
      rings.current.rotation.y = time * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[1.55, 1.72, 0.16, 64]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.42} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[1.12, 1.3, 0.08, 64]} />
        <meshStandardMaterial color={PALETTE.navySoft} roughness={0.36} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <torusGeometry args={[1.17, 0.012, 8, 96]} />
        <meshBasicMaterial color={PALETTE.electric} transparent opacity={0.3} />
      </mesh>

      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.13, 5, 16]} />
        <meshStandardMaterial color={PALETTE.silver} roughness={0.28} metalness={0.82} />
      </mesh>
      <mesh position={[0, 4.3, 0]}>
        <cylinderGeometry args={[0.17, 0.09, 1.4, 16]} />
        <meshStandardMaterial color={PALETTE.steel} roughness={0.26} metalness={0.78} />
      </mesh>
      {[3.35, 4.55].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.012, 8, 32]} />
          <meshStandardMaterial color={PALETTE.steel} roughness={0.3} metalness={0.75} />
        </mesh>
      ))}

      {[0, 1, 2].map((index) => {
        const angle = (index / 3) * Math.PI * 2;
        return (
          <group key={index} rotation={[0, angle, 0]} position={[0, 4.16, 0]}>
            <RoundedBox args={[0.18, 1.06, 0.46]} radius={0.035} smoothness={3} position={[0.38, 0, 0]} rotation={[0, 0, 0.04]}>
              <meshStandardMaterial color={PALETTE.ice} roughness={0.28} metalness={0.4} />
            </RoundedBox>
            <mesh position={[0.49, 0, 0]}>
              <boxGeometry args={[0.012, 0.82, 0.33]} />
              <meshBasicMaterial color={PALETTE.electric} transparent opacity={0.5} />
            </mesh>
            <mesh position={[0.382, -0.56, 0]}>
              <boxGeometry args={[0.31, 0.05, 0.56]} />
              <meshStandardMaterial color={PALETTE.navyMid} roughness={0.38} metalness={0.62} />
            </mesh>
          </group>
        );
      })}

      <group position={[0, 5.06, 0]}>
        <mesh ref={beacon}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial color={PALETTE.green} transparent opacity={0.9} />
        </mesh>
        <pointLight color={PALETTE.green} intensity={2} distance={4} />
      </group>

      <group ref={rings} position={[0, 3.85, 0]}>
        {[0.9, 1.2, 1.55].map((radius, index) => (
          <mesh key={radius} rotation={[Math.PI / 2 + (index - 1) * 0.05, 0, 0]}>
            <torusGeometry args={[radius, 0.006, 4, 120]} />
            <meshBasicMaterial color={index === 0 ? PALETTE.electric : PALETTE.blue} transparent opacity={0.12 - index * 0.025} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const buildings = [
  { position: [-3.7, 0.45, -2.4], size: [0.75, 0.9, 0.75] },
  { position: [-4.7, 0.6, -1.2], size: [0.6, 1.2, 0.6] },
  { position: [-3.3, 0.32, -4], size: [0.9, 0.65, 0.8] },
  { position: [3.8, 0.5, -2.8], size: [0.8, 1.0, 0.8] },
  { position: [4.8, 0.32, -1.5], size: [0.6, 0.65, 0.55] },
  { position: [3.3, 0.62, -4.2], size: [0.58, 1.25, 0.65] },
  { position: [-2.9, 0.25, 3.7], size: [0.7, 0.5, 0.7] },
  { position: [3.25, 0.4, 3.9], size: [0.85, 0.8, 0.6] },
  { position: [4.4, 0.25, 2.8], size: [0.55, 0.5, 0.55] },
  { position: [-4.6, 0.35, 2.7], size: [0.6, 0.7, 0.52] },
  { position: [2.2, 0.55, -4.8], size: [0.7, 1.1, 0.7] },
  { position: [-2.4, 0.4, -4.9], size: [0.65, 0.8, 0.65] },
  { position: [5.2, 0.55, 1.2], size: [0.5, 1.1, 0.5] },
  { position: [-5.4, 0.45, 0.4], size: [0.55, 0.9, 0.55] },
] satisfies { position: [number, number, number]; size: [number, number, number] }[];

function City() {
  return (
    <group>
      {buildings.map((building, index) => (
        <group key={index} position={building.position}>
          <RoundedBox args={building.size} radius={0.055} smoothness={2} castShadow receiveShadow>
            <meshStandardMaterial
              color={index % 3 === 0 ? PALETTE.navySoft : index % 2 === 0 ? PALETTE.navy : PALETTE.navyMid}
              roughness={0.58}
              metalness={0.34}
            />
          </RoundedBox>
          <mesh position={[0, building.size[1] / 2 + 0.01, 0]}>
            <boxGeometry args={[building.size[0] * 0.55, 0.008, building.size[2] * 0.55]} />
            <meshBasicMaterial color={PALETTE.silver} transparent opacity={0.22} />
          </mesh>
          {[-1, 0, 1].map((slot, wi) => {
            if (wi === 2 && (index + wi) % 2 === 1) return null;
            return (
              <mesh key={wi} position={[slot * building.size[0] * 0.26, building.size[1] * 0.12 - wi * 0.11, building.size[2] / 2 + 0.006]}>
                <planeGeometry args={[0.06, 0.08]} />
                <meshBasicMaterial color={wi === 0 ? PALETTE.ice : PALETTE.electric} transparent opacity={0.52 - wi * 0.07} />
              </mesh>
            );
          })}
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[9, 72]} />
        <meshStandardMaterial color={PALETTE.bg} roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[7.5, 72]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.16} metalness={0.72} />
      </mesh>
      {[3.1, 5.1, 7].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[radius, radius + 0.008, 96]} />
          <meshBasicMaterial color={radius === 7 ? PALETTE.blue : PALETTE.steel} transparent opacity={radius === 7 ? 0.2 : 0.16} />
        </mesh>
      ))}
      <group position={[2.0, 0.015, 2.4]}>
        <mesh>
          <boxGeometry args={[1, 0.012, 0.02]} />
          <meshBasicMaterial color={PALETTE.silver} transparent opacity={0.55} />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.025, 0]}>
            <boxGeometry args={[0.02, 0.06, 0.02]} />
            <meshBasicMaterial color={PALETTE.silver} transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const nodeData = [
  { position: [3.4, 2.4, -0.9], color: "#91B7A5", curveEnd: [3.4, 2.4, -0.9] },
  { position: [-3.65, 2.7, 1.4], color: "#477B6C", curveEnd: [-3.65, 2.7, 1.4] },
  { position: [1.9, 3.5, 3.1], color: "#DCE9DC", curveEnd: [1.9, 3.5, 3.1] },
  { position: [-2.2, 1.6, -3.4], color: "#B8CCBE", curveEnd: [-2.2, 1.6, -3.4] },
] as const;

function Signal({ curve, offset, color }: { curve: THREE.QuadraticBezierCurve3; offset: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.18 + offset) % 1;
    const point = curve.getPoint(t);
    ref.current.position.copy(point);
    const material = ref.current.material as THREE.MeshBasicMaterial;
    material.opacity = Math.sin(t * Math.PI) * 0.9 + 0.1;
    const scale = 0.75 + Math.sin(t * Math.PI) * 0.45;
    ref.current.scale.setScalar(scale);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function NetworkNodes({ reducedMotion }: { reducedMotion: boolean }) {
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const curves = useMemo(
    () =>
      nodeData.map(
        (node) =>
          new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 4.1, 0),
            new THREE.Vector3(node.position[0] * 0.45, node.position[1] + 0.65, node.position[2] * 0.45),
            new THREE.Vector3(node.position[0], node.position[1], node.position[2]),
          ),
      ),
    [],
  );

  useFrame(({ clock }) => {
    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      node.rotation.y = clock.getElapsedTime() * (0.08 + index * 0.012);
    });
  });

  return (
    <group>
      {nodeData.map((node, index) => (
        <group key={index}>
          <Line
            points={curves[index].getPoints(48)}
            color={node.color}
            transparent
            opacity={0.22}
            lineWidth={0.7}
            dashed
            dashSize={0.1}
            gapSize={0.17}
          />
          {!reducedMotion && <Signal curve={curves[index]} offset={index * 0.23} color={node.color} />}
          <group ref={(value) => { nodeRefs.current[index] = value; }} position={node.position}>
            <mesh>
              <sphereGeometry args={[0.12, 20, 20]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
            <mesh rotation={[Math.PI / 2.4, 0, 0]}>
              <torusGeometry args={[0.33, 0.009, 4, 48]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.48} />
            </mesh>
            <mesh rotation={[Math.PI / 1.7, 0.4, 0]}>
              <torusGeometry args={[0.44, 0.006, 4, 48]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.2} />
            </mesh>
            <pointLight color={node.color} intensity={0.7} distance={1.7} />
          </group>
        </group>
      ))}
    </group>
  );
}

function DeviceNodes() {
  return (
    <group>
      {[
        { position: [1.55, 0.48, 1.7], rotation: [0.1, -0.5, 0.12] },
        { position: [-1.8, 0.42, 1.9], rotation: [-0.1, 0.6, -0.1] },
      ].map((device, index) => (
        <group key={index} position={device.position as [number, number, number]} rotation={device.rotation as [number, number, number]}>
          <RoundedBox args={[0.38, 0.72, 0.055]} radius={0.045} smoothness={3}>
            <meshStandardMaterial color={PALETTE.navySoft} metalness={0.55} roughness={0.34} />
          </RoundedBox>
          <mesh position={[0, 0.03, 0.032]}>
            <planeGeometry args={[0.3, 0.57]} />
            <meshBasicMaterial color={PALETTE.electric} transparent opacity={0.2} />
          </mesh>
          <mesh position={[0, 0.41, 0]}>
            <torusGeometry args={[0.13, 0.007, 4, 40]} />
            <meshBasicMaterial color={PALETTE.silver} transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SceneLabels({ compact }: { compact: boolean }) {
  if (compact) return null;
  const chip = {
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
    fontSize: 7,
    letterSpacing: ".12em",
    color: PALETTE.ice,
    background: "rgba(6,13,26,.62)",
    border: "1px solid rgba(145,183,165,.28)",
    padding: "2px 5px",
    borderRadius: 3,
    whiteSpace: "nowrap" as const,
    opacity: 0.85,
  };
  return (
    <group>
      <Html position={[0.55, 5.05, 0]} center distanceFactor={9} occlude={false} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span style={chip}>RADIO SITE · 5G</span>
      </Html>
      <Html position={[0.85, 4.16, 0]} center distanceFactor={9} occlude={false} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span style={chip}>AAU ARRAY</span>
      </Html>
      <Html position={[2.0, 0.22, 2.4]} center distanceFactor={9} occlude={false} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span style={chip}>50 M SCALE</span>
      </Html>
    </group>
  );
}

function Scene({ reducedMotion, compact }: { reducedMotion: boolean; compact: boolean }) {
  return (
    <>
      <color attach="background" args={[PALETTE.bg]} />
      <fog attach="fog" args={[PALETTE.bg, 11, 26]} />
      <ambientLight intensity={0.32} color={PALETTE.steel} />
      <hemisphereLight args={[PALETTE.silver, PALETTE.bg, 0.55]} />
      <directionalLight
        position={[6, 10, 8]}
        intensity={1.05}
        color={PALETTE.ice}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 4, -6]} intensity={0.5} color={PALETTE.blue} />
      <pointLight position={[0, 3.6, 2]} intensity={4} distance={8} color={PALETTE.electric} />
      <pointLight position={[-5, 2.5, 4]} intensity={3} distance={8} color={PALETTE.blue} />
      <group rotation={[0, -0.38, 0]} position={[0, -0.8, 0]} scale={compact ? 0.9 : 1}>
        <City />
        <Tower />
        <NetworkNodes reducedMotion={reducedMotion} />
        <DeviceNodes />
        <SceneLabels compact={compact} />
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={!compact}
        autoRotate={!reducedMotion && !compact}
        autoRotateSpeed={0.28}
        minPolarAngle={Math.PI * 0.29}
        maxPolarAngle={Math.PI * 0.49}
        target={[0, 2.1, 0]}
      />
    </>
  );
}

function StaticFallback() {
  return (
    <div className="relative flex h-full min-h-[380px] w-full items-center justify-center overflow-hidden bg-[#0B211E]">
      <svg viewBox="0 0 640 500" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="fallback-tower" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#EAF2FA" />
            <stop offset="1" stopColor="#3A5A78" />
          </linearGradient>
          <radialGradient id="fallback-glow">
            <stop stopColor="#91B7A5" stopOpacity=".24" />
            <stop offset="1" stopColor="#91B7A5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="320" cy="230" r="210" fill="url(#fallback-glow)" />
        {[70, 135, 205].map((rx, i) => (
          <ellipse key={rx} cx="320" cy="310" rx={rx + 80} ry={(rx + 80) * 0.34} fill="none" stroke="#3A5A78" strokeOpacity={0.35 - i * 0.08} />
        ))}
        <g stroke="#91B7A5" strokeOpacity=".34" strokeDasharray="3 6">
          <path d="M320 190 465 140M320 190 170 155M320 190 470 270M320 190 145 275" fill="none" />
        </g>
        {(
          [
            [465, 140, "#91B7A5"],
            [170, 155, "#477B6C"],
            [470, 270, "#DCE9DC"],
            [145, 275, "#B8CCBE"],
          ] as [number, number, string][]
        ).map(([x, y, color]) => (
          <g key={`${x}${y}`}>
            <circle cx={x} cy={y} r="16" fill={color} fillOpacity=".08" stroke={color} strokeOpacity=".4" />
            <circle cx={x} cy={y} r="4" fill={color} />
          </g>
        ))}
        <g fill="#102A26" stroke="#B8CCBE" strokeOpacity=".35">
          <rect x="78" y="342" width="54" height="80" rx="3" />
          <rect x="150" y="362" width="40" height="60" rx="3" />
          <rect x="468" y="349" width="62" height="73" rx="3" />
          <rect x="548" y="374" width="34" height="48" rx="3" />
        </g>
        <path d="M296 360 280 270h22l9-40h18l9 40h22l-16 90h-31l-5 50h-34l5-50Z" fill="url(#fallback-tower)" />
        <circle cx="320" cy="196" r="5" fill="#7FB896" />
        <g fill="#B8CCBE" fontFamily="monospace" fontSize="8" opacity=".55">
          <text x="70" y="326">EDGE NODE / 04</text>
          <text x="486" y="326">SMART CITY</text>
          <text x="270" y="425">RADIO SITE / 5G NSA</text>
        </g>
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[rgba(145,183,165,.18)] bg-[#0B211E]/80 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[.14em] text-[#B8CCBE]/60">
        Static scene · WebGL unavailable
      </div>
    </div>
  );
}

const hotspots = [
  {
    id: "tower",
    label: "Radio site",
    title: "5G base station",
    description: "Antenna arrays, RF conversion, and baseband processing translate radio signals into a secure transport link.",
    metric: "RAN layer",
    route: "/base-station",
    icon: RadioTower,
    position: "left-[47%] top-[18%]",
  },
  {
    id: "device",
    label: "Device edge",
    title: "Connected devices",
    description: "User equipment negotiates radio resources and maintains a protected identity with the network.",
    metric: "UE layer",
    route: "/security",
    icon: Smartphone,
    position: "left-[18%] top-[58%]",
  },
  {
    id: "edge",
    label: "Edge node",
    title: "Distributed compute",
    description: "Nearby compute can process time-sensitive workloads before traffic travels to the core.",
    metric: "Edge layer",
    route: "/future-network",
    icon: Cpu,
    position: "left-[74%] top-[36%]",
  },
  {
    id: "transport",
    label: "Transport",
    title: "Backhaul path",
    description: "The backhaul carries aggregated traffic between the radio access network and the core.",
    metric: "Transport layer",
    route: "/architecture",
    icon: Box,
    position: "left-[58%] top-[68%]",
  },
] as const;

export function NetworkHero3D() {
  const [webgl] = useState(supportsWebGL);
  const [activeId, setActiveId] = useState<string>("tower");
  const [compact, setCompact] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const reducedMotion = usePrefersReducedMotion();
  const active = hotspots.find((hotspot) => hotspot.id === activeId) ?? hotspots[0];
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, webgl);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const handler = () => setCompact(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[700px]">
      <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_50%_45%,rgba(145,183,165,.14),transparent_65%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[22px] border border-[rgba(145,183,165,.15)] bg-[#0B211E] shadow-[0_40px_120px_-34px_rgba(0,0,0,.9),inset_0_1px_0_rgba(234,242,250,.08)]">
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-md border border-[rgba(145,183,165,.14)] bg-[#0B211E]/60 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.15em] text-[#DCE9DC]/70 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#91B7A5] shadow-[0_0_8px_#91B7A5]" />
            Interactive model
          </span>
          <span className="hidden rounded-md border border-[rgba(145,183,165,.14)] bg-[#0B211E]/60 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.15em] text-[#B8CCBE]/60 backdrop-blur-md sm:inline-flex">
            04 hotspots
          </span>
        </div>
        <div className="absolute right-4 top-4 z-20 hidden items-center gap-1.5 font-mono text-[8px] uppercase tracking-[.13em] text-[#B8CCBE]/55 sm:flex">
          <MousePointer2 className="h-3 w-3" /> Select node
        </div>

        <div className="h-[430px] w-full sm:h-[480px] lg:h-[535px]">
          {webgl ? (
            <Canvas
              dpr={[1, 1.5]}
              shadows
              frameloop={inView ? "always" : "never"}
              camera={{ position: [8.8, 6.2, 11.5], fov: 34, near: 0.1, far: 45 }}
              gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
              onCreated={({ gl }) => gl.setClearColor("#0B211E")}
            >
              <Suspense fallback={<Html center><span className="font-mono text-[9px] uppercase tracking-[.16em] text-[#B8CCBE]/60">Loading spatial model</span></Html>}>
                <Scene reducedMotion={reducedMotion} compact={compact} />
              </Suspense>
            </Canvas>
          ) : (
            <StaticFallback />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          {hotspots.map((hotspot) => {
            const selected = hotspot.id === activeId;
            return (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => setActiveId(hotspot.id)}
                aria-label={`${hotspot.title}. ${hotspot.description}`}
                aria-pressed={selected}
                className={`pointer-events-auto absolute ${hotspot.position} flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border p-1 pr-2 text-left backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B7A5] ${
                  selected
                    ? "border-[#91B7A5]/60 bg-[#102A26]/90 shadow-[0_0_25px_-4px_rgba(145,183,165,.45)]"
                    : "border-[rgba(145,183,165,.18)] bg-[#0B211E]/60 hover:border-[rgba(145,183,165,.38)] hover:bg-[#0B211E]/75"
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full ${selected ? "bg-[#91B7A5] text-[#0B211E]" : "bg-[#B8CCBE]/15 text-[#DCE9DC]/80"}`}>
                  <hotspot.icon className="h-3 w-3" />
                </span>
                <span className={`hidden whitespace-nowrap font-mono text-[7.5px] uppercase tracking-[.12em] sm:block ${selected ? "text-[#EFF5EC]" : "text-[#DCE9DC]/70"}`}>
                  {hotspot.label}
                </span>
                {selected && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-[#0B211E] bg-[#91B7A5]" />}
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0B211E] via-[#0B211E]/80 to-transparent px-4 pb-4 pt-12 sm:px-5">
          <div className="pointer-events-auto flex items-end justify-between gap-4">
            <div className="max-w-[360px]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] uppercase tracking-[.15em] text-[#91B7A5]">{active.metric}</span>
                <span className="h-px w-5 bg-[#B8CCBE]/20" />
              </div>
              <p className="mt-1.5 font-display text-[16px] font-medium tracking-[-.02em] text-[#EFF5EC]">{active.title}</p>
              <p className="mt-1 hidden text-[10.5px] leading-4 text-[#DCE9DC]/60 sm:block">{active.description}</p>
            </div>
            <Link
              to={active.route}
              className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-[rgba(145,183,165,.16)] bg-[#B8CCBE]/[.06] px-2.5 py-2 font-mono text-[8px] uppercase tracking-[.1em] text-[#DCE9DC]/75 transition-colors hover:border-[#91B7A5]/40 hover:text-[#EFF5EC]"
            >
              Open layer
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {hotspots.map((hotspot) => (
              <span
                key={hotspot.id}
                className={`h-[2px] rounded-full transition-all ${hotspot.id === activeId ? "w-7 bg-[#91B7A5]" : "w-3 bg-[#B8CCBE]/20"}`}
              />
            ))}
            <span className="ml-auto font-mono text-[7.5px] uppercase tracking-[.1em] text-[#B8CCBE]/40">
              {webgl ? "WebGL / WebRTC-ready concept" : "2D fallback"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between px-1 font-mono text-[8px] uppercase tracking-[.14em] text-[var(--subtle)]">
        <span>Independent long-range network · concept visualization</span>
        <span className="hidden sm:block">01 / Spatial overview</span>
      </div>
    </div>
  );
}
