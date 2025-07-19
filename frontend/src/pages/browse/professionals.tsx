// Browse Professionals Page
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import Layout from '@/components/layout/Layout'
import { LoadingSpinner } from '@/components/ui'

interface Professional {
  id: string
  name: string
  title: string
  category: string
  location: string
  rating: number
  reviewCount: number
  hourlyRate: number
  skills: string[]
  bio: string
  image?: string
  verified: boolean
  available: boolean
}

const BrowseProfessionalsPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')

  // Mock data - replace with API call
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
      bio: 'Professional wedding photographer with 8+ years of experience capturing beautiful moments.',
      image: '/professionals/alex.jpg',
      verified: true,
      available: true
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
      skills: ['Floral Design', 'Event Styling', 'Corporate Events'],
      bio: 'Creative decorator specializing in elegant and modern event design.',
      image: '/professionals/maya.jpg',
      verified: true,
      available: true
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
      bio: 'Professional DJ with state-of-the-art equipment and extensive music library.',
      image: '/professionals/david.jpg',
      verified: true,
      available: false
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfessionals(mockProfessionals)
      setLoading(false)
    }, 1000)
  }, [])

  const categories = [
    'PHOTOGRAPHER', 'VIDEOGRAPHER', 'DJ', 'MUSICIAN', 'CATERER', 
    'DECORATOR', 'FLORIST', 'MC', 'LIGHTING_TECHNICIAN', 'SOUND_TECHNICIAN',
    'MAKEUP_ARTIST', 'OTHER'
  ]

  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '0-100', label: '$0 - $100/hr' },
    { value: '100-200', label: '$100 - $200/hr' },
    { value: '200-300', label: '$200 - $300/hr' },
    { value: '300+', label: '$300+/hr' }
  ]

  const renderStars = (rating: number, reviewCount: number) => {
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
        <span className="ml-1 text-sm text-neutral-600">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      </div>
    )
  }

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching with filters:', { searchQuery, locationFilter, categoryFilter, priceRange, availabilityFilter })
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Find Creative Professionals
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Discover talented professionals for your next event. Browse portfolios, read reviews, and connect with the perfect match.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Search professionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="input w-full"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Any Availability</option>
                  <option value="available">Available Now</option>
                  <option value="unavailable">View All</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-600">
                {professionals.length} professionals found
              </p>
              <button
                onClick={handleSearch}
                className="btn-primary px-6 py-2 flex items-center"
              >
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
          </div>

          {/* Professionals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <div key={professional.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Profile Header */}
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                      {professional.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {professional.name}
                      </h3>
                      <p className="text-primary-600 font-medium">
                        {professional.title}
                      </p>
                      <div className="flex items-center text-sm text-neutral-600 mt-1">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {professional.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        professional.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {professional.available ? 'Available' : 'Busy'}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    {renderStars(professional.rating, professional.reviewCount)}
                  </div>

                  {/* Bio */}
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {professional.bio}
                  </p>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {professional.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="badge-outline text-xs">
                          {skill}
                        </span>
                      ))}
                      {professional.skills.length > 3 && (
                        <span className="badge-outline text-xs">
                          +{professional.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-neutral-900">
                      ${professional.hourlyRate}/hr
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        href={`/professionals/${professional.id}`}
                        className="btn-outline px-4 py-2 text-sm"
                      >
                        View Profile
                      </Link>
                      <button className="btn-primary px-4 py-2 text-sm">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn-outline px-8 py-3">
              Load More Professionals
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BrowseProfessionalsPage
