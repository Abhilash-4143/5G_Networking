export type RouteDefinition = {
  path: string;
  label: string;
  shortLabel?: string;
  group: "core" | "lab" | "project";
};

export const primaryNav: RouteDefinition[] = [
  { path: "/", label: "Home", group: "core" },
  { path: "/fundamentals", label: "Fundamentals", group: "core" },
  { path: "/architecture", label: "Architecture", group: "core" },
  { path: "/simulator", label: "Simulator", group: "lab" },
  { path: "/performance", label: "Performance", group: "lab" },
  { path: "/security", label: "Security", group: "lab" },
  { path: "/future-network", label: "Future Networks", group: "lab" },
];

export const secondaryNav: RouteDefinition[] = [
  { path: "/base-station", label: "Base Station", group: "lab" },
  { path: "/ai-network", label: "AI Network Ops", group: "lab" },
  { path: "/emergency-network", label: "Emergency Network", group: "lab" },
  { path: "/project", label: "Project", group: "project" },
  { path: "/about", label: "About", group: "project" },
];

export const allNav = [...primaryNav, ...secondaryNav];

export const footerGroups = [
  {
    title: "Explore",
    links: [
      { to: "/fundamentals", label: "Wireless fundamentals" },
      { to: "/architecture", label: "Network architecture" },
      { to: "/simulator", label: "Network simulator" },
      { to: "/performance", label: "4G vs 5G lab" },
    ],
  },
  {
    title: "Systems",
    links: [
      { to: "/base-station", label: "Base station" },
      { to: "/security", label: "Security & identity" },
      { to: "/ai-network", label: "Network operations" },
      { to: "/emergency-network", label: "Emergency network" },
    ],
  },
  {
    title: "Project",
    links: [
      { to: "/future-network", label: "Future networks" },
      { to: "/project", label: "Project demonstration" },
      { to: "/about", label: "About the project" },
    ],
  },
];

export type SearchEntry = {
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
};

