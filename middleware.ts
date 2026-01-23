import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // This ensures Clerk handles the login signals properly
  publicRoutes: ["/", "/api/webhook/stripe"],
});

export const config = {
  // Broad matcher prevents 404s on internal Clerk tokens
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
