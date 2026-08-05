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

export function setTheme(theme: Theme) {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  localStorage.setItem('theme', theme);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
