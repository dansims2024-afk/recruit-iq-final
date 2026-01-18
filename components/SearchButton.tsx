"use client";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function SearchButton() {
  const { has, isLoaded } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;

  const isElite = has({ feature: "pro_access" });

  return (
    <div>
      {isElite ? (
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Run AI Search
        </button>
      ) : (
        <Link 
          href="/upgrade" 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded inline-block"
        >
          Upgrade to Elite to Search
        </Link>
      )}
    </div>
  );
}
