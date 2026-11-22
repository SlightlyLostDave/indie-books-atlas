'use client';

import { setTheme, useTheme, type Theme } from '@/lib/useTheme';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

/** A square Dark / Light segmented control (DESIGN.md, Shape). */
export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={cn('inline-flex shrink-0 border border-line-strong bg-bg-raised', className)}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
          className="h-6.5 px-2.5 font-sans text-meta font-medium text-ink-dim transition-colors duration-(--dur-quick) hover:text-ink focus-visible:-outline-offset-2 aria-pressed:bg-ink aria-pressed:text-bg"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
