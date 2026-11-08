import { useEffect } from "react";

const SITE_NAME = "5G Network Explorer";

type PageMeta = {
  title: string;
  description: string;
};

export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    document.title = `${title} — ${SITE_NAME}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
}
