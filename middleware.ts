import { authMiddleware } from "@clerk/nextjs";

// This is for Clerk Version 4 (Classic)
export default authMiddleware({
  // Routes anyone can visit without logging in
  publicRoutes: ["/", "/api/webhook/stripe"],
});

export const config = {
  // This "Broad Matcher" prevents internal Clerk signals like __clerk_db_jwt 
  // from being treated as missing static pages (404).
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/", 
    "/(api|trpc)(.*)"
  ],
};
