import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge needs to know the design system's named type sizes
 * (globals.css `--text-*`), or it reads `text-meta` as a colour and drops it
 * when a `text-ink-*` colour follows.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["label", "meta", "ui", "body", "prose", "lede", "heading", "title", "page"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
