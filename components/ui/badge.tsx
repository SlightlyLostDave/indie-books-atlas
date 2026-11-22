import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * A boxed label, like a grid reference on a plate: square, hairline, sentence
 * case. Status is never carried by hue alone (DESIGN.md, Do and don't); pair a
 * badge's colour with a glyph or word.
 */
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border px-1.5 text-meta leading-none font-normal whitespace-nowrap transition-colors duration-(--dur-quick) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-invalid:border-danger [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-ink-faint bg-transparent text-ink [a]:hover:border-moss",
        secondary:
          "border-transparent bg-bg-step text-ink-dim [a]:hover:text-ink",
        destructive: "border-danger bg-transparent text-danger",
        outline:
          "border-line-strong bg-transparent text-ink-dim [a]:hover:border-moss [a]:hover:text-ink",
        ghost: "border-transparent bg-transparent text-ink-dim hover:bg-bg-step",
        link: "border-transparent px-0 text-moss underline decoration-line-strong underline-offset-[3px] hover:decoration-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
