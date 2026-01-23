import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/api/webhook/stripe"],
  // Routes that should be ignored by the authentication middleware entirely
  ignoredRoutes: ["/api/webhook/stripe", "/(api|trpc)(.*)"],
});

export const config = {
  // This matcher ensures the middleware doesn't block internal Clerk/Next.js files
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
