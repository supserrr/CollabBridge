'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useEffect, useState } from 'react';
import { plannerApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth-firebase';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  budget?: number;
  currency: string;
  status: string;
  isPublic: boolean;
  images?: string[];
  _count: {
    event_applications: number;
    bookings: number;
  };
}

export default function PlannerEventsPage() {
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        setError('You must be logged in to delete events.');
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      console.log('Deleting event:', eventId);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Delete response:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Delete error:', errorData);
        throw new Error(errorData.message || `Failed to delete event (${res.status})`);
      }
      
      // Successfully deleted, update UI
      setEvents(events.filter(e => e.id !== eventId));
      setError(null);
    } catch (err: any) {
      console.error('Delete event error:', err);
      setError(err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await plannerApi.getMyEvents();
      setEvents(response.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  // Listen for storage events to refresh data when returning from edit
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eventUpdated') {
        fetchMyEvents();
        localStorage.removeItem('eventUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when the window regains focus
    const handleFocus = () => {
      if (localStorage.getItem('eventUpdated')) {
        fetchMyEvents();
        localStorage.removeItem('eventUpdated');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handlePublishEvent = async (eventId: string) => {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        setError('You must be logged in to publish events.');
        return;
      }

      const token = await firebaseUser.getIdToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'PUBLISHED'
        }),
      });

      if (response.ok) {
        // Refresh the events list
        fetchMyEvents();
      } else {
        setError('Failed to publish event. Please try again.');
      }
    } catch (err) {
      console.error('Error publishing event:', err);
      setError('Failed to publish event. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'completed':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="pl-4 md:pl-6">
            <SiteHeader />
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Events</h1>
                <p className="text-muted-foreground">Manage your created events and bookings</p>
              </div>
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Events</h1>
                <p className="text-muted-foreground">Manage your created events and bookings</p>
              </div>
              <Link href={`/${user?.username}/dashboard/events/create`}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            {events.length === 0 && !loading && !error ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-6">Create your first event to start connecting with creative professionals</p>
                <Link href={`/${user?.username}/dashboard/events/create`}>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {event.images && event.images.length > 0 ? (
                        <div className="mb-2 w-full aspect-video overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                          <img
                            src={event.images[0]}
                            alt={event.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="mb-2 w-full aspect-video overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No image</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {event.eventType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(event.startDate)} - {formatDate(event.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.budget && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {formatCurrency(event.budget, event.currency)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{event._count.event_applications} applications</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{event._count.bookings} bookings</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {event.status === 'DRAFT' && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handlePublishEvent(event.id)}
                        >
                          Publish
                        </Button>
                      )}
                      <Link href={`/dashboard/events/edit/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
