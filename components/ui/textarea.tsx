import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full resize-y px-(--field-px) py-2 leading-normal rounded-none border border-line-strong bg-bg text-body text-ink transition-colors duration-(--dur-quick) outline-none placeholder:text-ink-faint hover:border-moss focus-visible:border-moss focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-ink-faint read-only:border-line read-only:bg-bg-step read-only:hover:border-line aria-invalid:border-danger aria-invalid:hover:border-danger aria-invalid:focus-visible:outline-danger",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
