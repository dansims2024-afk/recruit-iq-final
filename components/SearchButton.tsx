"use client";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function SearchButton() {
  const { has, isLoaded } = useAuth();

  // Don't show anything until Clerk is ready
  if (!isLoaded) return <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>;

  const isElite = has({ feature: "pro_access" });

  return (
    <div>
      {isElite ? (
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
          Run AI Search
        </button>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <button disabled className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed">
            AI Search (Locked)
          </button>
          <Link href="/upgrade" className="text-blue-600 text-sm hover:underline">
            Upgrade to Elite to unlock
          </Link>
        </div>
      )}
    </div>
  );
}
