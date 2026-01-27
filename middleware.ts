import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Allows the homepage, dashboard, and webhooks to load without blocking.
  // This prevents the "spooling" loop after verification.
  publicRoutes: ["/(.*)"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
