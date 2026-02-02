import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that don't need a logged-in user to hit the API
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/generate', 
  '/api/webhook/stripe'
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
