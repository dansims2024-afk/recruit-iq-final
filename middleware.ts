import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // "PASSIVE MODE": Allow all routes so the dashboard can handle logic.
  // This stops the middleware from fighting with the redirect loop.
  publicRoutes: ["/(.*)"],
});

export const config = {
  // Standard matcher to allow Clerk internal scripts to run
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
