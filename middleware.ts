import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define which routes are "Public" (anyone can see them)
// We include the Stripe webhook so Stripe can talk to your app
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/webhook/stripe',
  '/sign-in(.*)', 
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. If the request is NOT on the safe list, we protect it
  if (!isPublicRoute(request)) {
    // FIX: We await the auth() object before calling .protect()
    const authObject = await auth();
    authObject.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
