import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Stripe webhooks MUST be public to receive payment signals
  publicRoutes: ["/", "/api/webhooks/stripe"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
