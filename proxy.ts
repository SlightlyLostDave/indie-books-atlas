import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
// The in-app sign-in page must stay public, or signed-out visitors are
// bounced to Clerk's hosted portal instead of seeing it.
const isSignInRoute = createRouteMatcher(["/admin/sign-in(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req) && !isSignInRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files. The backslash is doubled so the
    // regex gets a literal "\." (a file extension). With a single backslash
    // the dot matches any character, and every path containing "ts", "js",
    // "ico", "map" and so on (e.g. /admin/events) skipped this proxy.
    "/((?!_next|[^?]*\\.(?:html?|css|js|jsx|ts|tsx|json|ico|svg|png|jpg|jpeg|webp|gif|woff2?|ttf|map)).*)",
    "/(api|trpc)(.*)",
  ],
};
