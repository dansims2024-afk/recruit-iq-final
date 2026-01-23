import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // FIXED: Added "/" to publicRoutes so the page loads immediately.
  // We also keep the Stripe webhook public so payments work.
  publicRoutes: ["/", "/api/webhooks/stripe"],
});

export const config = {
  // This matches all routes except static files (images, css, etc.)
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
