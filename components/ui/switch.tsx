"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

/*
 * The square switch (DESIGN.md, Shape). Track 34x18 (sm 26x14) with a
 * square thumb. The enlarged ::after keeps a comfortable hit area.
 */
function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-none border border-line-strong bg-bg transition-colors duration-(--dur-quick) ease-(--ease-plate) outline-none after:absolute after:-inset-x-3 after:-inset-y-2 hover:border-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger data-[size=default]:h-[18px] data-[size=default]:w-[34px] data-[size=sm]:h-[14px] data-[size=sm]:w-[26px] data-checked:border-moss data-checked:bg-moss data-disabled:cursor-not-allowed data-disabled:border-line data-disabled:bg-transparent data-disabled:data-checked:bg-line-strong",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-none bg-ink-faint transition-transform duration-(--dur-quick) ease-(--ease-plate) group-data-[size=default]/switch:size-3 group-data-[size=sm]/switch:size-2 translate-x-[2px] group-data-[size=default]/switch:data-checked:translate-x-[18px] group-data-[size=sm]/switch:data-checked:translate-x-[14px] data-checked:bg-bg"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
