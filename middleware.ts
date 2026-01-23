import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // NUCLEAR FIX: Whitelist EVERYTHING ("/(.*)")
  // This ensures the dashboard, the API, and the Webhooks are never blocked.
  publicRoutes: ["/(.*)"],
});

export const config = {
  // Keep the matcher standard to ensure Clerk still loads the user session
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
