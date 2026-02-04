import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  // We MUST await auth() in Next.js 15
  const { userId } = await auth();

  // If no user, Clerk's middleware usually handles the redirect, 
  // but this is the safe way to check inside the page.
  if (!userId) {
    return <div>Access Denied</div>;
  }

  return (
    <main>
      {/* Your Dashboard content or <MainBoard /> component goes here */}
      <h1>Welcome to your Dashboard</h1>
    </main>
  );
}
