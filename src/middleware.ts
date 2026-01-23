import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // These routes are safe and don't require login
  publicRoutes: ["/", "/api/webhook/stripe"],
});

export const config = {
  // This "Safety Net" matcher ensures the middleware runs on EVERY page load
  matcher: ["/((?!_next/image|_next/static|favicon.ico).*)", "/"],
};
