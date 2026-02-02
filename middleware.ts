import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes should be accessible without a session
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/generate(.*)', // Add the (.*) to catch all variations
  '/api/webhook/stripe'
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  // This matcher ensures the middleware runs on all routes
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
