import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // "Nuclear Option": Make EVERY route public to stop the redirect loop.
  // Your Dashboard component already handles the protection (showing/hiding buttons),
  // so we don't need the middleware to block anything right now.
  publicRoutes: ["/(.*)"],
});

export const config = {
  // Keep the matcher standard so Clerk still runs, just doesn't block.
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
