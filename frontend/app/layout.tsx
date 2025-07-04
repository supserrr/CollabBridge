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
});

export const metadata: Metadata = {
  title: {
    default: "CollabBridge - Connect. Collaborate. Create.",
    template: "%s | CollabBridge"
  },
  description: "Connecting Event Planners with Creative Professionals in Rwanda. Find photographers, DJs, decorators, and more for your next event.",
  keywords: ["events", "photography", "DJ", "decoration", "Rwanda", "event planning", "creative professionals"],
  authors: [{ name: "Nerd Herd Team" }],
  creator: "Nerd Herd Team",
  publisher: "CollabBridge",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://collabbridge-frontend.onrender.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://collabbridge-frontend.onrender.com",
    title: "CollabBridge - Connect. Collaborate. Create.",
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
    title: "CollabBridge - Connect. Collaborate. Create.",
    description: "Connecting Event Planners with Creative Professionals in Rwanda",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-hero-pattern opacity-30 pointer-events-none" />
            
            {/* Navigation */}
            <Suspense fallback={<div className="h-16 bg-white/80 backdrop-blur-md" />}>
              <Navbar />
            </Suspense>
            
            {/* Main Content */}
            <main className="flex-1 relative z-10">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />
            
            {/* Toast Notifications */}
            <Toaster />
          </div>
        </AuthProvider>
        
        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}