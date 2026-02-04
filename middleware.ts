import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only protect routes that definitely need auth. 
// Keep the home page ('/') public so the build worker can see it.
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/webhook/stripe',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
