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

import { Calendar, MapPin, Users, Clock, Filter, Search, ArrowRight, ChevronRight, Home, UserCheck } from 'lucide-react'
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
 * Mock data for professional events
 * In production, this would be fetched from the API
 * Contains diverse events across different categories and price points
 */
const mockEvents = [
  {
    id: 1,
    title: 'Tech Innovation Summit 2025',
    description: 'Join industry leaders for insights into the latest tech trends and innovations.',
    date: '2025-08-15',
    time: '09:00 AM',
    location: 'San Francisco Convention Center',
    category: 'Technology',
    attendees: 250,
    maxAttendees: 500,
    price: 0,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop&auto=format&q=80',
    organizer: {
      name: 'Tech Leaders Association',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format&q=80',
      rating: 4.9
    },
    tags: ['AI', 'Machine Learning', 'Innovation'],
    isFeatured: true
  },
  {
    id: 2,
    title: 'Design Thinking Workshop',
    description: 'Learn design thinking methodologies and apply them to real-world problems.',
    date: '2025-08-20',
    time: '02:00 PM',
    location: 'Creative Hub Downtown',
    category: 'Design',
    attendees: 45,
    maxAttendees: 60,
    price: 89,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=80',
    organizer: {
      name: 'Design Professionals Network',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9d2ee83?w=150&h=150&fit=crop&auto=format&q=80',
      rating: 4.7
    },
    tags: ['Design Thinking', 'UX', 'Workshop']
  },
  {
    id: 3,
    title: 'Startup Pitch Night',
    description: 'Watch promising startups pitch their ideas to investors and industry experts.',
    date: '2025-08-25',
    time: '07:00 PM',
    location: 'Innovation District',
    category: 'Business',
    attendees: 120,
    maxAttendees: 200,
    price: 0,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=800&fit=crop&auto=format&q=80',
    organizer: {
      name: 'Startup Community SF',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format&q=80',
      rating: 4.8
    },
    tags: ['Startups', 'Pitching', 'Investment']
  },
  {
    id: 4,
    title: 'Digital Marketing Masterclass',
    description: 'Master the latest digital marketing strategies and tools for 2025.',
    date: '2025-09-01',
    time: '10:00 AM',
    location: 'Marketing Institute',
    category: 'Marketing',
    attendees: 80,
    maxAttendees: 100,
    price: 149,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop&auto=format&q=80',
    organizer: {
      name: 'Digital Marketing Pro',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&auto=format&q=80',
      rating: 4.6
    },
    tags: ['Digital Marketing', 'SEO', 'Social Media']
  },
  {
    id: 5,
    title: 'Remote Work Best Practices',
    description: 'Learn effective strategies for remote work and team collaboration.',
    date: '2025-09-10',
    time: '04:00 PM',
    location: 'Virtual Event',
    category: 'Remote Work',
    attendees: 300,
    maxAttendees: 500,
    price: 0,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=80',
    organizer: {
      name: 'Remote Work Alliance',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&auto=format&q=80',
      rating: 4.5
    },
    tags: ['Remote Work', 'Productivity', 'Collaboration']
  },
  {
    id: 6,
    title: 'Cybersecurity Conference',
    description: 'Stay ahead of cyber threats with the latest security practices and technologies.',
    date: '2025-09-15',
    time: '09:00 AM',
    location: 'Security Center',
    category: 'Technology',
    attendees: 180,
    maxAttendees: 250,
    price: 199,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=800&fit=crop&auto=format&q=80',
    organizer: {
      name: 'CyberSec Professionals',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format&q=80',
      rating: 4.9
    },
    tags: ['Cybersecurity', 'Data Protection', 'Privacy']
  }
]

const categories = ['All', 'Technology', 'Design', 'Business', 'Marketing', 'Remote Work']

export default function EventsPage() {
  const { user, loading } = useAuth()

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
        { name: "Connect", url: `/${user.username}/dashboard`, icon: UserCheck },
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
            <div className="relative pt-16 md:pt-20">
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
                  </div>
                </div>
              </div>
            </section>          {/* Events Grid */}
          <section className="px-4 md:px-6 lg:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap justify-center gap-8">
                {mockEvents.map((event) => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    onRegister={(id) => console.log(`Registering for event ${id}`)}
                    onViewDetails={(id) => console.log(`Viewing event details ${id}`)}
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
                    Load More Events
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
                
                {/* Pagination Info */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Showing <span className="font-medium text-foreground">1-6</span> of <span className="font-medium text-foreground">42</span> events
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
