"use client";

import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // FIXED: Removed the invalid 'dynamic' prop causing the build error
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className={`${inter.className} bg-[#0B1120] antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
