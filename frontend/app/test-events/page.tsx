'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  location: string;
  budget?: number;
  currency: string;
}

export default function TestEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPIConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing API connection to:', process.env.NEXT_PUBLIC_API_URL);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          setError('Invalid data format from API');
        }
      } else {
        setError(`API request failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test API connection on mount
    testAPIConnection();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Events Test Page</h1>
                <p className="text-muted-foreground">Testing API connectivity and data loading</p>
              </div>
              <Button onClick={testAPIConnection} disabled={loading}>
                {loading ? 'Testing...' : 'Test API'}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Environment Check:</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
                <p><strong>Events loaded:</strong> {events.length}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {events.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => (
                  <Card key={event.id || index}>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        {event.eventType} • {event.status}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-sm mt-2"><strong>Location:</strong> {event.location}</p>
                      <p className="text-sm"><strong>Budget:</strong> {event.budget} {event.currency}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {events.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
