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
    "/((?!_next|[^?]*\.(?:html?|css|js|jsx|ts|tsx|json|ico|svg|png|jpg|jpeg|webp|gif|woff2?|ttf|map)).*)",
    "/(api|trpc)(.*)",
  ],
};
