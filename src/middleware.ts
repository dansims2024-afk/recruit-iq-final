import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // This ensures the middleware doesn't try to protect 
  // the home page or static assets, avoiding extra network calls.
  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
