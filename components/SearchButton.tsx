"use client";

import { useAuth } from "@clerk/nextjs";

export default function SearchButton() {
  const { has, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>;
  }

  // THE FIX: Change 'feature' to 'permission'
  const isElite = has({ permission: "pro_access" });

  if (!isElite) {
    return (
      <button 
        disabled 
        className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
      >
        Upgrade to Search
      </button>
    );
  }

  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Start AI Search
    </button>
  );
}
