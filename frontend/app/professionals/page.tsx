/**
 * Professionals Page
 * 
 * The main professionals discovery page where users can browse and search for creative professionals.
 * Features a modern hero section with search functionality, filtering options, and a grid of professional
 * cards using the ProfileCard component. Includes glassmorphism design elements and smooth animations.
 * 
 * @page
 * @example
 * // Accessed via: /professionals
 * // Displays: Hero search, filter options, professionals grid, pagination, footer
 */

'use client'

import { Calendar, MapPin, Users, Clock, Filter, Search, ArrowRight, ChevronRight, Star, Home, UserCheck, Award, Briefcase, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileCard } from '@/components/ui/profile-card'
import { CriticalCSS, FastLoad } from '@/components/performance/CriticalCSS'
import { NavBar } from '@/components/navigation/nav-bar'
import { useAuth } from '@/hooks/use-auth-firebase'
import { CollabBridgeFooter } from '@/components/sections/footer'
import { PageTransition } from '@/components/layout/page-transition'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { TextEffect } from '@/components/ui/text-effect'
import { CTASection } from '@/components/sections/cta'
import Link from 'next/link'

/**
 * Animation variants for page elements
 * Defines smooth entrance animations with blur and spring effects
 */
const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',  // Initial blur effect
            y: 12,                 // Slight vertical offset
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',   // Clear final state
            y: 0,                  // Final position
            transition: {
                type: 'spring',    // Spring animation type
                bounce: 0.3,       // Bounce effect strength
                duration: 1.5,     // Animation duration
            },
        },
    },
}

/**
 * Mock data for professional profiles
 * In production, this would be fetched from the API
 * Contains diverse professionals with different skills and backgrounds
 */
const mockProfessionals = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'Senior UX Designer',
    company: 'Google',
    location: 'San Francisco, CA',
    rating: 4.9,
    reviews: 127,
    hourlyRate: '$120',
    skills: ['UX Design', 'Product Strategy', 'User Research', 'Figma'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9d2ee83?w=150&h=150&fit=crop&auto=format&q=80',
    verified: true,
    responseTime: '2 hours',
    completedProjects: 89,
    description: 'Passionate UX designer with 8+ years of experience creating user-centered digital experiences for Fortune 500 companies.',
    availability: 'Available',
    portfolioImages: ['https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=800&h=800&fit=crop&auto=format&q=80']
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    title: 'Full Stack Developer',
    company: 'Freelance',
    location: 'Austin, TX',
    rating: 4.8,
    reviews: 203,
    hourlyRate: '$95',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format&q=80',
    verified: true,
    responseTime: '1 hour',
    completedProjects: 156,
    description: 'Full-stack developer specializing in modern web technologies and cloud solutions. Expert in building scalable applications.',
    availability: 'Available',
    portfolioImages: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=800&fit=crop&auto=format&q=80']
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    title: 'Digital Marketing Strategist',
    company: 'HubSpot',
    location: 'Boston, MA',
    rating: 4.9,
    reviews: 184,
    hourlyRate: '$85',
    skills: ['SEO', 'Content Marketing', 'Analytics', 'PPC'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&auto=format&q=80',
    verified: true,
    responseTime: '3 hours',
    completedProjects: 142,
    description: 'Results-driven marketing strategist with expertise in driving growth through data-driven digital marketing campaigns.',
    availability: 'Busy',
    portfolioImages: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop&auto=format&q=80']
  },
  {
    id: 4,
    name: 'David Kim',
    title: 'Data Scientist',
    company: 'Netflix',
    location: 'Los Angeles, CA',
    rating: 4.7,
    reviews: 96,
    hourlyRate: '$135',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format&q=80',
    verified: true,
    responseTime: '4 hours',
    completedProjects: 67,
    description: 'Experienced data scientist with a track record of building ML models that drive business insights and revenue growth.',
    availability: 'Available',
    portfolioImages: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=800&fit=crop&auto=format&q=80']
  },
  {
    id: 5,
    name: 'Priya Patel',
    title: 'Product Manager',
    company: 'Stripe',
    location: 'Seattle, WA',
    rating: 4.8,
    reviews: 159,
    hourlyRate: '$110',
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&auto=format&q=80',
    verified: true,
    responseTime: '2 hours',
    completedProjects: 78,
    description: 'Strategic product manager with expertise in fintech and SaaS products. Proven track record of launching successful features.',
    availability: 'Available',
    portfolioImages: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop&auto=format&q=80']
  },
  {
    id: 6,
    name: 'Alex Thompson',
    title: 'Brand Designer',
    company: 'Airbnb',
    location: 'Portland, OR',
    rating: 4.9,
    reviews: 112,
    hourlyRate: '$100',
    skills: ['Brand Design', 'Illustration', 'Adobe Creative Suite', 'Motion Graphics'],
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&auto=format&q=80',
    verified: true,
    responseTime: '1 hour',
    completedProjects: 94,
    description: 'Creative brand designer passionate about creating memorable visual identities that tell compelling brand stories.',
    availability: 'Available',
    portfolioImages: ['https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=800&fit=crop&auto=format&q=80']
  }
]

