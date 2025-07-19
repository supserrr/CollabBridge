import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import Layout from '@/components/layout/Layout'
import {
  UsersIcon,
  CalendarDaysIcon,
  StarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CogIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FlagIcon
} from '@heroicons/react/24/outline'

interface AdminStats {
  totalUsers: number
  totalEvents: number
  totalReviews: number
  pendingReports: number
  activeUsers: number
  revenue: number
}

interface User {
  id: string
  name: string
  email: string
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  joinedAt: string
  lastLogin?: string
}

interface Event {
  id: string
  title: string
  organizer: string
  date: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  attendees: number
  flagged: boolean
}

interface Report {
  id: string
  type: 'USER' | 'EVENT' | 'REVIEW'
  targetId: string
  targetName: string
  reporterName: string
  reason: string
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED'
  createdAt: string
}

// Mock data
const mockStats: AdminStats = {
  totalUsers: 1247,
  totalEvents: 89,
  totalReviews: 432,
  pendingReports: 5,
  activeUsers: 156,
  revenue: 12450
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'EVENT_PLANNER',
    status: 'ACTIVE',
    joinedAt: '2024-01-15',
    lastLogin: '2024-01-20'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'CREATIVE_PROFESSIONAL',
    status: 'ACTIVE',
    joinedAt: '2024-01-10',
    lastLogin: '2024-01-19'
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'EVENT_PLANNER',
    status: 'SUSPENDED',
    joinedAt: '2024-01-05',
    lastLogin: '2024-01-18'
  }
]

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Wedding Expo',
    organizer: 'Sarah Johnson',
    date: '2024-02-15',
    status: 'PUBLISHED',
    attendees: 45,
    flagged: false
  },
  {
    id: '2',
    title: 'Corporate Mixer',
    organizer: 'Mike Chen',
    date: '2024-02-20',
    status: 'DRAFT',
    attendees: 0,
    flagged: true
  }
]

const mockReports: Report[] = [
  {
    id: '1',
    type: 'USER',
    targetId: '3',
    targetName: 'Emily Davis',
    reporterName: 'Anonymous',
    reason: 'Inappropriate behavior',
    status: 'PENDING',
    createdAt: '2024-01-19'
  },
  {
    id: '2',
    type: 'EVENT',
    targetId: '2',
    targetName: 'Corporate Mixer',
    reporterName: 'Sarah Johnson',
    reason: 'Spam content',
    status: 'PENDING',
    createdAt: '2024-01-18'
  }
]

