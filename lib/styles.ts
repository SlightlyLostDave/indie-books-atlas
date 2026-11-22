/**
 * Shared link treatments (docs/design/DESIGN.md, Focus and states).
 * Reading links are moss with a quiet underline that firms up on hover;
 * navigation links are ink-dim with no underline.
 */
export const linkClass =
  "text-moss underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors duration-(--dur-quick) hover:decoration-current";

export const quietLinkClass =
  "text-ink-dim no-underline transition-colors duration-(--dur-quick) hover:text-moss";
