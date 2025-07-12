import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CollabBridge - Connecting Event Planners with Creative Professionals',
  description: 'CollabBridge connects event planners with talented creative professionals in Rwanda, making collaboration seamless and events unforgettable.',
  keywords: ['events', 'professionals', 'collaboration', 'rwanda', 'platform', 'creative'],
  authors: [{ name: 'CollabBridge Team' }],
  openGraph: {
    title: 'CollabBridge - Connecting Event Planners with Creative Professionals',
    description: 'CollabBridge connects event planners with talented creative professionals in Rwanda, making collaboration seamless and events unforgettable.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollabBridge - Connecting Event Planners with Creative Professionals',
    description: 'CollabBridge connects event planners with talented creative professionals in Rwanda, making collaboration seamless and events unforgettable.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-gray-600 font-medium">Loading CollabBridge...</p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        />
        
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      
      <body 
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 font-default antialiased selection:bg-purple-200 selection:text-purple-900 scroll-smooth"
        suppressHydrationWarning
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>

        <Suspense fallback={<LoadingFallback />}>
          <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none z-0"></div>
          
          <div className="relative z-10 flex flex-col min-h-screen">
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
        </Suspense>
      </body>
    </html>
  );
}