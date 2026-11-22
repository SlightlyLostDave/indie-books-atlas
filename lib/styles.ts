/**
 * Shared link treatments (docs/design/DESIGN.md, Focus and states).
 * Reading links are moss with a quiet underline that firms up on hover;
 * navigation links are ink-dim with no underline.
 */
export const linkClass =
  "text-moss underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors duration-(--dur-quick) hover:decoration-current";

export const quietLinkClass =
  "text-ink-dim no-underline transition-colors duration-(--dur-quick) hover:text-moss";

/**
 * A quiet link inside a sentence (credits, attributions). Its colour is
 * close to the sentence's, so it keeps an underline: a link in running
 * text has to differ by more than colour (WCAG 1.4.1).
 */
export const creditLinkClass =
  "text-ink-dim underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors duration-(--dur-quick) hover:text-moss hover:decoration-current";
