import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Stripe webhooks MUST be public
  publicRoutes: ["/", "/api/webhooks/stripe"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
