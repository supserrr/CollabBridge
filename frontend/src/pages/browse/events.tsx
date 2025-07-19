// Browse Events Page
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Layout from '@/components/layout/Layout'
import { LoadingSpinner } from '@/components/ui'

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  date: string
  location: string
  budget: { min: number; max: number }
  requirements: string[]
  status: string
  createdBy: string
  applications: number
  image?: string
}

// Mock data - replace with API call
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Corporate Annual Gala',
    description: 'Seeking experienced event professionals for a high-profile corporate gala event with 500+ attendees.',
    eventType: 'Corporate',
    date: '2025-09-15',
    location: 'San Francisco, CA',
    budget: { min: 20000, max: 30000 },
    requirements: ['Photography', 'Catering', 'Entertainment'],
    status: 'PUBLISHED',
    createdBy: 'Tech Corp Inc',
    applications: 12,
    image: '/events/corporate-gala.jpg'
  },
  {
    id: '2',
    title: 'Intimate Garden Wedding',
    description: 'Looking for creative professionals to help create a magical garden wedding experience.',
    eventType: 'Wedding',
    date: '2025-08-20',
    location: 'Napa Valley, CA',
    budget: { min: 10000, max: 18000 },
    requirements: ['Photography', 'Florist', 'Music'],
    status: 'PUBLISHED',
    createdBy: 'Sarah & Michael',
    applications: 8,
    image: '/events/garden-wedding.jpg'
  },
  {
    id: '3',
    title: 'Product Launch Party',
    description: 'Tech startup seeking event professionals for an innovative product launch celebration.',
    eventType: 'Corporate',
    date: '2025-07-10',
    location: 'New York, NY',
    budget: { min: 15000, max: 25000 },
    requirements: ['Stage Design', 'AV Equipment', 'Catering'],
    status: 'PUBLISHED',
    createdBy: 'StartupXYZ',
    applications: 15,
    image: '/events/product-launch.jpg'
  }
]

const BrowseEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  const categories = ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Festival', 'Concert']
  const budgetRanges = [
    { value: '', label: 'Any Budget' },
    { value: '0-5000', label: '$0 - $5,000' },
    { value: '5000-15000', label: '$5,000 - $15,000' },
    { value: '15000-30000', label: '$15,000 - $30,000' },
    { value: '30000+', label: '$30,000+' }
  ]

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching with filters:', { searchQuery, locationFilter, categoryFilter, budgetRange, dateFilter })
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
                Browse Events
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Discover exciting event opportunities and apply to showcase your creative talents
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
                  placeholder="Search events..."
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
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="input w-full"
                >
                  {budgetRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-600">
                {events.length} events found
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

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Event Image */}
                <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-600 relative">
                  <div className="absolute top-4 left-4">
                    <span className="badge-primary">{event.eventType}</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="badge-secondary">{event.applications} applications</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                      ${event.budget.min.toLocaleString()} - ${event.budget.max.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      {event.createdBy}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {event.requirements.slice(0, 3).map((req) => (
                        <span key={req} className="badge-outline text-xs">
                          {req}
                        </span>
                      ))}
                      {event.requirements.length > 3 && (
                        <span className="badge-outline text-xs">
                          +{event.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/events/${event.id}`}
                      className="btn-outline flex-1 text-center"
                    >
                      View Details
                    </Link>
                    <button className="btn-primary flex-1">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn-outline px-8 py-3">
              Load More Events
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BrowseEventsPage