/**
 * Skill categories for filtering professionals
 * Used in the search/filter interface to categorize professionals by expertise
 */
const skillCategories = ['All Skills', 'Design', 'Development', 'Marketing', 'Data Science', 'Product Management']

/**
 * Location options for filtering professionals
 * Major tech hubs and cities where professionals are commonly located
 */
const locations = ['All Locations', 'San Francisco', 'Austin', 'Boston', 'Los Angeles', 'Seattle', 'Portland']

/**
 * Availability status options for filtering
 * Allows users to find professionals based on their current availability
 */
const availability = ['All', 'Available', 'Busy']

/**
 * ProfessionalsPage Component
 * 
 * Main page component for browsing and discovering creative professionals.
 * Features a hero section with animated text, glassmorphism search interface,
 * filtering options, and a responsive grid of professional profile cards.
 * 
 * @component
 */
export default function ProfessionalsPage() {
  // Get current user authentication state
  const { user, loading } = useAuth()

  /**
   * Generate navigation items based on authentication state
   * Returns different navigation options for authenticated vs unauthenticated users
   */
  const getNavItems = () => {
    // Base navigation items available to all users
    const baseItems = [
      { name: "Home", url: "/", icon: Home },
      { name: "Events", url: "/events", icon: Calendar },
      { name: "Professionals", url: "/professionals", icon: Users },
    ]

    // Show loading state navigation while auth is being determined
    if (loading) {
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }

    // Authenticated user navigation - redirect to their dashboard
    if (user) {
      return [
        ...baseItems,
        { name: "Connect", url: `/${user.username}/dashboard`, icon: UserCheck },
      ]
    } else {
      // Unauthenticated user navigation - redirect to sign in
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }
  }

  return (
    <>
      {/* Aurora background with animated gradient effects */}
      <AuroraBackground className="min-h-screen">
        {/* Navigation bar with dynamic items based on auth state */}
        <NavBar items={getNavItems()} />
      
      {/* Page transition wrapper for smooth animations */}
      <PageTransition>
        <CriticalCSS>
          <FastLoad>
            {/* Hero Section with Animated Text */}
            <div className="relative pt-16 md:pt-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center">
                        <AnimatedGroup variants={transitionVariants}>
                            {/* Main heading with staggered word animation */}
                            <TextEffect
                                per="word"
                                as="h1"
                                className="mt-4 sm:mt-6 max-w-4xl mx-auto text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl lg:mt-12 xl:text-[5.25rem] font-bold text-primary drop-shadow-lg px-2"
                                preset="blur"
                            >
                                Find Top Creative Professionals
                            </TextEffect>
                            
                            {/* Subtitle with delayed animation */}
                            <TextEffect
                                per="word"
                                as="p"
                                delay={0.5}
                                className="mx-auto mt-4 sm:mt-6 max-w-2xl text-balance text-base sm:text-lg text-foreground/80 drop-shadow-sm font-medium px-4 sm:px-0"
                                preset="blur"
                            >
                                Connect with skilled professionals who can help bring your projects to life. From designers to developers, find the perfect collaborator.
                            </TextEffect>
                        </AnimatedGroup>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <section className="relative py-16 px-4 md:px-6 lg:px-8" id="professionals">
              <div className="max-w-7xl mx-auto">
                
                {/* Search and Filter Interface with Glassmorphism Design */}
                <div className="relative mb-16">
                  {/* Refined glassmorphism background */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/5" />
                  
                  <div className="relative p-8">
                    {/* Main search grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="relative md:col-span-2 group">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-hover:text-orange-500" />
                          <Input 
                            placeholder="Search professionals, skills, or companies..." 
                            className="pl-12 h-14 text-lg border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90 focus:bg-background/95 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30"
                          />
                        </div>
                      </div>
                      
                      <div className="group">
                        <Select defaultValue="All Skills">
                          <SelectTrigger className="h-14 border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90 focus:bg-background/95 focus:ring-2 focus:ring-orange-500/30">
                            <SelectValue placeholder="Skills" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                            {skillCategories.map((category) => (
                              <SelectItem key={category} value={category} className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="group">
                        <Select defaultValue="All Locations">
                          <SelectTrigger className="h-14 border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90 focus:bg-background/95 focus:ring-2 focus:ring-orange-500/30">
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                            {locations.map((location) => (
                              <SelectItem key={location} value={location} className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Secondary filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex gap-4 flex-1">
                        <div className="group">
                          <Select defaultValue="All">
                            <SelectTrigger className="h-12 border border-white/10 bg-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background/80 min-w-[150px]">
                              <SelectValue placeholder="Availability" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                              {availability.map((status) => (
                                <SelectItem key={status} value={status} className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="group">
                          <Select defaultValue="rating">
                            <SelectTrigger className="h-12 border border-white/10 bg-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background/80 min-w-[150px]">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                              <SelectItem value="rating" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">Highest Rated</SelectItem>
                              <SelectItem value="price-low" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">Price: Low to High</SelectItem>
                              <SelectItem value="price-high" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">Price: High to Low</SelectItem>
                              <SelectItem value="reviews" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">Most Reviews</SelectItem>
                              <SelectItem value="recent" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">Recently Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="group relative">
                        <Button className="h-12 px-8 bg-orange-600 hover:bg-orange-700 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                          <Search className="w-4 h-4 mr-2" />
                          Search Professionals
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          {/* Professionals Grid */}
          <section className="px-4 md:px-6 lg:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockProfessionals.length} Professionals Found
                </h2>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8">
                {mockProfessionals.map((professional) => (
                  <ProfileCard 
                    key={professional.id}
                    professional={professional}
                    onContact={(id) => console.log(`Contacting professional ${id}`)}
                    onViewProfile={(id) => console.log(`Viewing profile ${id}`)}
                  />
                ))}
              </div>
              
              {/* Load More Section */}
              <div className="flex flex-col items-center mt-16 space-y-6">
                {/* Load More Button */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <Button 
                    className="relative h-14 px-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
                  >
                    Load More Professionals
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
                
                {/* Pagination Info */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Showing <span className="font-medium text-foreground">1-6</span> of <span className="font-medium text-foreground">247</span> professionals
                  </p>
                  <div className="flex justify-center mt-4 space-x-2">
                    <div className="h-2 w-8 bg-orange-600 rounded-full" />
                    <div className="h-2 w-2 bg-muted rounded-full" />
                    <div className="h-2 w-2 bg-muted rounded-full" />
                    <div className="h-2 w-2 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FastLoad>
      </CriticalCSS>
      </PageTransition>
    </AuroraBackground>
      
    {/* CTA Section */}
    <CTASection
      title="Join Our Professional Network"
      description="Showcase your skills, connect with clients, and grow your professional network on CollabBridge."
      action={{
        text: "Create Profile",
        href: "/signup",
        variant: "default"
      }}
      withGlow={true}
    />
    
    {/* Footer */}
    <CollabBridgeFooter />
    </>
  )
}
