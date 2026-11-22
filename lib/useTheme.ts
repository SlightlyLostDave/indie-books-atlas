import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

function getServerSnapshot(): Theme {
  return 'dark';
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  localStorage.setItem('theme', theme);
}

/**
 * Switch the theme. The page crossfades once over --dur-move (DESIGN.md,
 * Motion: theme switch) where View Transitions exist; elsewhere, with
 * reduced motion, or in the admin (where --dur-move is 0), it swaps at once.
 */
export function setTheme(theme: Theme) {
  if (getSnapshot() === theme) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const instant = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-move')) === 0;
  if (reduced || instant || typeof document.startViewTransition !== 'function') {
    applyTheme(theme);
    return;
  }
  document.startViewTransition(() => applyTheme(theme));
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
