import { ClerkProvider } from '@clerk/nextjs'
import "@/app/globals.css"; // Change ./ to "@/app/" to help Next.js find it

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#0B1120] text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
