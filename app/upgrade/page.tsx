import { PricingTable } from "@clerk/nextjs";

export default function UpgradePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-8">Choose Your Plan</h1>
      {/* This magic component handles Stripe for you! */}
      <div className="w-full max-w-5xl">
        <PricingTable />
      </div>
    </div>
  );
}
