import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // OPTION 1 STRATEGY: "Open Door"
  // The regex "/(.*)" literally means "Match Everything"
  // This whitelists the Homepage, the Dashboard, API, Webhooks - EVERYTHING.
  publicRoutes: ["/(.*)"],
});

export const config = {
  // We keep the standard matcher so Clerk still loads the session data
  // but it will no longer block access based on it.
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
