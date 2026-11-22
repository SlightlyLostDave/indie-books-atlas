import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";
import { THEME_INIT_SCRIPT, fontVariables } from "./fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Indie Books Atlas",
  description:
    "A live, data-driven map of every indie bookstore in Canada.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", fontVariables)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
