import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CollabBridge - Create. Collaborate. Connect.",
    template: "%s | CollabBridge"
  },
  description: "The premier platform connecting event planners with verified creative professionals across Rwanda. Find photographers, DJs, decorators, and more for your next unforgettable event.",
  keywords: [
    "events", 
    "photography", 
    "DJ", 
    "decoration", 
    "Rwanda", 
    "event planning", 
    "creative professionals",
    "Kigali",
    "event organizer",
    "wedding planning",
    "corporate events",
    "party planning"
  ],
  authors: [{ name: "CollabBridge Team" }],
  creator: "CollabBridge Team",
  publisher: "CollabBridge",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://collab-bridge.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://collab-bridge.vercel.app",
    title: "CollabBridge - Create. Collaborate. Connect.",
    description: "Connecting Event Planners with Creative Professionals in Rwanda",
    siteName: "CollabBridge",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CollabBridge - Connecting Event Planners with Creative Professionals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CollabBridge - Create. Collaborate. Connect.",
    description: "Connecting Event Planners with Creative Professionals in Rwanda",
    images: ["/og-image.png"],
    creator: "@collabbridge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
  classification: "Business",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://collab-bridge.vercel.app",
  },
};

// Loading component for better UX
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin opacity-20"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
          <div className="absolute inset-4 rounded-full bg-white"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">CollabBridge</h2>
        <p className="text-gray-600 animate-pulse">Loading your experience...</p>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          as="style"
        />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        
        {/* Optimize for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://vercel-insights.com" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      
      <body 
        className={`
          min-h-screen 
          bg-gradient-to-br from-gray-50 via-white to-purple-50
          font-default 
          antialiased 
          selection:bg-purple-200 
          selection:text-purple-900
          scroll-smooth
        `}
        suppressHydrationWarning
      >
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>

        <Suspense fallback={<LoadingFallback />}>
          <AuthProvider>
            {/* Background Pattern Overlay */}
            <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none z-0"></div>
            
            {/* Main Application Structure */}
            <div className="relative z-10 flex flex-col min-h-screen">
              {/* Navigation */}
              <Suspense fallback={
                <div className="h-16 bg-white/80 backdrop-blur-sm animate-pulse"></div>
              }>
                <Navbar />
              </Suspense>

              {/* Main Content */}
              <main 
                id="main-content" 
                className="flex-1"
                role="main"
              >
                <Suspense fallback={<LoadingFallback />}>
                  {children}
                </Suspense>
              </main>

              {/* Footer */}
              <Suspense fallback={
                <div className="h-64 bg-gray-900 animate-pulse"></div>
              }>
                <Footer />
              </Suspense>
            </div>

            {/* Toast Notifications */}
            <Toaster />

            {/* Analytics */}
            <Analytics />

            {/* Performance monitoring script */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Performance monitoring
                  if (typeof window !== 'undefined') {
                    window.addEventListener('load', function() {
                      // Log performance metrics
                      const perfData = performance.getEntriesByType('navigation')[0];
                      if (perfData && perfData.loadEventEnd) {
                        console.log('Page load time:', Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms');
                      }
                    });
                  }
                `,
              }}
            />
          </AuthProvider>
        </Suspense>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />

        {/* Critical CSS for above-the-fold content */}
        <style jsx global>{`
          /* Critical CSS for immediate rendering */
          .animate-fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .animate-stagger-1 { animation-delay: 0.1s; }
          .animate-stagger-2 { animation-delay: 0.2s; }
          .animate-stagger-3 { animation-delay: 0.3s; }
          .animate-stagger-4 { animation-delay: 0.4s; }
          
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Reduce animations for users who prefer reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .animate-fade-in-up,
            .animate-pulse,
            .animate-spin {
              animation: none !important;
            }
          }
          
          /* Improve text rendering */
          body {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Custom focus styles for better accessibility */
          *:focus-visible {
            outline: 2px solid #8b5cf6;
            outline-offset: 2px;
            border-radius: 4px;
          }
          
          /* Smooth scrolling with reduced motion support */
          @media (prefers-reduced-motion: no-preference) {
            html {
              scroll-behavior: smooth;
            }
          }
        `}</style>
      </body>
    </html>
  );
}