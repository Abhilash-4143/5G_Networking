import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "midnight" | "daylight";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("5gx-theme-v2");
    if (stored === "midnight" || stored === "daylight") return stored;
  } catch {
    // Default to the deep-midnight immersive theme.
  }
  return "midnight";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "midnight" ? "dark" : "light";
    try {
      localStorage.setItem("5gx-theme-v2", theme);
    } catch {
      // Preference persistence is optional.
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
