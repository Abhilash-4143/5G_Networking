export type ComponentLayer = "ue" | "ran" | "transport" | "core" | "service";

export type ArchitectureComponent = {
  id: string;
  name: string;
  code: string;
  layer: ComponentLayer;
  layerLabel: string;
  role: string;
  summary: string;
  technical: string;
  functions: string[];
  inputs: string[];
  outputs: string[];
  hardware: string[];
  software: string[];
  realWorld: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const architectureLayers: {
  id: ComponentLayer;
  index: string;
  label: string;
  description: string;
  color: string;
  bandY: number;
  bandHeight: number;
}[] = [
  {
    id: "ue",
    index: "L1",
    label: "User equipment",
    description: "Devices that originate or consume traffic",
    color: "var(--cyan)",
    bandY: 45,
    bandHeight: 116,
  },
  {
    id: "ran",
    index: "L2",
    label: "Radio access network",
    description: "The radio edge and base station processing",
    color: "var(--blue)",
    bandY: 173,
    bandHeight: 116,
  },
  {
    id: "transport",
    index: "L3",
    label: "Transport",
    description: "Backhaul between radio site and core",
    color: "var(--violet)",
    bandY: 301,
    bandHeight: 116,
  },
  {
    id: "core",
    index: "L4",
    label: "Private core network",
    description: "Authentication, session control, and routing",
    color: "var(--cyan)",
    bandY: 429,
    bandHeight: 116,
  },
  {
    id: "service",
    index: "L5",
    label: "Communication services",
    description: "Applications, edge workloads, and outcomes",
    color: "var(--good)",
    bandY: 557,
    bandHeight: 110,
  },
];

export const architectureComponents: ArchitectureComponent[] = [
  {
    id: "ue",
    name: "User Equipment",
    code: "UE",
    layer: "ue",
    layerLabel: "L1 · User equipment",
    role: "Radio endpoint and traffic source",
    summary: "Phones, sensors, cameras, and other devices that communicate over the radio interface.",
    technical:
      "A UE contains a radio modem, baseband processor, subscriber identity module or secure element, and application processor. It synchronizes to a cell, requests access, authenticates its subscription, and negotiates the radio resources it needs. In a 5G standalone network, the device communicates with the gNB using the NR radio interface.",
    functions: [
      "Originates and consumes user-plane traffic",
      "Performs cell search, synchronization, and random access",
      "Participates in mutual authentication with the network",
      "Adapts modulation, coding, and transmit power to radio conditions",
    ],
    inputs: ["User/application data", "Authentication challenges", "Downlink radio signals", "Scheduling grants"],
    outputs: ["Uplink radio signals", "Authentication responses", "Measurement reports", "Encrypted user traffic"],
    hardware: ["5G NR modem", "RF front end and antennas", "SIM/eSIM/iSIM", "Application processor and battery"],
    software: ["Protocol stack", "Radio resource control", "Operating system and applications", "Subscription/identity software"],
    realWorld:
      "A smartphone, industrial sensor, connected vehicle, or handheld radio in a remote site. In the project concept, compatible devices authorized for the independent network would operate as UEs.",
    x: 425,
    y: 72,
    width: 190,
    height: 64,
  },
  {
    id: "gnb",
    name: "5G Base Station",
    code: "gNB",
    layer: "ran",
    layerLabel: "L2 · Radio access network",
    role: "Radio-to-IP translation and scheduling",
    summary: "The radio site that connects user equipment to the transport network.",
    technical:
      "The gNB terminates the 5G NR radio interface and connects to the core through the N2 control and N3 user-plane interfaces. It schedules radio resources in both time and frequency, selects modulation and coding, manages handovers, and applies radio-level security. Modern distributed architectures may split the radio unit (RU), distributed unit (DU), and centralized unit (CU).",
    functions: [
      "Transmit and receive radio signals",
      "Schedule uplink and downlink resources",
      "Adapt modulation and coding to channel quality",
      "Manage mobility, beamforming, and cell configuration",
      "Forward subscriber traffic toward the core",
    ],
    inputs: ["Radio signals from UEs", "Power and timing reference", "Core control signaling", "Site configuration and policy"],
    outputs: ["Downlink radio signals", "IP transport traffic", "Scheduling information", "Measurement and fault telemetry"],
    hardware: ["Antenna panels or arrays", "Remote radio unit / active antenna unit", "Baseband unit or DU/CU", "Backhaul interface", "Power and cooling"],
    software: ["3GPP NR protocol stack", "MAC scheduler", "Radio resource management", "Fault and performance monitoring"],
    realWorld:
      "Macro sites, rooftop small cells, and private industrial sites. The project concept uses an independently managed base station to provide local coverage where public infrastructure is not dependable.",
    x: 425,
    y: 200,
    width: 190,
    height: 64,
  },
  {
    id: "backhaul",
    name: "Backhaul Transport",
    code: "TRANSPORT",
    layer: "transport",
    layerLabel: "L3 · Transport",
    role: "Connects the radio site to the core",
    summary: "Carries aggregated control and user traffic between the RAN and the private core.",
    technical:
      "Backhaul provides IP connectivity from the radio site to the core network. It may be implemented with leased fiber, private fiber, licensed microwave, or satellite transmission. Capacity, latency, jitter, and availability are part of the design envelope; the transport must also be segmented and secured so the radio site can be trusted by the core.",
    functions: [
      "Forward user-plane packets between gNB and UPF",
      "Carry control-plane signaling between gNB and AMF",
      "Provide deterministic capacity and resilience",
      "Support priority treatment for emergency and control traffic",
    ],
    inputs: ["IP packets from the radio site", "Core-routed downlink packets", "Site management traffic", "Timing/synchronization"],
    outputs: ["Packet delivery to core functions", "Packet delivery to radio site", "Telemetry to operations systems", "Synchronization reference"],
    hardware: ["Fiber or microwave links", "Access/aggregation routers", "Optical transceivers", "Redundant power and cabinet"],
    software: ["IP routing and QoS", "Network segmentation", "Tunnel/encryption management", "Link monitoring"],
    realWorld:
      "A remote private site might use microwave or satellite when fiber is unavailable. These options have different latency, capacity, and weather considerations that must be explicit in the design.",
    x: 425,
    y: 328,
    width: 190,
    height: 64,
  },
  {
    id: "amf",
    name: "Access & Mobility Function",
    code: "AMF",
    layer: "core",
    layerLabel: "L4 · Private core",
    role: "Control-plane access and mobility",
    summary: "Terminates control-plane signaling and manages device registration and mobility.",
    technical:
      "The AMF is the control-plane entry point for the UE. It handles registration, connection management, mobility, and access authentication coordination. It selects the appropriate SMF for a session and forwards NAS signaling. In a private deployment, the AMF may be a compact software function running on local infrastructure.",
    functions: [
      "Handle device registration and deregistration",
      "Coordinate authentication with the security functions",
      "Manage connection and reachability state",
      "Select the appropriate session management function",
    ],
    inputs: ["N2 signaling from the gNB", "Subscription and policy context", "Authentication results", "Mobility events"],
    outputs: ["N1/N2 signaling responses", "SMF selection and session requests", "Policy and charging records", "Access telemetry"],
    hardware: ["Private core compute node", "Redundant network interfaces", "Protected storage for configuration"],
    software: ["NAS signaling stack", "Registration/state machine", "Interface with UDM/AUSF", "Policy integration"],
    realWorld:
      "A local 5G core can keep essential control functions close to a private site. Its deployment still requires careful security hardening, monitoring, power continuity, and lawful radio operation.",
    x: 95,
    y: 456,
    width: 190,
    height: 64,
  },
  {
    id: "udm",
    name: "Identity & Authentication",
    code: "UDM / AUSF",
    layer: "core",
    layerLabel: "L4 · Private core",
    role: "Subscriber credentials and authentication",
    summary: "Verifies a device's protected identity before granting access to the network.",
    technical:
      "The AUSF and UDM coordinate 5G authentication. They use the subscriber's long-term secret and a fresh challenge to derive authentication vectors without sending the secret over the air. SUCI concealment can protect the permanent subscriber identifier. Access is granted only after keys and authorizations are established.",
    functions: [
      "Store or retrieve subscription authentication data",
      "Issue a fresh authentication challenge",
      "Derive and confirm session keys",
      "Provide authorization and slice-access context",
    ],
    inputs: ["Authentication request from AMF", "Protected subscriber identifier", "Device authentication response", "Subscription profile"],
    outputs: ["Authentication vectors", "Authentication result", "Subscription context", "Security keys"],
    hardware: ["Hardened core compute", "Encrypted storage or secure module", "Audited backup infrastructure"],
    software: ["AUSF/UDM functions", "Key derivation and storage", "Subscriber profile management", "Audit logging"],
    realWorld:
      "In a private network, identity management governs who may attach. The project concept emphasizes authorized devices and controlled access rather than open public access.",
    x: 415,
    y: 456,
    width: 190,
    height: 64,
  },
  {
    id: "upf",
    name: "User Plane Function",
    code: "UPF",
    layer: "core",
    layerLabel: "L4 · Private core",
    role: "Packet routing and policy enforcement",
    summary: "Moves user data between the radio network and local or external services.",
    technical:
      "The UPF anchors the data session and forwards packets according to policy. It applies quality-of-service marking, usage accounting, and packet detection rules. A local UPF can keep traffic on-site for edge workloads or route selected traffic toward an external network, subject to authorization.",
    functions: [
      "Forward uplink and downlink packets",
      "Apply session and QoS policy",
      "Support local traffic breakout to edge services",
      "Provide usage and delivery telemetry",
    ],
    inputs: ["N3 user traffic from the gNB", "Session rules from the SMF", "Application/service destination routes", "Policy instructions"],
    outputs: ["Traffic to local services", "Traffic to external data networks", "Usage records", "Packet and latency telemetry"],
    hardware: ["High-throughput core compute", "Redundant network interfaces", "Encrypted/segmented storage", "Backup power"],
    software: ["Packet forwarding pipeline", "QoS and policy rules", "Session anchoring", "Traffic metrics and logging"],
    realWorld:
      "A private campus or village core may route messages locally without traversing a distant public cloud, while still requiring clear authorization and security boundaries.",
    x: 735,
    y: 456,
    width: 190,
    height: 64,
  },
  {
    id: "messaging",
    name: "Messaging Server",
    code: "SERVICE",
    layer: "service",
    layerLabel: "L5 · Communication services",
    role: "Application-level message delivery",
    summary: "Processes, stores, and routes messages between authorized users.",
    technical:
      "The messaging service operates above the transport network. It handles message submission, queueing, delivery status, and optionally store-and-forward behavior when a recipient is temporarily unavailable. End-to-end or application-layer protection can limit exposure even if transport security is terminated elsewhere.",
    functions: [
      "Accept and validate message requests",
      "Store messages for offline recipients",
      "Deliver messages to the recipient's device",
      "Return delivery status to the sender",
    ],
    inputs: ["Authenticated message request", "Recipient state", "Transport delivery events", "Application policy"],
    outputs: ["Message to recipient", "Delivery receipts", "Audit and error events", "Service-level metrics"],
    hardware: ["Application server or local compute node", "Durable storage", "Redundant network interfaces", "Backup power"],
    software: ["Message queue/service", "User/session authorization", "Persistence and retry logic", "Audit logging"],
    realWorld:
      "In the simulation, the messaging server is a synthetic application. In a real private deployment, it could support local messaging, coordination, or emergency information exchange within authorized policy.",
    x: 245,
    y: 582,
    width: 190,
    height: 60,
  },
  {
    id: "edge",
    name: "Edge Application",
    code: "EDGE",
    layer: "service",
    layerLabel: "L5 · Communication services",
    role: "Local compute for responsive services",
    summary: "Processes data close to the radio site to reduce transport distance and delay.",
    technical:
      "An edge application runs on compute near the network edge. It can process video, sensor data, or coordination workloads locally before forwarding only the necessary results. Real deployments must consider physical security, power, thermal limits, software updates, and data governance.",
    functions: [
      "Process time-sensitive local workloads",
      "Filter or aggregate data before backhaul",
      "Support disconnected or degraded operation modes",
      "Provide local service availability during backhaul disruption",
    ],
    inputs: ["Local user/service traffic", "Sensor or video feeds", "Network context and policy", "Software updates"],
    outputs: ["Local service responses", "Aggregated data to remote systems", "Operational telemetry", "Local audit records"],
    hardware: ["Edge compute node", "Local storage", "Cooling and power protection", "Physical security enclosure"],
    software: ["Container/runtime environment", "Workload orchestration", "Local security policy", "Monitoring agent"],
    realWorld:
      "A village or campus could use edge compute for local records, environmental monitoring, or emergency coordination, but only with trained operators and support processes.",
    x: 585,
    y: 582,
    width: 190,
    height: 60,
  },
];

export type ArchitectureConnection = {
  from: string;
  to: string;
  label: string;
  type: "user" | "control";
  path: string;
};

export const architectureConnections: ArchitectureConnection[] = [
  { from: "ue", to: "gnb", label: "NR radio", type: "user", path: "M520 136 L520 200" },
  { from: "gnb", to: "backhaul", label: "Site transport", type: "user", path: "M520 264 L520 328" },
  {
    from: "backhaul",
    to: "upf",
    label: "N3 / user data",
    type: "user",
    path: "M520 360 L520 388 L830 388 L830 456",
  },
  {
    from: "gnb",
    to: "amf",
    label: "N2 / control",
    type: "control",
    path: "M425 224 L195 224 L195 456",
  },
  { from: "amf", to: "udm", label: "N8 / auth", type: "control", path: "M285 488 L415 488" },
  { from: "udm", to: "upf", label: "Session control", type: "control", path: "M605 488 L735 488" },
  {
    from: "upf",
    to: "messaging",
    label: "Service route",
    type: "user",
    path: "M830 520 L830 540 L340 540 L340 582",
  },
  {
    from: "upf",
    to: "edge",
    label: "Local breakout",
    type: "user",
    path: "M830 520 L830 532 L680 532 L680 582",
  },
];

export function getComponent(id: string) {
  return architectureComponents.find((component) => component.id === id);
}

export function getConnectionsFor(id: string | null) {
  if (!id) return architectureConnections;
  return architectureConnections.filter((connection) => connection.from === id || connection.to === id);
}
