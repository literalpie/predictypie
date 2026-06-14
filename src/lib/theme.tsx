import { createSignal, createEffect, createRoot } from "solid-js";
import { isServer } from "solid-js/web";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (isServer) return "light";
  if (typeof document === "undefined") return "light";

  // On the client, check the DOM first so the signal matches what was
  // already rendered by the server / inline script. This prevents the
  // createEffect from briefly toggling the dark class off during hydration.
  if (document.documentElement.classList.contains("dark")) return "dark";

  const match = document.cookie.match(/(?:^|;)theme=([^;]+)/);
  if (match) return match[1] as Theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const setThemeCookie = (theme: Theme) => {
  if (typeof document !== "undefined") {
    document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }
};

const [theme, setTheme] = createRoot(() => {
  const [t, setT] = createSignal<Theme>(getInitialTheme());

  createEffect(() => {
    if (isServer) return;
    const current = t();
    document.documentElement.classList.toggle("dark", current === "dark");
    document.documentElement.style.colorScheme = current;
  });

  return [t, setT] as const;
});

export function toggleTheme() {
  setTheme((t) => {
    const newTheme = t === "light" ? "dark" : "light";
    setThemeCookie(newTheme);
    return newTheme;
  });
}

export { theme };
