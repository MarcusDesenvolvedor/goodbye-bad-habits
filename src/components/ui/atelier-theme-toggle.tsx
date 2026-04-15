"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  ATELIER_THEME_CHANGE_EVENT,
  ATELIER_THEME_STORAGE_KEY,
  type AtelierColorScheme,
} from "@/lib/theme";

function readSchemeFromDom(): AtelierColorScheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  function onStorage(e: StorageEvent) {
    if (e.key === ATELIER_THEME_STORAGE_KEY || e.key === null) {
      onStoreChange();
    }
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(ATELIER_THEME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ATELIER_THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot(): AtelierColorScheme {
  return readSchemeFromDom();
}

function getServerSnapshot(): AtelierColorScheme {
  return "light";
}

function applyScheme(next: AtelierColorScheme) {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem(ATELIER_THEME_STORAGE_KEY, next);
  } catch {
    /* localStorage may be unavailable */
  }
  window.dispatchEvent(new Event(ATELIER_THEME_CHANGE_EVENT));
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function AtelierThemeToggle() {
  const scheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: AtelierColorScheme = scheme === "dark" ? "light" : "dark";
    applyScheme(next);
  }, [scheme]);

  const isDark = scheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full p-2 text-ds-on-surface-variant transition-colors duration-300 hover:bg-ds-surface-container-high hover:text-ds-primary active:scale-95"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
