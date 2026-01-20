import { authMiddleware } from "@clerk/nextjs";

// This allows the home page to be accessible to guests
export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
