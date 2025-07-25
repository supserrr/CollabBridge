/**
 * Homepage - Landing Page Component
 * 
 * The main landing page for CollabBridge that serves as the entry point for all users.
 * Features a comprehensive introduction to the platform with hero section, feature highlights,
 * step-by-step process explanation, and calls-to-action for user registration.
 * 
 * Key Sections:
 * - Hero section with animated text and primary CTA
 * - Feature highlights with hover effects
 * - Step-by-step "How it Works" process
 * - Call-to-action section for user conversion
 * - Footer with additional links and information
 * 
 * This page serves both anonymous users (encouraging sign-up) and authenticated users
 * (providing navigation to their dashboard and platform features).
 * 
 * @page
 * @route /
 */

"use client"

import { NavBar } from "@/components/navigation/nav-bar"
import { Hero } from "@/components/sections/hero"
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects"
import { FeatureSteps } from "@/components/sections/how-it-works"
import { CTASection } from "@/components/sections/cta"
import { CollabBridgeFooter } from "@/components/sections/footer"
import { useAuth } from "@/hooks/use-auth-firebase"
import { Calendar, Users, MessageSquare, Star, Home, UserCheck } from "lucide-react"
import { PageTransition } from "@/components/layout/page-transition"

/**
 * Step-by-step process explanation data
 * Defines the core workflow for users on the platform
 */
const howItWorksSteps = [
  {
    step: "Step 1",
    title: "Create Your Profile",
    content: "Sign up as an Event Planner or Creative Professional. Set up your profile with your skills, portfolio, and availability.",
    image: "/images/create-profile.jpg"
  },
  {
    step: "Step 2", 
    title: "Discover & Connect",
    content: "Event Planners browse talented professionals. Creatives discover exciting events. Find your perfect match through our smart filtering system.",
    image: "/images/discover-connect.jpg"
  },
  {
    step: "Step 3",
    title: "Collaborate & Book",
    content: "Send booking requests, communicate in real-time, and manage your events seamlessly. Build lasting professional relationships.",
    image: "/images/collaborate-book.jpg"
  },
  {
    step: "Step 4",
    title: "Review & Grow",
    content: "After successful events, leave reviews and ratings. Build your reputation and grow your professional network on CollabBridge.",
    image: "/images/review-grow.jpg"
  }
]

/**
 * HomePage Component Implementation
 * Renders the complete landing page experience
 */
export default function HomePage() {
  const { user, loading } = useAuth()

  /**
   * Generate navigation items based on authentication state
   * Provides different navigation options for authenticated vs anonymous users
   */
  const getNavItems = () => {
    // Base navigation items available to all users
    const baseItems = [
      { name: "Home", url: "/", icon: Home },
      { name: "Events", url: "/events", icon: Calendar },
      { name: "Professionals", url: "/professionals", icon: Users },
    ]

    if (loading) {
      // Show loading state or default to signin
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }

    if (user) {
      // User is logged in, redirect to their dashboard
      return [
        ...baseItems,
        { name: "Connect", url: `/${user.username}/dashboard`, icon: UserCheck },
      ]
    } else {
      // User is not logged in, redirect to signin
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }
  }

  const navItems = getNavItems()
  return (
    <div className="min-h-screen bg-background">
      <NavBar items={navItems} />
      
      <PageTransition>
        <main>
          <Hero />
          
          <section id="features" className="py-12 -mt-8 bg-white dark:bg-black">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12">
                Why Choose CollabBridge?
              </h2>
              <FeaturesSectionWithHoverEffects />
            </div>
          </section>

          <section id="how-it-works" className="py-20 bg-white dark:bg-black">
            <FeatureSteps 
              features={howItWorksSteps}
              title="How CollabBridge Works"
              autoPlayInterval={4000}
            />
          </section>

          <CTASection
            title="Ready to transform your event planning?"
            description="Connect with talented creative professionals or find your next exciting event opportunity."
            action={{
              text: "Get Started Today",
              href: "/signup",
              variant: "default"
            }}
            withGlow={true}
          />
        </main>
      </PageTransition>

      <CollabBridgeFooter />
    </div>
  )
}
