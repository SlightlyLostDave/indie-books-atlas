"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-ui leading-snug font-normal text-ink-dim select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-ink-faint peer-disabled:cursor-not-allowed peer-disabled:text-ink-faint",
        className
      )}
      {...props}
    />
  )
}

export { Label }
