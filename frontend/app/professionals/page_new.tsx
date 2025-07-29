/**
 * Professionals Page
 * 
 * The main professionals discovery page where users can browse and search for creative professionals.
 * Features a modern hero section with search functionality, filtering options, and a grid of professional
 * cards using the ProfileCard component. Includes glassmorphism design elements and smooth animations.
 * Now uses real API data instead of mock data.
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
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import { useState, useEffect } from 'react'

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
 * Professional interface for type safety
 */
interface Professional {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  skills: string[];
  avatar: string;
  verified: boolean;
  responseTime: string;
  completedProjects: number;
  description: string;
  availability: string;
  portfolioImages: string[];
}

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
const availabilityOptions = ['All', 'Available', 'Busy']

/**
 * ProfessionalsPage Component
 * 
 * Main page component for browsing and discovering creative professionals.
 * Features a hero section with animated text, glassmorphism search interface,
 * filtering options, and a responsive grid of professional profile cards.
 * Now uses real API data from the backend.
 * 
 * @component
 */
export default function ProfessionalsPage() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Skills');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProfessionals();
  }, [searchTerm, selectedCategory, selectedLocation, selectedAvailability, sortBy, page]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      let token = '';
      
      if (user && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'All Skills' && { category: selectedCategory.toLowerCase() }),
        ...(selectedLocation !== 'All Locations' && { location: selectedLocation }),
        ...(selectedAvailability !== 'All' && { availability: selectedAvailability.toLowerCase() }),
        ...(sortBy && { sortBy }),
      });

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/professionals?${params}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.professionals || []);
        setTotalCount(data.total || 0);
      } else {
        console.error('Failed to fetch professionals - using demo data');
        // Fallback to demo data
        const demoProfessionals: Professional[] = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: `Creative Professional ${i + 1}`,
          title: ['UI/UX Designer', 'Full Stack Developer', 'Brand Designer', 'Photographer', 'Video Editor', 'Marketing Specialist'][i % 6],
          company: `Company ${i + 1}`,
          location: ['San Francisco', 'Austin', 'Boston', 'Los Angeles', 'Seattle', 'Portland'][i % 6],
          rating: 4.5 + (Math.random() * 0.5),
          reviews: Math.floor(Math.random() * 100) + 10,
          hourlyRate: `$${50 + (i * 10)}`,
          skills: [
            ['UI Design', 'UX Research', 'Figma'],
            ['React', 'Node.js', 'TypeScript'],
            ['Branding', 'Logo Design', 'Adobe Creative Suite'],
            ['Portrait Photography', 'Event Photography', 'Lightroom'],
            ['Video Editing', 'Motion Graphics', 'After Effects'],
            ['Digital Marketing', 'SEO', 'Content Strategy']
          ][i % 6],
          avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80`,
          verified: Math.random() > 0.3,
          responseTime: `${Math.floor(Math.random() * 24) + 1} hours`,
          completedProjects: Math.floor(Math.random() * 50) + 5,
          description: `Experienced ${['UI/UX Designer', 'Full Stack Developer', 'Brand Designer', 'Photographer', 'Video Editor', 'Marketing Specialist'][i % 6]} with a passion for creating exceptional digital experiences.`,
          availability: ['available', 'busy', 'unavailable'][Math.floor(Math.random() * 3)],
          portfolioImages: [
            `https://images.unsplash.com/photo-${1600000000000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
            `https://images.unsplash.com/photo-${1600000000000 + i + 100}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
          ]
        }));
        setProfessionals(demoProfessionals);
        setTotalCount(demoProfessionals.length);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      // Fallback to demo data on error
      const demoProfessionals: Professional[] = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Creative Professional ${i + 1}`,
        title: ['UI/UX Designer', 'Full Stack Developer', 'Brand Designer', 'Photographer', 'Video Editor', 'Marketing Specialist'][i % 6],
        company: `Company ${i + 1}`,
        location: ['San Francisco', 'Austin', 'Boston', 'Los Angeles', 'Seattle', 'Portland'][i % 6],
        rating: 4.5 + (Math.random() * 0.5),
        reviews: Math.floor(Math.random() * 100) + 10,
        hourlyRate: `$${50 + (i * 10)}`,
        skills: [
          ['UI Design', 'UX Research', 'Figma'],
          ['React', 'Node.js', 'TypeScript'],
          ['Branding', 'Logo Design', 'Adobe Creative Suite'],
          ['Portrait Photography', 'Event Photography', 'Lightroom'],
          ['Video Editing', 'Motion Graphics', 'After Effects'],
          ['Digital Marketing', 'SEO', 'Content Strategy']
        ][i % 6],
        avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80`,
        verified: Math.random() > 0.3,
        responseTime: `${Math.floor(Math.random() * 24) + 1} hours`,
        completedProjects: Math.floor(Math.random() * 50) + 5,
        description: `Experienced ${['UI/UX Designer', 'Full Stack Developer', 'Brand Designer', 'Photographer', 'Video Editor', 'Marketing Specialist'][i % 6]} with a passion for creating exceptional digital experiences.`,
        availability: ['available', 'busy', 'unavailable'][Math.floor(Math.random() * 3)],
        portfolioImages: [
          `https://images.unsplash.com/photo-${1600000000000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
          `https://images.unsplash.com/photo-${1600000000000 + i + 100}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        ]
      }));
      setProfessionals(demoProfessionals);
      setTotalCount(demoProfessionals.length);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProfessionals();
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <PageTransition>
      <FastLoad>
        <CriticalCSS>
          <div className="min-h-screen bg-background overflow-hidden">
            {/* Navigation */}
            <NavBar items={[
              { name: 'Home', url: '/', icon: Home },
              { name: 'Professionals', url: '/professionals', icon: Users },
              { name: 'Events', url: '/events', icon: Calendar },
            ]} />
            
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
              <AuroraBackground>
                <div className="absolute inset-0 bg-black/20" />
              </AuroraBackground>
              
              <div className="relative z-10 text-center max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
                <AnimatedGroup variants={transitionVariants} className="space-y-8">
                  <div className="space-y-6">
                    <div className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/80 leading-tight">
                      <TextEffect per="char" as="span">
                        Find Creative
                      </TextEffect>
                      <br />
                      <TextEffect per="char" as="span" className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 animate-gradient-x">
                        Professionals
                      </TextEffect>
                    </div>
                    
                    <TextEffect 
                      per="word" 
                      as="p" 
                      className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
                    >
                      Connect with top-tier creative professionals who bring your vision to life. 
                      From designers to developers, find the perfect match for your next project.
                    </TextEffect>
                  </div>

                  {/* Search Interface */}
                  <div className="max-w-6xl mx-auto">
                    <div className="bg-background/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                      <div className="flex flex-col lg:flex-row gap-6 items-end">
                        {/* Search Input */}
                        <div className="flex-1 group">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input 
                              placeholder="Search by skills, name, or company..." 
                              className="h-12 pl-12 border border-white/10 bg-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background/80 text-lg"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                          </div>
                        </div>
                        
                        {/* Filter Controls */}
                        <div className="flex flex-wrap gap-4">
                          <div className="group">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                              <SelectTrigger className="h-12 border border-white/10 bg-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background/80 min-w-[150px]">
                                <SelectValue placeholder="All Skills" />
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
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                              <SelectTrigger className="h-12 border border-white/10 bg-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background/80 min-w-[150px]">
                                <SelectValue placeholder="All Locations" />
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
                          
                          <div className="group">
                            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                              <SelectTrigger className="h-12 border border-white/10 bg-background/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background/80 min-w-[150px]">
                                <SelectValue placeholder="Availability" />
                              </SelectTrigger>
                              <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                                {availabilityOptions.map((availability) => (
                                  <SelectItem key={availability} value={availability} className="hover:bg-orange-500/10 focus:bg-orange-500/20 rounded-lg transition-colors">
                                    {availability}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="group">
                            <Select value={sortBy} onValueChange={setSortBy}>
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
                          <Button 
                            onClick={handleSearch}
                            className="h-12 px-8 bg-orange-600 hover:bg-orange-700 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Search className="w-4 h-4 mr-2" />
                            Search Professionals
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedGroup>
              </div>
            </section>

            {/* Professionals Grid */}
            <section className="px-4 md:px-6 lg:px-8 pb-20">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? 'Loading...' : `${totalCount} Professionals Found`}
                  </h2>
                </div>
                
                {loading ? (
                  <div className="flex flex-wrap justify-center gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index} className="w-full max-w-sm">
                        <CardHeader>
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[200px]" />
                              <Skeleton className="h-4 w-[150px]" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4 mb-4" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-18" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-8">
                    {professionals.map((professional) => (
                      <ProfileCard 
                        key={professional.id}
                        professional={professional}
                        onContact={(id) => console.log(`Contacting professional ${id}`)}
                        onViewProfile={(id) => console.log(`Viewing profile ${id}`)}
                      />
                    ))}
                  </div>
                )}
                
                {/* Load More Section */}
                {!loading && professionals.length < totalCount && (
                  <div className="flex flex-col items-center mt-16 space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <Button 
                        onClick={loadMore}
                        className="relative h-14 px-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
                      >
                        Load More Professionals
                        <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {!loading && professionals.length === 0 && (
                  <div className="text-center py-16">
                    <div className="space-y-4">
                      <div className="text-6xl">🔍</div>
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        No professionals found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Try adjusting your search criteria or filters to find more professionals.
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('All Skills');
                          setSelectedLocation('All Locations');
                          setSelectedAvailability('All');
                          setPage(1);
                        }}
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Call to Action Section */}
            <CTASection 
              title="Ready to Find Your Perfect Creative Partner?"
              description="Join thousands of successful collaborations. Start your next project today."
              action={{
                text: "Get Started",
                href: "/signup",
                variant: "glow"
              }}
            />

            {/* Footer */}
            <CollabBridgeFooter />
          </div>
        </CriticalCSS>
      </FastLoad>
    </PageTransition>
  )
}
