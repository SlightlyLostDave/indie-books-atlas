"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

import { CheckIcon, CloseIcon, FlagMark, InfoMark, LoadingIcon } from "@/components/ui/icons"
import { useTheme } from "@/lib/useTheme"

/*
 * Toasts as marginal notes: a square neatline on bg-raised, the status as
 * glyph plus colour, and a top rule in danger for errors. Unstyled, so sonner
 * contributes positioning and motion only. The theme comes from the app's
 * own theme store (lib/useTheme), not next-themes, which this app never mounts.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useTheme()

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      gap={8}
      className="toaster group"
      icons={{
        success: <CheckIcon className="size-4 text-moss" />,
        info: <InfoMark className="size-4 text-ink-dim" />,
        warning: <FlagMark className="size-4 text-amber" />,
        error: <CloseIcon className="size-4 text-danger" />,
        loading: <LoadingIcon className="size-4 text-moss" />,
      }}
      style={
        {
          "--border-radius": "0px",
          "--width": "22rem",
          // DESIGN.md, Elevation: toasts sit at 60, above dialogs (50).
          zIndex: 60,
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "cn-toast flex w-(--width) items-start gap-3 rounded-none border border-ink-faint bg-bg-raised px-4 py-3 font-sans text-ui text-ink",
          icon: "mt-0.5 flex size-4 shrink-0 items-center justify-center",
          content: "flex min-w-0 flex-1 flex-col gap-0.5",
          title: "font-medium text-ink",
          description: "text-meta text-ink-dim",
          // The same top rules as dialogs: the plate rule for a done thing,
          // the danger rule for a failure.
          success: "border-t-2 border-t-ink",
          error: "border-t-3 border-t-danger",
          warning: "border-t-3 border-t-amber",
          actionButton:
            "ml-auto h-(--control-h-sm) shrink-0 rounded-none border border-moss bg-moss px-2.5 text-ui font-medium text-bg hover:bg-moss-deep",
          cancelButton:
            "h-(--control-h-sm) shrink-0 rounded-none border border-line-strong bg-transparent px-2.5 text-ui text-ink hover:border-moss",
          closeButton:
            "absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-none border-0 bg-transparent text-ink-dim hover:text-ink",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
