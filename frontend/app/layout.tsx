import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth-firebase'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CollabBridge - Connect Event Planners with Creative Professionals',
  description: 'The premier platform for event planning collaboration',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logos/favicon.ico' },
    ],
    apple: [
      { url: '/logos/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/logos/logo-black.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        rel: 'icon', 
        type: 'image/svg+xml',
        url: '/logos/logo-white.svg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
