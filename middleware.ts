import { authMiddleware } from "@clerk/nextjs";

// "Open the Gates" mode: This makes the site load no matter what
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/dashboard", "/api/webhooks/stripe"],
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\\.[\\w]+$)", "/api/webhooks/stripe"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
