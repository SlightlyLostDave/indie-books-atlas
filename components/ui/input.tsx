import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-(--control-h) w-full min-w-0 px-(--field-px) py-1 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-ui file:font-medium file:text-ink rounded-none border border-line-strong bg-bg text-body text-ink transition-colors duration-(--dur-quick) outline-none placeholder:text-ink-faint hover:border-moss focus-visible:border-moss focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-ink-faint read-only:border-line read-only:bg-bg-step read-only:hover:border-line aria-invalid:border-danger aria-invalid:hover:border-danger aria-invalid:focus-visible:outline-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
