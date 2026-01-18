import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ backgroundColor: '#0B1120', color: 'white' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
