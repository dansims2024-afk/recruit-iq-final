import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that anyone can visit without being logged in
  publicRoutes: ["/", "/api/webhook/stripe"],
});

export const config = {
  // This matcher is optimized for Clerk V4 to catch internal redirect signals
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/", 
    "/(api|trpc)(.*)"
  ],
};
