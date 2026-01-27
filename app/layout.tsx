import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Script from 'next/script' // Next.js way to load external scripts

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Recruit-IQ | Elite AI Candidate Screening',
  description: 'AI-powered intelligence for modern recruiters.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Industry Standard PDF Parsing Logic - No Terminal Needed */}
          <Script 
            src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" 
            strategy="beforeInteractive" 
          />
          <Script 
            src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js" 
            strategy="beforeInteractive" 
          />
        </head>
        <body className={`${inter.className} bg-[#0B1120] antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
