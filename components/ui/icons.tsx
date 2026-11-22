import type { SVGProps } from "react"

import { cn } from "@/lib/utils"

/**
 * The atlas icon set (docs/design/DESIGN.md, Iconography). Drawn like map
 * symbols: 16px grid, 1.5px currentColor stroke, square caps, mitre joins.
 * Every icon is decorative; the control around it carries the label.
 */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  )
}

/* ---------- Utility ---------- */

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6.5 8 10.5 12 6.5" />
    </Icon>
  )
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9.5 8 5.5 12 9.5" />
    </Icon>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 4 10.5 8 6.5 12" />
    </Icon>
  )
}

/** The tick: also the "verified" status mark. */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" />
    </Icon>
  )
}

/** A segment tracing a square neatline. The only looping motion in the system. */
export function LoadingIcon({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="2.75" y="2.75" width="10.5" height="10.5" stroke="var(--line-strong)" />
      <rect
        x="2.75"
        y="2.75"
        width="10.5"
        height="10.5"
        pathLength={40}
        strokeDasharray="8 32"
        className="iba-trace"
      />
    </Icon>
  )
}

/* ---------- Status marks (glyph plus word; never colour alone) ---------- */

/** ■ Review: a solid square flag. */
export function FlagMark({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="4.5" y="4.5" width="7" height="7" fill="currentColor" stroke="none" />
    </Icon>
  )
}

/** "i" for information, set inside a square neatline. */
export function InfoMark(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.75" y="2.75" width="10.5" height="10.5" />
      <path d="M8 7.25V11M8 5v.01" />
    </Icon>
  )
}

/* ---------- Identity ---------- */

/**
 * The open-book glyph: the atlas's symbol for a bookstore. The same shape is
 * used for map points (as a Mapbox symbol, never a DOM marker).
 */
export function BookGlyph({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="-8 -6 16 12"
      width="16"
      height="12"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M-6 -3.2C-4 -4.6 -1.6 -4.4 0 -3C1.6 -4.4 4 -4.6 6 -3.2V3.6C4 2.4 1.6 2.6 0 3.8C-1.6 2.6 -4 2.4 -6 3.6Z"
        fill="currentColor"
      />
      <path d="M0 -3V3.8" stroke="var(--bg)" strokeWidth={0.9} />
    </svg>
  )
}

/**
 * The plate mark: a double neatline around a point. Stands for "the map" and
 * leads every breadcrumb back to Plate 1.
 */
export function PlateMark(props: IconProps) {
  return (
    <Icon strokeWidth={1} {...props}>
      <rect x="1.5" y="2.5" width="13" height="11" />
      <rect x="3.5" y="4.5" width="9" height="7" />
      <rect x="7" y="7" width="2" height="2" fill="currentColor" stroke="none" />
    </Icon>
  )
}
