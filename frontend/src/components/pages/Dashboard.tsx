import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BellIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import Navigation from '../layout/Navigation';
import Footer from '../layout/Footer';
import { Button, Card, CardContent, Badge, Avatar, Loading } from '../ui';
import authService from '../../services/auth';
import eventService from '../../services/events';
import bookingService from '../../services/bookings';
import type { User, Event, Booking, UserRole } from '../../types';
import { EventStatus, BookingStatus } from '../../types';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'bookings' | 'messages'>('overview');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Load user-specific data based on role
        const [userEvents, userBookings] = await Promise.all([
          eventService.getMyEvents(),
          bookingService.getBookings(),
        ]);

        setEvents(userEvents);
        setBookings(userBookings.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={null} />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">Please log in to access your dashboard.</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const isEventPlanner = user.role === 'EVENT_PLANNER';
  const isCreativeProfessional = user.role === 'CREATIVE_PROFESSIONAL';

  // Mock stats data
  const stats = isEventPlanner 
    ? [
        { label: 'Active Events', value: events.filter(e => e.status === EventStatus.PUBLISHED).length, icon: CalendarDaysIcon },
        { label: 'Total Bookings', value: bookings.length, icon: UserGroupIcon },
        { label: 'This Month', value: '$12,450', icon: CurrencyDollarIcon },
        { label: 'Success Rate', value: '94%', icon: ChartBarIcon },
      ]
    : [
        { label: 'Active Bookings', value: bookings.filter(b => b.bookingStatus === BookingStatus.CONFIRMED).length, icon: CalendarDaysIcon },
        { label: 'Applications', value: 8, icon: UserGroupIcon },
        { label: 'This Month', value: '$8,750', icon: CurrencyDollarIcon },
        { label: 'Rating', value: '4.9/5', icon: ChartBarIcon },
      ];

  const recentEvents = events.slice(0, 3);
  const recentBookings = bookings.slice(0, 3);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'events', label: isEventPlanner ? 'My Events' : 'Available Events', icon: CalendarDaysIcon },
    { id: 'bookings', label: 'Bookings', icon: UserGroupIcon },
    { id: 'messages', label: 'Messages', icon: BellIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-muted-foreground">
              {isEventPlanner 
                ? "Manage your events and connect with creative professionals"
                : "Find exciting opportunities and manage your bookings"
              }
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            {isEventPlanner ? (
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            ) : (
              <Button>
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Browse Events
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Events */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {isEventPlanner ? 'Recent Events' : 'Recent Applications'}
                  </h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentEvents.length > 0 ? recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={event.status === EventStatus.PUBLISHED ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No events yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Recent Bookings</h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                      <Avatar
                        firstName="Professional"
                        lastName="User"
                        size="sm"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {booking.eventId} {/* This would need to be resolved to event title */}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={booking.bookingStatus === BookingStatus.CONFIRMED ? 'default' : 'secondary'}>
                        {booking.bookingStatus}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserGroupIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No bookings yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {isEventPlanner ? 'My Events' : 'Available Events'}
              </h2>
              <div className="flex gap-3">
                <Button variant="outline">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                {isEventPlanner && (
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid gap-6">
              {events.length > 0 ? events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                          <Badge variant={event.status === EventStatus.PUBLISHED ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{event.description}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                          <span>📍 {event.location}</span>
                          <span>💰 ${event.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          {isEventPlanner ? 'Edit' : 'Apply'}
                        </Button>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {isEventPlanner ? 'No events created yet' : 'No events available'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {isEventPlanner 
                        ? 'Create your first event to start connecting with creative professionals'
                        : 'Check back later for new opportunities'
                      }
                    </p>
                    {isEventPlanner && (
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'bookings' || activeTab === 'messages') && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {activeTab === 'bookings' ? 'Bookings Management' : 'Messages Center'}
              </h3>
              <p className="text-muted-foreground">
                This section is coming soon! We're working hard to bring you the best experience.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
