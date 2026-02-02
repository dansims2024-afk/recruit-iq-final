import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require login
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhook(.*)"],
});

export const config = {
  // Classic V4 matcher
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
