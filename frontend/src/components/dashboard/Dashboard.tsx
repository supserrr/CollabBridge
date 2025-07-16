import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserRole } from '@/types';
import api from '@/utils/api';

interface DashboardStats {
  events?: number;
  applications?: number;
  bookings?: number;
  reviews?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user-specific dashboard data
      if (user?.role === UserRole.EVENT_PLANNER) {
        const [eventsRes, bookingsRes] = await Promise.all([
          api.get('/events/my/events'),
          api.get('/bookings'),
        ]);
        setStats({
          events: eventsRes.data.pagination.total,
          bookings: bookingsRes.data.pagination.total,
        });
      } else if (user?.role === UserRole.CREATIVE_PROFESSIONAL) {
        const [applicationsRes, bookingsRes] = await Promise.all([
          api.get('/applications/my'),
          api.get('/bookings'),
        ]);
        setStats({
          applications: applicationsRes.data.pagination.total,
          bookings: bookingsRes.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
        <p className="mt-2 opacity-90">
          {user.role === UserRole.EVENT_PLANNER
            ? "Ready to plan your next amazing event?"
            : "Discover exciting new opportunities today!"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === UserRole.EVENT_PLANNER && (
          <>
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Events</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.events || 0}</p>
                  </div>
                  <div className="p-3 bg-brand-100 rounded-full">
                    <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.bookings || 0}</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-full">
                    <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {user.role === UserRole.CREATIVE_PROFESSIONAL && (
          <>
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.applications || 0}</p>
                  </div>
                  <div className="p-3 bg-brand-100 rounded-full">
                    <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.bookings || 0}</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-full">
                    <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.role === UserRole.EVENT_PLANNER && (
              <>
                <Button className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Create New Event</div>
                    <div className="text-sm opacity-75">Post a new event listing</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Browse Professionals</div>
                    <div className="text-sm opacity-75">Find talent for your events</div>
                  </div>
                </Button>
              </>
            )}
            
            {user.role === UserRole.CREATIVE_PROFESSIONAL && (
              <>
                <Button className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Browse Events</div>
                    <div className="text-sm opacity-75">Find new opportunities</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Update Portfolio</div>
                    <div className="text-sm opacity-75">Showcase your work</div>
                  </div>
                </Button>
              </>
            )}
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Messages</div>
                <div className="text-sm opacity-75">Check your inbox</div>
              </div>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to show.</p>
            <p className="text-sm mt-1">
              {user.role === UserRole.EVENT_PLANNER
                ? "Create your first event to get started!"
                : "Apply to events to see activity here!"}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
