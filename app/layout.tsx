import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recruit-IQ | AI Recruiting Assistant",
  description: "Generate job descriptions and analyze resumes with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-[#0B1120] text-white antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
