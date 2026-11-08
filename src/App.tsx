import { Routes, Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const HomePage = lazyWithRetry(() => import("./pages/HomePage"));
const FundamentalsPage = lazyWithRetry(() => import("./pages/FundamentalsPage"));
const ArchitecturePage = lazyWithRetry(() => import("./pages/ArchitecturePage"));
const SimulatorPage = lazyWithRetry(() => import("./pages/SimulatorPage"));
const PerformancePage = lazyWithRetry(() => import("./pages/PerformancePage"));
const BaseStationPage = lazyWithRetry(() => import("./pages/BaseStationPage"));
const SecurityPage = lazyWithRetry(() => import("./pages/SecurityPage"));
const AiNetworkPage = lazyWithRetry(() => import("./pages/AiNetworkPage"));
const EmergencyPage = lazyWithRetry(() => import("./pages/EmergencyPage"));
const FuturePage = lazyWithRetry(() => import("./pages/FuturePage"));
const ProjectPage = lazyWithRetry(() => import("./pages/ProjectPage"));
const AboutPage = lazyWithRetry(() => import("./pages/AboutPage"));
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFoundPage"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/fundamentals" element={<FundamentalsPage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/performance" element={<PerformancePage />} />
      <Route path="/base-station" element={<BaseStationPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/ai-network" element={<AiNetworkPage />} />
      <Route path="/emergency-network" element={<EmergencyPage />} />
      <Route path="/future-network" element={<FuturePage />} />
      <Route path="/project" element={<ProjectPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
