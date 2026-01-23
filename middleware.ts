import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that anyone can see
  publicRoutes: ["/", "/api/webhook/stripe"],
});

export const config = {
  // This matcher catches the home page AND the hidden Clerk signals
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
