import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Allows the home page and stripe webhook to be viewed without being logged in
  publicRoutes: ["/", "/api/webhook/stripe"],
  // Prevents the middleware from blocking these essential background routes
  ignoredRoutes: ["/api/webhook/stripe", "/(api|trpc)(.*)"],
});

export const config = {
  // This ensures Clerk's internal redirect files aren't treated as "missing pages"
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
