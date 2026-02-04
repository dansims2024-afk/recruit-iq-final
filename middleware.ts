import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Match public routes that don't need a login
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/generate(.*)', 
  '/api/webhook/stripe',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  // CRITICAL: Updated matcher to be more resilient for Next.js 15
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
