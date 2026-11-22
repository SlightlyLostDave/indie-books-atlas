"use client";

import "./globals.css";
import ErrorEntry from "@/components/layout/ErrorEntry";
import { THEME_INIT_SCRIPT, fontVariables } from "./fonts";

/**
 * A failure the root error boundary can't catch (the root layout itself, or
 * a page that fails on its first server render), which Next otherwise
 * answers with a plain-text "Internal Server Error". It renders its own
 * document, so it brings the styles, fonts and theme script with it.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" className={`h-full antialiased ${fontVariables}`} suppressHydrationWarning>
      <head>
        <title>This page didn&apos;t load | Indie Books Atlas</title>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ErrorEntry digest={error.digest} retry={retry} />
      </body>
    </html>
  );
}
