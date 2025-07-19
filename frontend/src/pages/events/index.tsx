import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth/AuthContext'
import Layout from '@/components/layout/Layout'
import { LoadingError } from '@/components/ui'

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  date: string
  endDate?: string
  location: string
  budget: {
    min: number
    max: number
  }
  requirements: string[]
  images: string[]
  status: string
  createdBy: string
  createdAt: string
  organizer?: {
    name: string
    profileImage?: string
    rating?: number
  }
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    eventType: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { user } = useAuth()
  const router = useRouter()

  const eventTypes = [
    'WEDDING',
    'CORPORATE',
    'BIRTHDAY',
    'ANNIVERSARY',
    'GRADUATION',
    'BABY_SHOWER',
    'CONFERENCE',
    'WORKSHOP',
    'FESTIVAL',
    'CONCERT',
    'OTHER'
  ]

  // Mock events data
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Corporate Annual Gala',
      description: 'Seeking experienced event professionals for a high-profile corporate gala event with 500+ attendees.',
      eventType: 'CORPORATE',
      date: '2025-09-15',
      location: 'Downtown Convention Center, San Francisco',
      budget: { min: 20000, max: 30000 },
      requirements: ['Event Coordinator', 'Catering', 'Entertainment', 'AV Setup'],
      images: [],
      status: 'PUBLISHED',
      createdBy: 'user1',
      createdAt: '2025-07-01',
      organizer: {
        name: 'Sarah Johnson',
        rating: 4.8
      }
    },
    {
      id: '2',
      title: 'Intimate Garden Wedding',
      description: 'Looking for creative professionals to help create a magical garden wedding experience for 100 guests.',
      eventType: 'WEDDING',
      date: '2025-08-20',
      location: 'Napa Valley, CA',
      budget: { min: 12000, max: 18000 },
      requirements: ['Photographer', 'Florist', 'Musicians', 'Catering'],
      images: [],
      status: 'PUBLISHED',
      createdBy: 'user2',
      createdAt: '2025-07-02',
      organizer: {
        name: 'Michael Chen',
        rating: 4.9
      }
    },
    {
      id: '3',
      title: 'Tech Product Launch',
      description: 'High-energy product launch event for a cutting-edge tech startup. Need innovative creative minds.',
      eventType: 'CORPORATE',
      date: '2025-08-10',
      location: 'Silicon Valley, CA',
      budget: { min: 15000, max: 25000 },
      requirements: ['Stage Design', 'AV Equipment', 'Entertainment', 'Photography'],
      images: [],
      status: 'PUBLISHED',
      createdBy: 'user3',
      createdAt: '2025-07-03',
      organizer: {
        name: 'Emma Rodriguez',
        rating: 5.0
      }
    }
  ]

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEvents(mockEvents)
    } catch (err: any) {
      setError(err.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // Filter events based on search query and filters
    let filtered = mockEvents

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filters.eventType) {
      filtered = filtered.filter(event => event.eventType === filters.eventType)
    }

    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setEvents(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      eventType: '',
      location: '',
      budgetMin: '',
      budgetMax: '',
      dateFrom: '',
      dateTo: ''
    })
    setEvents(mockEvents)
  }

  const handleApply = (eventId: string) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    if (user.role !== 'CREATIVE_PROFESSIONAL') {
      alert('Only creative professionals can apply to events')
      return
    }

    // Navigate to application page
    router.push(`/events/${eventId}/apply`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading events...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <LoadingError error={error} onRetry={loadEvents} />
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
              Browse Events
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Discover exciting opportunities and showcase your creative talents
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
            {/* Main Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {(searchQuery || Object.values(filters).some(f => f)) && (
                <button onClick={clearFilters} className="btn btn-ghost text-sm">
                  Clear All
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200 mt-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Event Type
                  </label>
                  <select
                    value={filters.eventType}
                    onChange={(e) => setFilters({...filters, eventType: e.target.value})}
                    className="input w-full"
                  >
                    <option value="">All Types</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="input w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-neutral-600">
              {events.length} event{events.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Events Grid */}
          {events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {event.eventType.replace('_', ' ')}
                        </span>
                        <div className="flex items-center text-yellow-400">
                          <StarIcon className="h-4 w-4 fill-current" />
                          <span className="text-sm text-neutral-600 ml-1">
                            {event.organizer?.rating || 'New'}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-neutral-600 text-sm line-clamp-3">
                        {event.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-neutral-600">
                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        ${event.budget.min.toLocaleString()} - ${event.budget.max.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        {event.requirements.join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-500">
                        by {event.organizer?.name}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm">
                          View Details
                        </button>
                        <button 
                          onClick={() => handleApply(event.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No events found
              </h3>
              <p className="text-neutral-600 mb-6">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default EventsPage
