import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Share2,
  Bell,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  address?: string;
  eventType: 'booking' | 'event' | 'meeting' | 'deadline' | 'personal';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'invited' | 'accepted' | 'declined' | 'tentative';
  }>;
  bookingId?: string;
  eventId?: string;
  reminders: Array<{
    minutes: number;
    method: 'email' | 'sms' | 'push';
  }>;
  isRecurring: boolean;
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  color: string;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  metadata?: any;
}

interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  currentDate: Date;
}

const EVENT_TYPES = [
  { value: 'booking', label: 'Booking', color: 'bg-blue-500' },
  { value: 'event', label: 'Event', color: 'bg-green-500' },
  { value: 'meeting', label: 'Meeting', color: 'bg-purple-500' },
  { value: 'deadline', label: 'Deadline', color: 'bg-red-500' },
  { value: 'personal', label: 'Personal', color: 'bg-gray-500' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' }
];

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 10080, label: '1 week before' }
];

export default function EventCalendarIntegration() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<CalendarView>({ type: 'month', currentDate: new Date() });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    eventTypes: [] as string[],
    priorities: [] as string[],
    tags: [] as string[],
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [loading, setLoading] = useState(false);

  // Form state for creating/editing events
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    eventType: 'event',
    priority: 'medium',
    reminders: [{ minutes: 30, method: 'email' }],
    isRecurring: false,
    color: '#3b82f6',
    isPublic: false,
    tags: []
  });

  // Load events from API
  useEffect(() => {
    loadEvents();
  }, [view]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        ...filters.eventTypes.length && { types: filters.eventTypes.join(',') },
        ...filters.priorities.length && { priorities: filters.priorities.join(',') },
        ...filters.tags.length && { tags: filters.tags.join(',') }
      });

      const response = await fetch(`/api/calendar/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate)
        })));
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(view.currentDate);
    switch (view.type) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1);
      case 'week':
        const day = date.getDay();
        return new Date(date.getTime() - day * 24 * 60 * 60 * 1000);
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      default:
        return new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const getViewEndDate = () => {
    const date = new Date(view.currentDate);
    switch (view.type) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      case 'week':
        const day = date.getDay();
        return new Date(date.getTime() + (6 - day) * 24 * 60 * 60 * 1000);
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      default:
        return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(view.currentDate);
    
    if (direction === 'today') {
      setView(prev => ({ ...prev, currentDate: new Date() }));
      return;
    }

    const multiplier = direction === 'next' ? 1 : -1;
    
    switch (view.type) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + multiplier);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (7 * multiplier));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + multiplier);
        break;
    }
    
    setView(prev => ({ ...prev, currentDate: newDate }));
  };

  const handleCreateEvent = async () => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        await loadEvents();
        setShowEventDialog(false);
        resetEventForm();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/calendar/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        await loadEvents();
        setShowEventDialog(false);
        setSelectedEvent(null);
        resetEventForm();
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadEvents();
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      location: '',
      eventType: 'event',
      priority: 'medium',
      reminders: [{ minutes: 30, method: 'email' }],
      isRecurring: false,
      color: '#3b82f6',
      isPublic: false,
      tags: []
    });
  };

  const exportCalendar = async (format: 'ics' | 'pdf') => {
    try {
      const response = await fetch(`/api/calendar/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export calendar:', error);
    }
  };

  const syncWithExternalCalendar = async (provider: 'google' | 'outlook' | 'apple') => {
    try {
      const response = await fetch(`/api/calendar/sync/${provider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.authUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to sync calendar:', error);
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.startDate;
    const end = event.endDate;
    const sameDay = start.toDateString() === end.toDateString();
    
    if (sameDay) {
      return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleDateString()} ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const startDate = getViewStartDate();
    const endDate = getViewEndDate();
    const weeks = [];
    const currentDate = new Date(startDate);
    
    // Add days to make it start on Sunday
    const firstDayOfWeek = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - firstDayOfWeek);
    
    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        const dayEvents = getEventsForDay(date);
        const isCurrentMonth = date.getMonth() === view.currentDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        
        days.push(
          <div 
            key={date.toISOString()} 
            className={`min-h-[120px] border border-gray-200 p-2 ${
              isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
          >
            <div className={`text-sm font-medium mb-2 ${
              isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            } ${isToday ? 'text-blue-600' : ''}`}>
              {date.getDate()}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`text-xs p-1 rounded cursor-pointer truncate ${
                    EVENT_TYPES.find(t => t.value === event.eventType)?.color || 'bg-gray-500'
                  } text-white`}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(
        <div key={week} className="grid grid-cols-7">
          {days}
        </div>
      );
    }
    
    return (
      <div>
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        {weeks}
      </div>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(event => event.startDate >= new Date())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 20);

    return (
      <div className="space-y-4">
        {upcomingEvents.map(event => (
          <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant="outline"
                      className={EVENT_TYPES.find(t => t.value === event.eventType)?.color}
                    >
                      {EVENT_TYPES.find(t => t.value === event.eventType)?.label}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={PRIORITY_LEVELS.find(p => p.value === event.priority)?.color}
                    >
                      {PRIORITY_LEVELS.find(p => p.value === event.priority)?.label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees.length} attendees</span>
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setEventForm(event);
                      setShowEventDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Event Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => exportCalendar('ics')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={resetEventForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedEvent ? 'Edit Event' : 'Create New Event'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter event title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate">Start Date & Time</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={eventForm.startDate?.toISOString().slice(0, 16)}
                        onChange={(e) => setEventForm(prev => ({ 
                          ...prev, 
                          startDate: new Date(e.target.value) 
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date & Time</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={eventForm.endDate?.toISOString().slice(0, 16)}
                        onChange={(e) => setEventForm(prev => ({ 
                          ...prev, 
                          endDate: new Date(e.target.value) 
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="eventType">Event Type</Label>
                      <Select 
                        value={eventForm.eventType} 
                        onValueChange={(value) => setEventForm(prev => ({ ...prev, eventType: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={eventForm.priority} 
                        onValueChange={(value) => setEventForm(prev => ({ ...prev, priority: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_LEVELS.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter event location"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter event description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="col-span-2 flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={selectedEvent ? handleUpdateEvent : handleCreateEvent}>
                        {selectedEvent ? 'Update Event' : 'Create Event'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('today')}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <h2 className="text-xl font-semibold">
              {view.type === 'month' && view.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {view.type === 'week' && `Week of ${view.currentDate.toLocaleDateString()}`}
              {view.type === 'day' && view.currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {view.type === 'agenda' && 'Upcoming Events'}
            </h2>
            
            <div className="flex space-x-1">
              {(['month', 'week', 'day', 'agenda'] as const).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view.type === viewType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView(prev => ({ ...prev, type: viewType }))}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar Filters */}
          {showFilters && (
            <Alert className="mb-6">
              <Filter className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label>Event Types</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {EVENT_TYPES.map(type => (
                        <Badge
                          key={type.value}
                          variant={filters.eventTypes.includes(type.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              eventTypes: prev.eventTypes.includes(type.value)
                                ? prev.eventTypes.filter(t => t !== type.value)
                                : [...prev.eventTypes, type.value]
                            }));
                          }}
                        >
                          {type.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Priority Levels</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {PRIORITY_LEVELS.map(priority => (
                        <Badge
                          key={priority.value}
                          variant={filters.priorities.includes(priority.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              priorities: prev.priorities.includes(priority.value)
                                ? prev.priorities.filter(p => p !== priority.value)
                                : [...prev.priorities, priority.value]
                            }));
                          }}
                        >
                          {priority.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>External Sync</Label>
                    <div className="flex space-x-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncWithExternalCalendar('google')}
                      >
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncWithExternalCalendar('outlook')}
                      >
                        Outlook
                      </Button>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Calendar Content */}
          {loading ? (
            <div className="text-center py-8">Loading calendar...</div>
          ) : (
            <div>
              {view.type === 'month' && renderMonthView()}
              {view.type === 'agenda' && renderAgendaView()}
              {(view.type === 'week' || view.type === 'day') && (
                <div className="text-center py-8 text-muted-foreground">
                  {view.type.charAt(0).toUpperCase() + view.type.slice(1)} view implementation coming soon
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {events.filter(e => e.eventType === 'booking').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Bookings</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.startDate >= new Date() && e.startDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {events.filter(e => e.priority === 'urgent' || e.priority === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {events.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
