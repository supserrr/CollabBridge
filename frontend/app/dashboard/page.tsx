'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Star, 
  TrendingUp, 
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Award,
  Globe,
  Zap,
  Filter,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiHelpers } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';

interface DashboardStats {
  events?: {
    total_events: number;
    open_events: number;
    upcoming_events: number;
  };
  applications?: {
    total_applications: number;
    pending_applications: number;
    accepted_applications: number;
  };
  reviews?: {
    total_reviews: number;
    average_rating: number;
  };
}

interface RecentItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  type: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch dashboard summary
      const dashboardData = await apiHelpers.get('/users/dashboard');
      setStats(dashboardData.dashboard);

      // Fetch recent items based on user role
      if (user?.role === 'planner') {
        const recentEvents = await apiHelpers.get('/events/my-events?limit=5');
        setRecentItems(recentEvents.events.map((event: any) => ({
          id: event.event_id,
          title: event.title,
          status: event.status,
          created_at: event.created_at,
          type: 'event'
        })));
      } else {
        const recentApplications = await apiHelpers.get('/applications/my-applications?limit=5');
        setRecentItems(recentApplications.applications.map((app: any) => ({
          id: app.app_id,
          title: app.event_title,
          status: app.status,
          created_at: app.applied_at,
          type: 'application'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-white"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPanner = user.role === 'planner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name}! 👋
                  </h2>
                  <p className="text-purple-100 text-lg">
                    {isPanner 
                      ? "Ready to create amazing events today?"
                      : "Let's find your next creative opportunity!"
                    }
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {isPanner ? (
                    <Link href="/events/create">
                      <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Event
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/events">
                      <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                        <Search className="mr-2 h-5 w-5" />
                        Find Events
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isPanner ? (
            <>
              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.events?.total_events || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Total Events</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Live</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.events?.open_events || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Active Events</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Soon</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.events?.upcoming_events || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Upcoming</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <Star className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">★ {stats.reviews?.average_rating || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.reviews?.total_reviews || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Reviews</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <Activity className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+5</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.applications?.total_applications || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Applications</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Pending</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.applications?.pending_applications || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Pending</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Success</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.applications?.accepted_applications || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Accepted</p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Award className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Pro</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">Pro</p>
                    <p className="text-sm text-gray-600 font-medium">Account Type</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-purple-600" />
                    Recent {isPanner ? 'Events' : 'Applications'}
                  </h3>
                  <Link href={isPanner ? '/events' : '/applications'} className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center">
                    View all
                    <Eye className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {recentItems.length > 0 ? recentItems.map((item, index) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-purple-500 transition-colors"></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No recent activity</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {isPanner ? 'Create your first event to get started' : 'Apply to events to see activity here'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {isPanner ? (
                  <>
                    <Link href="/events/create" className="block">
                      <div className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                            <Plus className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Create Event</p>
                            <p className="text-xs text-gray-500">Start a new event</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/professionals" className="block">
                      <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Browse Professionals</p>
                            <p className="text-xs text-gray-500">Find creative talent</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/events" className="block">
                      <div className="p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                            <Search className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Browse Events</p>
                            <p className="text-xs text-gray-500">Find opportunities</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/profile" className="block">
                      <div className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                            <Users className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Update Profile</p>
                            <p className="text-xs text-gray-500">Enhance visibility</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                Insights
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-sm font-semibold text-purple-600">85%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '85%' }}></div>
                </div>
                
                <div className="pt-2">
                  <p className="text-xs text-gray-500">
                    Complete your profile to increase visibility by up to 40%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}