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
  XCircle
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPanner = user.role === 'planner';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isPanner 
              ? "Manage your events and find creative professionals"
              : "Discover new opportunities and manage your applications"
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {isPanner ? (
              <>
                <Link href="/events/create">
                  <Button className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
                <Link href="/professionals">
                  <Button variant="outline" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Professionals
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/events">
                  <Button className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Update Profile
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {isPanner ? (
            <>
              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.events?.total_events || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.events?.open_events || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.events?.upcoming_events || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <Users className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.applications?.total_applications || 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.applications?.total_applications || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.applications?.pending_applications || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Accepted</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.applications?.accepted_applications || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.reviews?.average_rating ? `${stats.reviews.average_rating}★` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Items */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent {isPanner ? 'Events' : 'Applications'}
              </h2>
              <Link 
                href={isPanner ? '/events/my-events' : '/applications'} 
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    {isPanner ? <Calendar className="h-8 w-8 mx-auto" /> : <Users className="h-8 w-8 mx-auto" />}
                  </div>
                  <p className="text-gray-500">
                    {isPanner ? 'No events created yet' : 'No applications submitted yet'}
                  </p>
                  <Link href={isPanner ? '/events/create' : '/events'}>
                    <Button size="sm" className="mt-4">
                      {isPanner ? 'Create your first event' : 'Browse events'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Summary</h2>
              <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-500">
                Edit profile
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <span className="text-lg font-medium text-primary-600">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  {user.location && (
                    <p className="text-sm text-gray-500">{user.location}</p>
                  )}
                </div>
              </div>

              {user.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Bio</h4>
                  <p className="text-sm text-gray-600">{user.bio}</p>
                </div>
              )}

              {!isPanner && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Rating</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {user.rating ? `${user.rating}/5` : 'No ratings yet'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.availability_status === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : user.availability_status === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.availability_status || 'available'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {isPanner ? (
              <>
                <Link href="/events/create" className="card-interactive text-center">
                  <Plus className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">Create Event</p>
                </Link>
                <Link href="/events/my-events" className="card-interactive text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">My Events</p>
                </Link>
                <Link href="/professionals" className="card-interactive text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">Find Professionals</p>
                </Link>
                <Link href="/reviews" className="card-interactive text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">Reviews</p>
                </Link>
              </>
            ) : (
              <>
                <Link href="/events" className="card-interactive text-center">
                  <Eye className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">Browse Events</p>
                </Link>
                <Link href="/applications" className="card-interactive text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">My Applications</p>
                </Link>
                <Link href="/profile" className="card-interactive text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">Profile</p>
                </Link>
                <Link href="/reviews" className="card-interactive text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium">Reviews</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}