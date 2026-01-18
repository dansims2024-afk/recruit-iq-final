import { PricingTable } from "@clerk/nextjs";

export default function UpgradePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Upgrade to Elite</h1>
        <p className="text-gray-500 mt-2">Get unlimited access to AI-powered recruitment tools.</p>
      </div>

      <div className="w-full max-w-5xl">
        {/* This component syncs with the plans you created in Clerk */}
        <PricingTable />
      </div>
    </div>
  );
}
