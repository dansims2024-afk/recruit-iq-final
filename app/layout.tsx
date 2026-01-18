import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>Recruit IQ Elite</title>
        </head>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
