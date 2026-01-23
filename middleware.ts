import { authMiddleware } from "@clerk/nextjs";

// This allows Stripe to talk to your API without being logged in
export default authMiddleware({
  publicRoutes: ["/api/webhooks/stripe"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
