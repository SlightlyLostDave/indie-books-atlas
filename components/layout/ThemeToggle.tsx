'use client';

import { setTheme, useTheme } from '@/lib/useTheme';

export default function ThemeToggle() {
  const theme = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle light and dark mode"
      className="font-mono text-xs uppercase tracking-widest text-ink-dim hover:text-amber transition-colors"
    >
      {theme === 'light' ? 'Dark mode' : 'Light mode'}
    </button>
  );
}
