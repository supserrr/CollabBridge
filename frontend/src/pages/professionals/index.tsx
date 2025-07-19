import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import Layout from '@/components/layout/Layout'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Professional {
  id: string
  name: string
  title: string
  category: string
  location: string
  rating: number
  reviewCount: number
  hourlyRate?: number
  dailyRate?: number
  skills: string[]
  profileImage?: string
  isAvailable: boolean
  portfolioImages: string[]
}

const BrowseProfessionalsPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    priceRange: '',
    rating: '',
    availability: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { user } = useAuth()

  const categories = [
    'PHOTOGRAPHER',
    'VIDEOGRAPHER',
    'DJ',
    'MUSICIAN',
    'CATERER',
    'DECORATOR',
    'FLORIST',
    'MC',
    'LIGHTING_TECHNICIAN',
    'SOUND_TECHNICIAN',
    'MAKEUP_ARTIST',
    'OTHER'
  ]

  const priceRanges = [
    { value: '', label: 'Any Budget' },
    { value: '0-50', label: '$0 - $50/hr' },
    { value: '50-100', label: '$50 - $100/hr' },
    { value: '100-200', label: '$100 - $200/hr' },
    { value: '200+', label: '$200+/hr' }
  ]

  // Mock professionals data
  const mockProfessionals: Professional[] = [
    {
      id: '1',
      name: 'Alex Rivera',
      title: 'Wedding Photographer',
      category: 'PHOTOGRAPHER',
      location: 'San Francisco, CA',
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 150,
      skills: ['Wedding Photography', 'Portrait', 'Event Photography'],
      isAvailable: true,
      portfolioImages: ['/portfolio/alex1.jpg', '/portfolio/alex2.jpg']
    },
    {
      id: '2',
      name: 'Maya Patel',
      title: 'Event Decorator',
      category: 'DECORATOR',
      location: 'Los Angeles, CA',
      rating: 4.8,
      reviewCount: 93,
      hourlyRate: 120,
      dailyRate: 800,
      skills: ['Floral Design', 'Event Styling', 'Corporate Events'],
      isAvailable: true,
      portfolioImages: ['/portfolio/maya1.jpg', '/portfolio/maya2.jpg']
    },
    {
      id: '3',
      name: 'David Kim',
      title: 'DJ & Sound Engineer',
      category: 'DJ',
      location: 'New York, NY',
      rating: 5.0,
      reviewCount: 156,
      hourlyRate: 200,
      skills: ['DJ Services', 'Sound Engineering', 'Music Production'],
      isAvailable: false,
      portfolioImages: ['/portfolio/david1.jpg']
    },
    {
      id: '4',
      name: 'Sophie Chen',
      title: 'Professional Makeup Artist',
      category: 'MAKEUP_ARTIST',
      location: 'Miami, FL',
      rating: 4.7,
      reviewCount: 89,
      hourlyRate: 80,
      skills: ['Bridal Makeup', 'Special Effects', 'Photo Shoots'],
      isAvailable: true,
      portfolioImages: ['/portfolio/sophie1.jpg', '/portfolio/sophie2.jpg']
    }
  ]

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProfessionals(mockProfessionals)
    } catch (error) {
      console.error('Error loading professionals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    let filtered = mockProfessionals

    if (searchQuery) {
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (filters.category) {
      filtered = filtered.filter(prof => prof.category === filters.category)
    }

    if (filters.location) {
      filtered = filtered.filter(prof =>
        prof.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter(prof => prof.isAvailable)
    }

    setProfessionals(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      category: '',
      location: '',
      priceRange: '',
      rating: '',
      availability: ''
    })
    setProfessionals(mockProfessionals)
  }

  const renderRating = (rating: number, reviewCount: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-neutral-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-neutral-600">
          {rating.toFixed(1)} ({reviewCount} reviews)
        </span>
      </div>
    )
  }

  const handleContact = (professionalId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth/signin'
      return
    }

    if (user.role !== 'EVENT_PLANNER') {
      alert('Only event planners can contact professionals')
      return
    }

    // Navigate to contact/message page
    window.location.href = `/professionals/${professionalId}/contact`
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading professionals...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Find Creative Professionals
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Discover talented professionals for your next event. Browse portfolios, read reviews, and connect with the perfect match.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
            {/* Main Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full h-12"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="input w-full h-12"
                />
              </div>
              <button
                onClick={handleSearch}
                className="btn btn-primary h-12 px-8 inline-flex items-center"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline inline-flex items-center"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </button>
              
              {(searchQuery || Object.values(filters).some(f => f)) && (
                <button onClick={clearFilters} className="btn btn-ghost text-sm">
                  Clear All
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200 mt-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="input w-full"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="input w-full"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({...filters, availability: e.target.value})}
                    className="input w-full"
                  >
                    <option value="">Any</option>
                    <option value="available">Available Now</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Min Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: e.target.value})}
                    className="input w-full"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-neutral-600">
              {professionals.length} professional{professionals.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Professionals Grid */}
          {professionals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional) => (
                <div key={professional.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-neutral-300 rounded-full flex items-center justify-center">
                        {professional.profileImage ? (
                          <img src={professional.profileImage} alt={professional.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <UserIcon className="h-8 w-8 text-neutral-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-neutral-900">
                          {professional.name}
                        </h3>
                        <p className="text-neutral-600 mb-2">
                          {professional.title}
                        </p>
                        <div className="flex items-center text-sm text-neutral-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {professional.location}
                        </div>
                      </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="mb-4">
                      {renderRating(professional.rating, professional.reviewCount)}
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {professional.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {professional.skills.length > 3 && (
                          <span className="text-xs text-neutral-500">
                            +{professional.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing and Availability */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {professional.hourlyRate && (
                          <p className="text-sm font-medium text-neutral-900">
                            ${professional.hourlyRate}/hr
                          </p>
                        )}
                        {professional.dailyRate && (
                          <p className="text-xs text-neutral-500">
                            ${professional.dailyRate}/day
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-sm">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span className={professional.isAvailable ? 'text-green-600' : 'text-neutral-500'}>
                          {professional.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="btn btn-outline flex-1">
                        View Profile
                      </button>
                      <button 
                        onClick={() => handleContact(professional.id)}
                        className="btn btn-primary flex-1"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No professionals found
              </h3>
              <p className="text-neutral-600 mb-6">
                Try adjusting your search criteria or browse all professionals.
              </p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          )}

          {/* Load More */}
          {professionals.length > 0 && (
            <div className="text-center mt-12">
              <button className="btn btn-outline btn-lg">
                Load More Professionals
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default BrowseProfessionalsPage
