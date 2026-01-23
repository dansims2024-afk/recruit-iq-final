import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that anyone can visit without being logged in
  publicRoutes: ["/", "/api/webhook/stripe"],
});

export const config = {
  // Broad matcher catches home page AND hidden Clerk login signals
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
