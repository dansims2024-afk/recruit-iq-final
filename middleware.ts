import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// We make the API route public so the dashboard can talk to it freely
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/generate(.*)', 
  '/api/webhook/stripe'
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  // This matcher handles all internal Next.js paths
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
