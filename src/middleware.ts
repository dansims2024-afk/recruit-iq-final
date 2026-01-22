import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // This tells Clerk: "The homepage and the webhook are PUBLIC. Do not redirect them."
  publicRoutes: ["/", "/api/webhook"],
  ignoredRoutes: ["/api/webhook"]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