const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'events' | 'reports' | 'settings'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalReviews: 0,
    pendingReports: 0,
    activeUsers: 0,
    revenue: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [reports, setReports] = useState<Report[]>([])

  const { user } = useAuth()

  const loadAdminData = useCallback(async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStats(mockStats)
      setUsers(mockUsers)
      setEvents(mockEvents)
      setReports(mockReports)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h2>
            <p className="text-neutral-600">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </Layout>
    )
  }

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: action === 'suspend' ? 'SUSPENDED' : action === 'activate' ? 'ACTIVE' : u.status }
        : u
    ).filter(u => action !== 'delete' || u.id !== userId))
  }

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss') => {
    setReports(reports.map(r =>
      r.id === reportId
        ? { ...r, status: action === 'resolve' ? 'RESOLVED' : 'REVIEWED' }
        : r
    ))
  }

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string }> = 
    ({ title, value, icon, trend }) => (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading admin panel...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Admin Panel</h1>
            <p className="text-neutral-600 mt-2">Manage users, events, and platform settings</p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border border-neutral-200 rounded-lg mb-8">
            <div className="border-b border-neutral-200">
              <nav className="flex">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
                  { id: 'users', label: 'Users', icon: UsersIcon },
                  { id: 'events', label: 'Events', icon: CalendarDaysIcon },
                  { id: 'reports', label: 'Reports', icon: FlagIcon },
                  { id: 'settings', label: 'Settings', icon: CogIcon }
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
              {activeTab === 'dashboard' && (
                <div>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <StatCard
                      title="Total Users"
                      value={stats.totalUsers}
                      icon={<UsersIcon className="h-6 w-6 text-primary-600" />}
                      trend="+12% this month"
                    />
                    <StatCard
                      title="Active Users"
                      value={stats.activeUsers}
                      icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
                    />
                    <StatCard
                      title="Total Events"
                      value={stats.totalEvents}
                      icon={<CalendarDaysIcon className="h-6 w-6 text-primary-600" />}
                    />
                    <StatCard
                      title="Reviews"
                      value={stats.totalReviews}
                      icon={<StarIcon className="h-6 w-6 text-yellow-600" />}
                    />
                    <StatCard
                      title="Pending Reports"
                      value={stats.pendingReports}
                      icon={<ExclamationTriangleIcon className="h-6 w-6 text-red-600" />}
                    />
                    <StatCard
                      title="Revenue"
                      value={`$${stats.revenue.toLocaleString()}`}
                      icon={<ChartBarIcon className="h-6 w-6 text-green-600" />}
                      trend="+8% this month"
                    />
                  </div>

                  {/* Recent Activity */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Users</h3>
                      <div className="space-y-3">
                        {users.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-neutral-900">{user.name}</p>
                              <p className="text-sm text-neutral-500">{user.email}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pending Reports</h3>
                      <div className="space-y-3">
                        {reports.filter(r => r.status === 'PENDING').slice(0, 5).map((report) => (
                          <div key={report.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-neutral-900">{report.targetName}</p>
                              <p className="text-sm text-neutral-500">{report.reason}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {report.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">User Management</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="input w-64"
                      />
                      <select className="input">
                        <option value="">All Roles</option>
                        <option value="EVENT_PLANNER">Event Planners</option>
                        <option value="CREATIVE_PROFESSIONAL">Professionals</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                                <div className="text-sm text-neutral-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {user.role.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                              {new Date(user.joinedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button className="text-primary-600 hover:text-primary-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                {user.status === 'ACTIVE' ? (
                                  <button 
                                    onClick={() => handleUserAction(user.id, 'suspend')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleUserAction(user.id, 'activate')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleUserAction(user.id, 'delete')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">Event Management</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="input w-64"
                      />
                      <select className="input">
                        <option value="">All Status</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="bg-white border border-neutral-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-medium text-neutral-900">{event.title}</h4>
                              {event.flagged && (
                                <FlagIcon className="h-4 w-4 text-red-500" title="Flagged for review" />
                              )}
                            </div>
                            <p className="text-neutral-600 mb-2">Organizer: {event.organizer}</p>
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                              <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                              <span>Attendees: {event.attendees}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="btn btn-outline btn-sm">
                              View
                            </button>
                            {event.flagged && (
                              <button className="btn btn-primary btn-sm">
                                Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">Reports & Moderation</h3>
                    <select className="input">
                      <option value="">All Reports</option>
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-white border border-neutral-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.type === 'USER' ? 'bg-blue-100 text-blue-800' :
                                report.type === 'EVENT' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {report.type}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                'bg-neutral-100 text-neutral-800'
                              }`}>
                                {report.status}
                              </span>
                            </div>
                            <h4 className="font-medium text-neutral-900 mb-1">
                              Report against: {report.targetName}
                            </h4>
                            <p className="text-neutral-600 mb-2">Reason: {report.reason}</p>
                            <p className="text-sm text-neutral-500">
                              Reported by: {report.reporterName} on {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {report.status === 'PENDING' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                                className="btn btn-outline btn-sm"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleReportAction(report.id, 'resolve')}
                                className="btn btn-primary btn-sm"
                              >
                                Take Action
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-6">Platform Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h4 className="font-medium text-neutral-900 mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Platform Name
                          </label>
                          <input type="text" value="CollabBridge" className="input w-full" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Contact Email
                          </label>
                          <input type="email" value="admin@collabbridge.com" className="input w-full" />
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="maintenance" className="mr-2" />
                          <label htmlFor="maintenance" className="text-sm text-neutral-700">
                            Enable maintenance mode
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h4 className="font-medium text-neutral-900 mb-4">Moderation Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-neutral-700">Auto-approve user registrations</label>
                          <input type="checkbox" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-neutral-700">Require event approval</label>
                          <input type="checkbox" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-neutral-700">Enable review moderation</label>
                          <input type="checkbox" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="btn btn-primary">
                        Save Settings
                      </button>
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

export default AdminPanelPage
