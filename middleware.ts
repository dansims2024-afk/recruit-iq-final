import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Allows the landing page and authentication routes to be accessed without logging in
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhook(.*)"],
});

export const config = {
  // Protects all routes except static files and next internals
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
