import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. We create a list of "Safe Routes" that don't require login/protection
const isPublicRoute = createRouteMatcher([
  '/',                    // The Home Page
  '/api/generate',        // <-- CRITICAL FIX: Allow the AI API to receive data
  '/api/webhook/stripe',  // Allow Stripe to talk to your app
  '/sign-in(.*)',         // Login Page
  '/sign-up(.*)'          // Signup Page
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. If the request is NOT on the safe list, we block it
  if (!isPublicRoute(request)) {
    await auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
