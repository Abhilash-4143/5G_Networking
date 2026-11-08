import { useEffect, useState, type RefObject } from "react";

/**
 * Returns true while the observed element intersects the viewport.
 * Use to pause Three.js render loops (frameloop="never") when a scene
 * scrolls off-screen — the single biggest perf win for WebGL pages.
 */
export function useInView<T extends HTMLElement>(ref: RefObject<T | null>, enabled = true) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      setInView(false);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return inView;
}
