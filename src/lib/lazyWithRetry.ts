import { lazy, type ComponentType } from "react";

const CHUNK_RELOAD_AT = "5gx-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 30_000;

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

type LazyComponent = ReturnType<typeof lazy<ComponentType>>;

/**
 * Lazy import for page chunks. Retries once on failure, then performs a
 * cache-safe reload (at most once per cooldown window) to pick up the
 * freshest build — this covers browsers holding a previous build's
 * index.html after the site has been rebuilt.
 */
export function lazyWithRetry(factory: () => Promise<{ default: ComponentType }>): LazyComponent {
  return lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(CHUNK_RELOAD_AT);
      return mod;
    } catch (error) {
      try {
        const mod = await delay(500).then(() => factory());
        sessionStorage.removeItem(CHUNK_RELOAD_AT);
        return mod;
      } catch {
        const last = Number(sessionStorage.getItem(CHUNK_RELOAD_AT) ?? 0);
        if (Date.now() - last > RELOAD_COOLDOWN_MS) {
          sessionStorage.setItem(CHUNK_RELOAD_AT, String(Date.now()));
          window.location.reload();
          // Keep the suspense boundary up while the reload lands.
          return new Promise(() => {}) as Promise<{ default: ComponentType }>;
        }
        throw error;
      }
    }
  });
}
