import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Square, hairline, flat (docs/design/DESIGN.md). Sizes read the density
 * tokens (--control-h, --control-px), so one set of classes serves both the
 * comfortable public site and the compact admin. Disabled is ink-faint on a
 * line-strong border, never an opacity fade; there is no press-nudge.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border font-sans font-medium whitespace-nowrap select-none outline-none transition-colors duration-(--dur-quick) ease-(--ease-plate) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-transparent disabled:text-ink-faint aria-invalid:border-danger aria-invalid:focus-visible:outline-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-moss bg-moss text-bg hover:border-moss-deep hover:bg-moss-deep",
        outline:
          "border-line-strong bg-transparent text-ink hover:border-moss aria-expanded:border-moss",
        secondary:
          "border-transparent bg-bg-step text-ink hover:border-line-strong aria-expanded:border-line-strong",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-bg-step aria-expanded:bg-bg-step",
        /** A destructive trigger: outlined, so it doesn't shout until confirmed. */
        destructive:
          "border-danger bg-transparent text-danger hover:bg-danger hover:text-bg focus-visible:outline-danger",
        /** The confirm inside a destructive dialog, named for the action. */
        "destructive-solid":
          "border-danger bg-danger text-bg hover:border-ink hover:bg-danger focus-visible:outline-danger",
        link: "h-auto! border-transparent px-0! text-moss underline decoration-line-strong decoration-1 underline-offset-[3px] hover:decoration-current disabled:border-transparent",
      },
      size: {
        default:
          "h-(--control-h) gap-2 px-(--control-px) text-ui has-data-[icon=inline-end]:pr-[calc(var(--control-px)*0.75)] has-data-[icon=inline-start]:pl-[calc(var(--control-px)*0.75)]",
        xs: "h-6 gap-1 px-2 text-meta has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-(--control-h-sm) gap-1.5 px-[calc(var(--control-px)*0.75)] text-ui has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[calc(var(--control-h)+0.5rem)] gap-2 px-[calc(var(--control-px)*1.35)] text-body has-data-[icon=inline-end]:pr-(--control-px) has-data-[icon=inline-start]:pl-(--control-px)",
        icon: "size-(--control-h)",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-(--control-h-sm)",
        "icon-lg": "size-[calc(var(--control-h)+0.5rem)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
