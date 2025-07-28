"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { EventCard } from "@/components/ui/event-card";
import { eventsApi } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";

export default function EventPreviewPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const data = await eventsApi.getEventById(eventId);
        setEvent(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!event) return <div>No event found.</div>;

  // Format event data for EventCard
  const eventCardData = {
    id: Number(event.id),
    title: event.title,
    description: event.description,
    date: new Date(event.startDate).toLocaleDateString(),
    time: new Date(event.startDate).toLocaleTimeString(),
    location: event.location,
    category: event.eventType,
    attendees: 0,
    price: event.budget || 0,
    image: event.images?.[0] || '/images/default-event.jpg',
    organizer: {
      name: event.event_planners?.businessName || 'Unknown Organizer',
      avatar: '/images/default-avatar.jpg',
      rating: 4.5
    },
    tags: event.tags || [],
    isFeatured: event.isFeatured
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Event Preview</h1>
          <div className="mb-8">
            <EventCard event={eventCardData} />
          </div>
          <Link href="/dashboard/planner/events">
            <Button>Back</Button>
          </Link>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
