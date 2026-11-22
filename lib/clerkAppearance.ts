/**
 * Clerk styling for the admin (docs/design/DESIGN.md), through Clerk's
 * `appearance` API only (BRIEF 3.4): no CSS overrides of Clerk internals.
 *
 * Variables point at the design tokens as CSS variables rather than hexes,
 * so Clerk follows the light and dark themes with the rest of the app.
 */

const display = "var(--font-playfair), Georgia, serif";
const sans = "var(--font-jost), system-ui, sans-serif";

export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--moss)",
    colorPrimaryForeground: "var(--bg)",
    colorDanger: "var(--danger)",
    colorSuccess: "var(--moss)",
    colorWarning: "var(--amber)",
    colorNeutral: "var(--ink)",
    colorForeground: "var(--ink)",
    colorMuted: "var(--bg-step)",
    colorMutedForeground: "var(--ink-dim)",
    colorBackground: "var(--bg-raised)",
    colorInput: "var(--bg)",
    colorInputForeground: "var(--ink)",
    colorBorder: "var(--line-strong)",
    colorRing: "var(--moss)",
    colorShadow: "transparent",
    colorModalBackdrop: "var(--scrim)",
    fontFamily: sans,
    fontFamilyButtons: sans,
    fontSize: "0.875rem",
    borderRadius: "0px",
  },
  elements: {
    // Flat: a neatline instead of Clerk's card and popover shadows.
    cardBox: { boxShadow: "none", border: "1px solid var(--ink-faint)" },
    card: { boxShadow: "none" },
    userButtonPopoverCard: { boxShadow: "none", border: "1px solid var(--ink-faint)" },
    userButtonAvatarBox: { borderRadius: "0px", width: "1.75rem", height: "1.75rem" },
    userButtonTrigger: { borderRadius: "0px" },
    avatarBox: { borderRadius: "0px" },
    headerTitle: { fontFamily: display, fontWeight: 700, fontSize: "1.5rem" },
    headerSubtitle: { color: "var(--ink-dim)" },
    formButtonPrimary: { boxShadow: "none", backgroundImage: "none", fontWeight: 500 },
    formFieldInput: { boxShadow: "none" },
    socialButtonsBlockButton: { boxShadow: "none" },
  },
};
