/**
 * Events Page
 * 
 * The main events discovery page where users can browse and register for professional events.
 * Features a hero section with animated text, glassmorphism search interface, event filtering,
 * and a responsive grid of event cards using the EventCard component. Includes smooth animations
 * and modern design elements.
 * 
 * @page
 * @example
 * // Accessed via: /events
 * // Displays: Hero search, filter options, events grid, load more functionality, footer
 */

'use client'

import { Calendar, MapPin, Users, Clock, Filter, Search, ArrowRight, ChevronRight, Home, UserCheck, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EventCard } from '@/components/ui/event-card'
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
import { useState, useEffect } from 'react'
import { eventsApi } from '@/lib/api'

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

// Event type definitions
interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  budget?: number;
  currency: string;
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  status: string;
  images: string[];
  event_planners: {
    id: string;
    businessName: string;
    users: {
      id: string;
      name: string;
      email: string;
    };
  };
}

const categories = ['All', 'WEDDING', 'CORPORATE', 'BIRTHDAY', 'CONCERT', 'CONFERENCE', 'OTHER']

export default function EventsPage() {
  const { user, loading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const filters = {
          page: currentPage,
          limit: 12,
          ...(selectedCategory !== 'All' && { eventType: selectedCategory }),
          ...(searchQuery && { search: searchQuery })
        }
        
        const response = await eventsApi.getEvents(filters)
        setEvents(response.events)
        setFilteredEvents(response.events)
        setTotalPages(response.pagination.totalPages)
        setError(null)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load events. Please try again later.')
        setEvents([])
        setFilteredEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [currentPage, selectedCategory, searchQuery])

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Create navigation items dynamically based on authentication status
  const getNavItems = () => {
    const baseItems = [
      { name: "Home", url: "/", icon: Home },
      { name: "Events", url: "/events", icon: Calendar },
      { name: "Professionals", url: "/professionals", icon: Users },
    ]

    if (loading) {
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }

    if (user) {
      return [
        ...baseItems,
        { name: "Connect", url: "/dashboard", icon: UserCheck },
      ]
    } else {
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }
  }

  return (
    <>
      <AuroraBackground className="min-h-screen">
        <NavBar items={getNavItems()} />
        
        <PageTransition>
          <CriticalCSS>
            <FastLoad>
            {/* Modern Hero Section */}
            <div className="relative pt-24 md:pt-28 lg:pt-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center">
                        <AnimatedGroup variants={transitionVariants}>
                            <TextEffect
                                per="word"
                                as="h1"
                                className="mt-4 sm:mt-6 max-w-4xl mx-auto text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl lg:mt-12 xl:text-[5.25rem] font-bold text-primary drop-shadow-lg px-2"
                                preset="blur"
                            >
                                Professional Events & Networking
                            </TextEffect>
                            
                            <TextEffect
                                per="word"
                                as="p"
                                delay={0.5}
                                className="mx-auto mt-4 sm:mt-6 max-w-2xl text-balance text-base sm:text-lg text-foreground/80 drop-shadow-sm font-medium px-4 sm:px-0"
                                preset="blur"
                            >
                                Discover networking opportunities, workshops, and conferences that will advance your career and expand your professional network.
                            </TextEffect>
                        </AnimatedGroup>
                    </div>
                </div>
            </div>

            {/* Search and Events Section */}
            <section className="relative py-8 px-4 md:px-6 lg:px-8" id="events">
              <div className="max-w-7xl mx-auto">
                {/* Modern Search and Filter Section */}
                <div className="relative mb-16">
                  {/* Refined glassmorphism background */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/5" />
                  
                  <div className="relative p-8">
                    {/* Main search row */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-orange-500" />
                        <Input 
                          placeholder="Search events, topics, or organizers..." 
                          className="pl-12 h-14 text-lg border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90 focus:bg-background/95 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30"
                        />
                      </div>
                      
                      <Select>
                        <SelectTrigger className="w-full md:w-48 h-14 border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category.toLowerCase()} className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select>
                        <SelectTrigger className="w-full md:w-48 h-14 border border-white/10 bg-background/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-background/90">
                          <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                          <SelectItem value="today" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">Today</SelectItem>
                          <SelectItem value="week" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">This Week</SelectItem>
                          <SelectItem value="month" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">This Month</SelectItem>
                          <SelectItem value="future" className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">Future Events</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button className="h-14 px-8 bg-orange-600 hover:bg-orange-700 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <Search className="w-4 h-4 mr-2" />
                        Search Events
                      </Button>
                    </div>
                    
                    {/* Create Event CTA for authenticated users */}
                    {user && (
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-muted-foreground">
                            Want to host your own event?
                          </p>
                        </div>
                        <Link href={user.username ? '/dashboard/planner/manage-events' : '/signin'}>
                          <Button variant="outline" className="h-12 px-6 bg-background/70 backdrop-blur-sm border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/40 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>          {/* Events Grid */}
          <section className="px-4 md:px-6 lg:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-8">
                  {filteredEvents.map((event) => {
                    const eventPlanner = event.event_planners as any; // Type assertion for enhanced data
                    const eventImage = event.images?.[0];
                    
                    // Debug log for images
                    console.log(`Event "${event.title}" images:`, {
                      images: event.images,
                      firstImage: eventImage,
                      imagesLength: event.images?.length || 0
                    });
                    
                    return (
                      <EventCard 
                        key={event.id}
                        event={{
                          id: Number(event.id),
                          title: event.title,
                          description: event.description,
                          date: new Date(event.startDate).toLocaleDateString(),
                          time: new Date(event.startDate).toLocaleTimeString(),
                          location: event.location,
                          category: event.eventType,
                          attendees: 0, // This would come from applications/registrations
                          price: event.budget || 0,
                          image: eventImage || '/images/collaborate-book.jpg',
                          organizer: {
                            name: eventPlanner?.users?.name || eventPlanner?.businessName || 'Unknown Organizer',
                            avatar: eventPlanner?.users?.avatar || '/avatars/default.jpg',
                            rating: eventPlanner?.avgRating || undefined,
                            totalReviews: eventPlanner?.totalReviews || 0
                          },
                          tags: event.tags,
                          isFeatured: event.isFeatured
                        }}
                        onRegister={(id) => console.log(`Registering for event ${id}`)}
                        onViewDetails={(id) => console.log(`Viewing event details ${id}`)}
                      />
                    );
                  })}
                </div>
              )}
              
              {/* Load More Section */}
              <div className="flex flex-col items-center mt-16 space-y-6">
                {/* Load More Button */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <Button 
                    className="relative h-14 px-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
                  >
                    Load More Events
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
                
                {/* Pagination Info */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Showing <span className="font-medium text-foreground">{((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, filteredEvents.length)}</span> of <span className="font-medium text-foreground">{filteredEvents.length}</span> events
                  </p>
                  <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <div 
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i + 1 === currentPage ? 'w-8 bg-orange-600' : 'bg-muted'
                        }`} 
                      />
                    ))}
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
      title="Host Your Own Event"
      description="Create and manage professional events that bring together like-minded professionals in your industry."
      action={{
        text: "Create Event",
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
