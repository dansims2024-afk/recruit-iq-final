import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Allow the homepage and the check-limit API to be public
  publicRoutes: ["/", "/api/check-limit"],
  // This explicitly ignores Next.js internals and static files
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\\.[\\w]+$)", "/_next/static/(.*)"]
});

export const config = {
  // The Universal Matcher: Matches EVERY page to ensure the session is found
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
