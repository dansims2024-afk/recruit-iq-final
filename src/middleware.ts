import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require login
  publicRoutes: ["/", "/api/webhook/stripe"],
});

export const config = {
  // The standard V4 matcher to prevent 404s on internal files
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
