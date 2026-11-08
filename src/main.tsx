import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./index.css";
import { ThemeProvider } from "./components/common/ThemeProvider";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { PageErrorBoundary, LoadingScreen } from "./components/common/ErrorBoundary";
import { ScrollToTop } from "./components/common/PageHeader";
import AppRoutes from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("5G Network Explorer could not find the root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-[var(--cyan)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#03111b]"
        >
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <PageErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <AppRoutes />
              </Suspense>
            </PageErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
