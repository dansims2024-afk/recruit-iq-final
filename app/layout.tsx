import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Recruit-IQ | Elite Candidate Screening",
  description: "AI-Powered Talent Acquisition for Skilled Trades",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
      // This tells Clerk to handle the "Building" state gracefully
      afterSignOutUrl="/"
    >
      <html lang="en">
        <body className={`${inter.className} bg-[#0B1120]`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
