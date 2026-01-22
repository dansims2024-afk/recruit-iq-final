import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // This tells Clerk: "Do not touch or protect these specific doors."
  publicRoutes: [
    "/", 
    "/api/webhook/stripe"
  ],
  // This is the CRITICAL line. It tells Clerk to ignore Stripe's message completely
  // so the server doesn't crash with a "server-side exception."
  ignoredRoutes: [
    "/api/webhook/stripe"
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
