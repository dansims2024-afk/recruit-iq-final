import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // This ensures Stripe can reach your server without being blocked
  publicRoutes: ["/", "/api/webhook/stripe"],
  ignoredRoutes: ["/api/webhook/stripe"]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
