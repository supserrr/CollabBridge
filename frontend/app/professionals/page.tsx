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

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, Filter, Search, ArrowRight, ChevronRight, Star, Home, UserCheck, Award, Briefcase, MessageCircle, Loader2 } from 'lucide-react'
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
import { auth } from '@/lib/firebase'
import { cn } from '@/lib/utils'
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
 * Professional data structure interface
 * Defines the shape of professional profile data from API
 */
interface Professional {
  id: number
  name: string
  username?: string
  title: string
  location: string
  rating: number
  reviews: number
  hourlyRate: string
  skills: string[]
  categories: string[]
  avatar: string
  verified: boolean
  responseTime: string
  completedProjects: number
  description: string
  availability: string
  portfolioImages?: string[]
  portfolioLinks?: string[]
  languages?: string[]
  certifications?: string[]
  awards?: string[]
  equipment?: string
  experience?: string
  travelRadius?: number
}

/**
 * API Response interface for professionals endpoint
 */
interface ProfessionalsResponse {
  professionals: Professional[]
  total: number
  page: number
  pages: number
  filters: {
    skillCategories?: string[]
    locations?: string[]
    availabilityOptions?: string[]
  }
}

/**
 * Default filter options
 * Used when API doesn't return filter categories or as fallback
 */
const defaultSkillCategories = ['All Skills', 'Design', 'Development', 'Marketing', 'Data Science', 'Product Management']
const defaultLocations = ['All Locations', 'San Francisco', 'Austin', 'Boston', 'Los Angeles', 'Seattle', 'Portland']  
const defaultAvailability = ['All', 'Available', 'Busy']

/**
 * ProfessionalsPage Component
 * 
 * Main page component for browsing and discovering creative professionals.
 * Features a hero section with animated text, glassmorphism search interface,
 * filtering options, and a responsive grid of professional profile cards.
 * Now uses real API data instead of mock data.
 * 
 * @component
 */
export default function ProfessionalsPage() {
  // Get current user authentication state
  const { user, loading: authLoading } = useAuth()

  // Component state
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Skills')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedAvailability, setSelectedAvailability] = useState('All')
  
  // Filter options from API
  const [skillCategories, setSkillCategories] = useState<string[]>(defaultSkillCategories)
  const [locations, setLocations] = useState<string[]>(defaultLocations)
  const [availability, setAvailability] = useState<string[]>(defaultAvailability)

  /**
   * Fetch professionals from API
   * Handles authentication, filtering, and pagination
   */
  const fetchProfessionals = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12', // Show 12 professionals per page
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'All Skills' && { category: selectedCategory }),
        ...(selectedLocation !== 'All Locations' && { location: selectedLocation }),
        ...(selectedAvailability !== 'All' && { availability: selectedAvailability }),
      })

      // Prepare headers - include auth token if user is logged in
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Add auth token if user is authenticated
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken()
          headers['Authorization'] = `Bearer ${token}`
        } catch (authError) {
          console.warn('Failed to get auth token, proceeding without authentication:', authError)
        }
      }

      // Make API request
      const response = await fetch(`/api/professionals?${params}`, {
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch professionals: ${response.statusText}`)
      }

      const data: ProfessionalsResponse = await response.json()
      
      // Update state with API response
      setProfessionals(data.professionals || [])
      setTotal(data.total || 0)
      setCurrentPage(data.page || 1)
      setTotalPages(data.pages || 1)
      
      // Update filter options if provided by API
      if (data.filters) {
        if (data.filters.skillCategories) {
          setSkillCategories(['All Skills', ...data.filters.skillCategories])
        }
        if (data.filters.locations) {
          setLocations(['All Locations', ...data.filters.locations])
        }
        if (data.filters.availabilityOptions) {
          setAvailability(['All', ...data.filters.availabilityOptions])
        }
      }

    } catch (err) {
      console.error('Error fetching professionals:', err)
      setError(err instanceof Error ? err.message : 'Failed to load professionals')
      // Set empty data on error
      setProfessionals([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Handle search input changes with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page on search
  }

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!authLoading && user && auth.currentUser) {
        fetchProfessionals(1)
      }
    }, 500) // 500ms delay

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  // Fetch data when filters change (no debouncing for filters)
  useEffect(() => {
    if (!authLoading && user && auth.currentUser) {
      fetchProfessionals(1)
    }
  }, [authLoading, user, selectedCategory, selectedLocation, selectedAvailability])

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
    setCurrentPage(1)
  }

  const handleAvailabilityChange = (availability: string) => {
    setSelectedAvailability(availability)
    setCurrentPage(1)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProfessionals(page)
  }

  // Handle professional actions
  const handleContactProfessional = (professionalId: number) => {
    // TODO: Implement contact functionality
    console.log('Contact professional:', professionalId)
  }

  const handleViewProfile = (professionalId: number) => {
    // TODO: Navigate to professional profile page
    console.log('View profile:', professionalId)
  }

  const handleSaveProfile = (professionalId: number) => {
    // TODO: Implement save/bookmark functionality
    console.log('Save profile:', professionalId)
  }

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
    if (authLoading) {
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }

    // Authenticated user navigation - redirect to their dashboard
    if (user) {
      return [
        ...baseItems,
        { name: "Connect", url: "/dashboard", icon: UserCheck },
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
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search professionals, skills, or companies..." 
                            className="pl-12 h-14 text-lg border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90 focus:bg-background/95 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30"
                          />
                        </div>
                      </div>
                      
                      <div className="group">
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                          <SelectTrigger className="h-14 border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90 focus:bg-background/95 focus:ring-2 focus:ring-orange-500/30">
                            <SelectValue placeholder="Skills" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                            {skillCategories.map((category: string) => (
                              <SelectItem key={category} value={category} className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="group">
                        <Select value={selectedLocation} onValueChange={handleLocationChange}>
                          <SelectTrigger className="h-14 border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90 focus:bg-background/95 focus:ring-2 focus:ring-orange-500/30">
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                            {locations.map((location: string) => (
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
                          <Select value={selectedAvailability} onValueChange={handleAvailabilityChange}>
                            <SelectTrigger className="h-12 border border-white/10 bg-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background/80 min-w-[150px]">
                              <SelectValue placeholder="Availability" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                              {availability.map((status: string) => (
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
                  {loading ? 'Loading...' : error ? 'Error loading professionals' : `${total} Professionals Found`}
                </h2>
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-muted-foreground">Loading professionals...</span>
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <div className="text-red-500 mb-4">⚠️ {error}</div>
                  <Button 
                    onClick={() => fetchProfessionals(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              {/* Professionals Grid */}
              {!loading && !error && (
                <>
                  <div className="flex flex-wrap justify-center gap-8">
                    {professionals.map((professional: Professional) => (
                      <ProfileCard 
                        key={professional.id}
                        professional={professional}
                        onContact={handleContactProfessional}
                        onViewProfile={handleViewProfile}
                        onSaveProfile={handleSaveProfile}
                      />
                    ))}
                  </div>

                  {/* Empty State */}
                  {professionals.length === 0 && (
                    <div className="text-center py-20">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No Professionals Found</h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your search criteria or filters to find more professionals.
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchTerm('')
                          setSelectedCategory('All Skills')
                          setSelectedLocation('All Locations')
                          setSelectedAvailability('All')
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-16 space-x-4">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        variant="outline"
                        className="border-border/20"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              className={cn(
                                "w-10 h-10",
                                currentPage === pageNum 
                                  ? "bg-blue-600 text-white" 
                                  : "border-border/20"
                              )}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        variant="outline"
                        className="border-border/20"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
              
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
