import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js|jsx|ts|tsx|json|ico|svg|png|jpg|jpeg|webp|gif|woff2?|ttf|map)).*)",
    "/(api|trpc)(.*)",
  ],
};