export const searchEntries: SearchEntry[] = [
  {
    title: "5G Network Explorer",
    description: "An interactive platform for learning wireless networks and simulating a private 5G path.",
    path: "/",
    category: "Overview",
    keywords: ["home", "5g", "wireless", "network", "explorer"],
  },
  {
    title: "Radio waves",
    description: "Electric and magnetic fields travelling through space — the physical carrier of wireless communication.",
    path: "/fundamentals",
    category: "Fundamentals",
    keywords: ["radio", "wave", "frequency", "wavelength", "electromagnetic"],
  },
  {
    title: "Frequency & wavelength",
    description: "Explore how frequency determines wave cycles, wavelength, and antenna scale.",
    path: "/fundamentals",
    category: "Fundamentals",
    keywords: ["frequency", "wavelength", "hertz", "spectrum", "experiment"],
  },
  {
    title: "Bandwidth & capacity",
    description: "See how channel bandwidth and signal quality influence a simplified capacity estimate.",
    path: "/fundamentals",
    category: "Fundamentals",
    keywords: ["bandwidth", "capacity", "shannon", "throughput", "mhz"],
  },
  {
    title: "Digital modulation",
    description: "Visualise how bits map to symbols using QPSK, 16-QAM, and 64-QAM.",
    path: "/fundamentals",
    category: "Fundamentals",
    keywords: ["modulation", "qam", "qpsk", "symbol", "constellation"],
  },
  {
    title: "Signal propagation",
    description: "Reflection, diffraction, obstruction, and fading in a simplified propagation sandbox.",
    path: "/fundamentals",
    category: "Fundamentals",
    keywords: ["propagation", "reflection", "diffraction", "fading", "path loss"],
  },
  {
    title: "User equipment (UE)",
    description: "Phones, sensors, and other devices that access the network over the radio interface.",
    path: "/architecture",
    category: "Architecture",
    keywords: ["ue", "device", "smartphone", "terminal", "ran"],
  },
  {
    title: "Radio Access Network (RAN)",
    description: "The radio edge of the network, including base stations and antennas.",
    path: "/architecture",
    category: "Architecture",
    keywords: ["ran", "radio", "base station", "gnb", "antenna"],
  },
  {
    title: "Backhaul",
    description: "The transport path that connects radio sites to a core network.",
    path: "/architecture",
    category: "Architecture",
    keywords: ["backhaul", "fiber", "transport", "microwave", "latency"],
  },
  {
    title: "Private core network",
    description: "The control and data functions that authenticate devices and route user traffic.",
    path: "/architecture",
    category: "Architecture",
    keywords: ["core", "amf", "upf", "smf", "authentication", "routing"],
  },
  {
    title: "Network simulator",
    description: "Send a synthetic message end to end and observe each network stage and failure mode.",
    path: "/simulator",
    category: "Simulation",
    keywords: ["simulator", "message", "latency", "packet loss", "failure", "recovery"],
  },
  {
    title: "4G LTE vs 5G",
    description: "Compare architecture, throughput targets, latency, capacity, slicing, and use cases.",
    path: "/performance",
    category: "Performance",
    keywords: ["4g", "lte", "5g", "throughput", "latency", "comparison", "imt-2020"],
  },
  {
    title: "Base station components",
    description: "Explore antennas, RF units, baseband, scheduling, backhaul, and power.",
    path: "/base-station",
    category: "Hardware",
    keywords: ["base station", "antenna", "rf", "baseband", "scheduler", "power"],
  },
  {
    title: "SIM, eSIM & iSIM",
    description: "Compare removable, embedded, and integrated secure identity elements.",
    path: "/security",
    category: "Security",
    keywords: ["sim", "esim", "isim", "authentication", "credentials", "secure element"],
  },
  {
    title: "Authentication flow",
    description: "Run a safe educational simulation of successful and failed network authentication.",
    path: "/security",
    category: "Security",
    keywords: ["authentication", "access control", "identity", "session", "security"],
  },
  {
    title: "AI-assisted network monitoring",
    description: "Observe a rule-based operations sandbox, its alerts, and recovery guidance.",
    path: "/ai-network",
    category: "Operations",
    keywords: ["ai", "monitoring", "anomaly", "telemetry", "alerts", "health"],
  },
  {
    title: "Emergency communication",
    description: "Walk through a simulated independent network response when a public network fails.",
    path: "/emergency-network",
    category: "Resilience",
    keywords: ["emergency", "village", "outage", "tower", "resilience", "coverage"],
  },
  {
    title: "Edge computing",
    description: "Move computation closer to devices to reduce response time and backhaul load.",
    path: "/future-network",
    category: "Future",
    keywords: ["edge", "mec", "latency", "compute", "cloud"],
  },
  {
    title: "6G research",
    description: "Research frontiers including new spectrum, sensing, and AI-native networks.",
    path: "/future-network",
    category: "Future",
    keywords: ["6g", "research", "terahertz", "isac", "ai-native"],
  },
  {
    title: "Underwater acoustic communication",
    description: "Sound-based communication for marine environments, with distinct engineering constraints.",
    path: "/future-network",
    category: "Future",
    keywords: ["underwater", "acoustic", "marine", "sonar", "ocean"],
  },
  {
    title: "Independent Long-Range Communication Network",
    description: "The academic project concept, architectural framing, and project objectives.",
    path: "/project",
    category: "Project",
    keywords: ["project", "independent network", "long range", "academic", "presentation"],
  },
  {
    title: "Project team",
    description: "Meet the student team behind the Independent Long-Range Communication Network.",
    path: "/project",
    category: "Project",
    keywords: ["team", "abhilash", "shashank", "lakshman", "hitesh", "chathan"],
  },
  {
    title: "About & acknowledgements",
    description: "Educational purpose, technologies, team, and acknowledgements.",
    path: "/about",
    category: "Project",
    keywords: ["about", "acknowledgement", "education", "technology", "team"],
  },
];
