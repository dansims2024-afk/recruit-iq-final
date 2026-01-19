import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Whitelist all critical paths to prevent 500 errors during boot
  publicRoutes: ["/", "/api/webhooks/stripe"],
  // This prevents the middleware from running on static files which often causes the crash
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\\.[\\w]+$)", "/api/webhooks/stripe"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
