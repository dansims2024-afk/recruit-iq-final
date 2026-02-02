import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// This tells Clerk which routes don't need a login to view
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhook(.*)']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skips static files and internal Next.js paths
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always runs for API routes
    '/(api|trpc)(.*)',
  ],
};
