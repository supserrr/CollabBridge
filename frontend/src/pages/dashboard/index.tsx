import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import Layout from '@/components/layout/Layout'
import {
  CalendarDaysIcon,
  UsersIcon,
  StarIcon,
  PlusIcon,
  BellIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  eventPlanner: {
    eventsCreated: number
    totalBookings: number
    avgRating: number
    totalSpent: number
    upcomingEvents: number
  }
  professional: {
    totalBookings: number
    avgRating: number
    totalEarnings: number
    profileViews: number
    completionRate: number
  }
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'EVENT' | 'BOOKING' | 'DEADLINE'
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  location?: string
  attendees?: number
  client?: string
}

interface Notification {
  id: string
  type: 'BOOKING' | 'REVIEW' | 'MESSAGE' | 'PAYMENT' | 'REMINDER'
  title: string
  message: string
  createdAt: string
  read: boolean
  actionUrl?: string
}

interface RecentActivity {
  id: string
  type: 'BOOKING_RECEIVED' | 'REVIEW_RECEIVED' | 'EVENT_CREATED' | 'PAYMENT_RECEIVED'
  description: string
  createdAt: string
  metadata?: any
}

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'activity' | 'analytics'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    eventPlanner: {
      eventsCreated: 0,
      totalBookings: 0,
      avgRating: 0,
      totalSpent: 0,
      upcomingEvents: 0
    },
    professional: {
      totalBookings: 0,
      avgRating: 0,
      totalEarnings: 0,
      profileViews: 0,
      completionRate: 0
    }
  })
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { user } = useAuth()

  // Mock data
  const mockStats: DashboardStats = {
    eventPlanner: {
      eventsCreated: 12,
      totalBookings: 28,
      avgRating: 4.8,
      totalSpent: 15600,
      upcomingEvents: 3
    },
    professional: {
      totalBookings: 45,
      avgRating: 4.9,
      totalEarnings: 23400,
      profileViews: 156,
      completionRate: 96
    }
  }

  const mockCalendarEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Wedding Photography - Sarah & John',
      date: '2024-02-15',
      time: '14:00',
      type: 'BOOKING',
      status: 'CONFIRMED',
      location: 'Central Park, NYC',
      client: 'Sarah Johnson'
    },
    {
      id: '2',
      title: 'Corporate Event Planning Meeting',
      date: '2024-02-18',
      time: '10:00',
      type: 'EVENT',
      status: 'CONFIRMED',
      location: 'Office Conference Room'
    },
    {
      id: '3',
      title: 'Portfolio Review Deadline',
      date: '2024-02-20',
      time: '17:00',
      type: 'DEADLINE',
      status: 'PENDING'
    }
  ]

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'BOOKING',
      title: 'New Booking Request',
      message: 'You have a new booking request for March 15th wedding.',
      createdAt: '2024-01-20T10:30:00Z',
      read: false,
      actionUrl: '/bookings/1'
    },
    {
      id: '2',
      type: 'REVIEW',
      title: 'New Review Received',
      message: 'Sarah Johnson left you a 5-star review.',
      createdAt: '2024-01-19T15:20:00Z',
      read: false,
      actionUrl: '/reviews'
    },
    {
      id: '3',
      type: 'PAYMENT',
      title: 'Payment Received',
      message: '$1,200 payment received for wedding photography.',
      createdAt: '2024-01-18T09:15:00Z',
      read: true
    }
  ]

  const mockActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'BOOKING_RECEIVED',
      description: 'Received booking request from Emily Davis',
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      type: 'REVIEW_RECEIVED',
      description: 'Received 5-star review from Sarah Johnson',
      createdAt: '2024-01-19T15:20:00Z'
    },
    {
      id: '3',
      type: 'EVENT_CREATED',
      description: 'Created new event: Summer Music Festival',
      createdAt: '2024-01-18T14:10:00Z'
    }
  ]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStats(mockStats)
      setCalendarEvents(mockCalendarEvents)
      setNotifications(mockNotifications)
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    const upcoming = calendarEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= today
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return upcoming.slice(0, 5)
  }

  const StatCard: React.FC<{ 
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: string
    onClick?: () => void
  }> = ({ title, value, icon, trend, onClick }) => (
    <div 
      className={`bg-white border border-neutral-200 rounded-lg p-6 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className="p-3 bg-primary-100 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div 
      className={`p-4 border-l-4 ${
        notification.read ? 'border-neutral-200 bg-neutral-50' : 'border-primary-500 bg-primary-50'
      } hover:bg-primary-100 transition-colors cursor-pointer`}
      onClick={() => markNotificationRead(notification.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${notification.read ? 'text-neutral-700' : 'text-neutral-900'}`}>
            {notification.title}
          </h4>
          <p className={`text-sm ${notification.read ? 'text-neutral-500' : 'text-neutral-600'} mt-1`}>
            {notification.message}
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!notification.read && (
          <div className="w-3 h-3 bg-primary-600 rounded-full ml-3 mt-1"></div>
        )}
      </div>
    </div>
  )

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Please log in</h2>
            <p className="text-neutral-600 mb-6">You need to be logged in to access your dashboard.</p>
            <a href="/auth/signin" className="btn btn-primary">Log In</a>
          </div>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const isEventPlanner = user.role === 'EVENT_PLANNER'
  const eventPlannerStats = stats.eventPlanner
  const professionalStats = stats.professional

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-neutral-600 mt-2">
                {isEventPlanner ? 'Manage your events and bookings' : 'Track your bookings and earnings'}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              <button className="btn btn-outline inline-flex items-center">
                <BellIcon className="h-4 w-4 mr-2" />
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button className="btn btn-primary inline-flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                {isEventPlanner ? 'Create Event' : 'Update Portfolio'}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border border-neutral-200 rounded-lg mb-8">
            <div className="border-b border-neutral-200">
              <nav className="flex">
                {[
                  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                  { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
                  { id: 'activity', label: 'Recent Activity', icon: ClockIcon },
                  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-6 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isEventPlanner ? (
                      <>
                        <StatCard
                          title="Events Created"
                          value={eventPlannerStats.eventsCreated}
                          icon={<CalendarDaysIcon className="h-6 w-6 text-primary-600" />}
                          trend="+2 this month"
                        />
                        <StatCard
                          title="Total Bookings"
                          value={eventPlannerStats.totalBookings}
                          icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
                        />
                        <StatCard
                          title="Average Rating"
                          value={`${eventPlannerStats.avgRating}/5`}
                          icon={<StarIcon className="h-6 w-6 text-yellow-600" />}
                        />
                        <StatCard
                          title="Total Spent"
                          value={`$${eventPlannerStats.totalSpent.toLocaleString()}`}
                          icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
                        />
                      </>
                    ) : (
                      <>
                        <StatCard
                          title="Total Bookings"
                          value={professionalStats.totalBookings}
                          icon={<CalendarDaysIcon className="h-6 w-6 text-primary-600" />}
                          trend="+3 this week"
                        />
                        <StatCard
                          title="Average Rating"
                          value={`${professionalStats.avgRating}/5`}
                          icon={<StarIcon className="h-6 w-6 text-yellow-600" />}
                        />
                        <StatCard
                          title="Total Earnings"
                          value={`$${professionalStats.totalEarnings.toLocaleString()}`}
                          icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
                          trend="+15% this month"
                        />
                        <StatCard
                          title="Profile Views"
                          value={professionalStats.profileViews}
                          icon={<EyeIcon className="h-6 w-6 text-blue-600" />}
                        />
                      </>
                    )}
                  </div>

                  {/* Content Grid */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Upcoming Events */}
                    <div className="lg:col-span-2">
                      <div className="bg-white border border-neutral-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-neutral-900">Upcoming Events</h3>
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View All
                          </button>
                        </div>
                        <div className="space-y-4">
                          {getUpcomingEvents().map((event) => (
                            <div key={event.id} className="flex items-center p-4 bg-neutral-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-neutral-900">{event.title}</h4>
                                <div className="flex items-center text-sm text-neutral-500 mt-1">
                                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                  {new Date(event.date).toLocaleDateString()} at {event.time}
                                  {event.location && (
                                    <>
                                      <MapPinIcon className="h-4 w-4 ml-3 mr-1" />
                                      {event.location}
                                    </>
                                  )}
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                event.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {event.status}
                              </span>
                            </div>
                          ))}
                          
                          {getUpcomingEvents().length === 0 && (
                            <div className="text-center py-8">
                              <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                              <p className="text-neutral-600">No upcoming events</p>
                              <button className="btn btn-primary mt-4">
                                {isEventPlanner ? 'Create Event' : 'Browse Events'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div>
                      <div className="bg-white border border-neutral-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
                          <span className="text-sm text-neutral-500">
                            {notifications.filter(n => !n.read).length} unread
                          </span>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {notifications.slice(0, 5).map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} />
                          ))}
                        </div>
                        <button className="w-full mt-4 text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">Calendar</h3>
                    <div className="mt-4 lg:mt-0 flex items-center gap-3">
                      <select className="input">
                        <option>All Events</option>
                        <option>Bookings</option>
                        <option>Deadlines</option>
                      </select>
                      <button className="btn btn-primary">
                        Add Event
                      </button>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Mini Calendar */}
                    <div className="lg:col-span-1">
                      <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <h4 className="font-medium text-neutral-900 mb-4">
                          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        {/* Simple calendar grid would go here */}
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                            <div key={day} className="p-2 font-medium text-neutral-500">
                              {day}
                            </div>
                          ))}
                          {/* Calendar days would be rendered here */}
                        </div>
                      </div>
                    </div>

                    {/* Event List */}
                    <div className="lg:col-span-3">
                      <div className="bg-white border border-neutral-200 rounded-lg">
                        <div className="p-6">
                          <h4 className="font-medium text-neutral-900 mb-4">Upcoming Events</h4>
                          <div className="space-y-4">
                            {calendarEvents.map((event) => (
                              <div key={event.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-3 h-3 rounded-full ${
                                    event.type === 'EVENT' ? 'bg-blue-500' :
                                    event.type === 'BOOKING' ? 'bg-green-500' :
                                    'bg-orange-500'
                                  }`}></div>
                                  <div>
                                    <h5 className="font-medium text-neutral-900">{event.title}</h5>
                                    <p className="text-sm text-neutral-500">
                                      {new Date(event.date).toLocaleDateString()} at {event.time}
                                      {event.location && ` • ${event.location}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    event.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                    event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {event.status}
                                  </span>
                                  <button className="p-1 text-neutral-400 hover:text-neutral-600">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-6">Recent Activity</h3>
                  <div className="bg-white border border-neutral-200 rounded-lg">
                    <div className="divide-y divide-neutral-200">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'BOOKING_RECEIVED' ? 'bg-green-500' :
                              activity.type === 'REVIEW_RECEIVED' ? 'bg-yellow-500' :
                              activity.type === 'EVENT_CREATED' ? 'bg-blue-500' :
                              'bg-purple-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-neutral-900">{activity.description}</p>
                              <p className="text-sm text-neutral-500">
                                {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                                {new Date(activity.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-6">Analytics & Insights</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h4 className="font-medium text-neutral-900 mb-4">Performance Overview</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-600">Profile Completion</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-600">Response Rate</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h4 className="font-medium text-neutral-900 mb-4">Growth Metrics</h4>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">+23%</div>
                          <div className="text-sm text-neutral-600">Bookings this month</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">+15%</div>
                          <div className="text-sm text-neutral-600">Profile views</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DashboardPage
