import { authMiddleware } from "@clerk/nextjs";

// This protects all routes. Stripe webhooks MUST be public
export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks/stripe"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
