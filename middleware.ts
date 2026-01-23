import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // "PASSIVE MODE": Allow all routes so the dashboard can handle logic without 404s
  publicRoutes: ["/(.*)"],
});

export const config = {
  // Standard matcher to allow Clerk internal scripts
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
