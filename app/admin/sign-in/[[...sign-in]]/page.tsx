import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

/*
 * Styled through the ClerkProvider appearance (lib/clerkAppearance.ts).
 * proxy.ts leaves this route public, and NEXT_PUBLIC_CLERK_SIGN_IN_URL points
 * Clerk here instead of its hosted portal. The instance is invite-only, so
 * the "Sign up" footer link is hidden.
 */
export default function AdminSignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-(--gutter)">
      <div className="flex w-full max-w-[25rem] flex-col gap-6">
        <header className="border-b-2 border-ink pb-3">
          <Link href="/" className="font-display text-title font-bold text-ink no-underline">
            Indie Books Atlas
          </Link>
          <p className="mt-1 font-display text-prose italic text-ink-dim">Compilation office</p>
        </header>
        <SignIn appearance={{ elements: { footerAction: { display: "none" } } }} />
      </div>
    </div>
  );
}
