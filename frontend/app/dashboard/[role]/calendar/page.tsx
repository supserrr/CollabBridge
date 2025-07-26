"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'event' | 'meeting' | 'deadline' | 'personal';
  status: 'confirmed' | 'tentative' | 'cancelled';
  location?: string;
  attendees?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  }[];
  isAllDay: boolean;
  color: string;
}

const eventTypeColors = {
  event: 'bg-blue-500',
  meeting: 'bg-green-500',
  deadline: 'bg-red-500',
  personal: 'bg-purple-500'
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await fetch(`/api/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and upcoming events</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: 'month' | 'week' | 'day') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowEventModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setCurrentDate(new Date())}
          className="gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b">
                {dayNames.map(day => (
                  <div key={day} className="p-4 text-center font-medium text-muted-foreground border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-32 border-r border-b last:border-r-0" />;
                  }

                  const dayEvents = getEventsForDate(day);
                  const isCurrentDay = isToday(day);
                  const isSelectedDay = isSelected(day);

                  return (
                    <motion.div
                      key={day.toISOString()}
                      className={cn(
                        "h-32 border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-muted/50 transition-colors",
                        isCurrentDay && "bg-primary/10",
                        isSelectedDay && "bg-primary/20"
                      )}
                      onClick={() => setSelectedDate(day)}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isCurrentDay && "text-primary font-bold"
                      )}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <motion.div
                            key={event.id}
                            className={cn(
                              "text-xs p-1 rounded truncate text-white cursor-pointer",
                              eventTypeColors[event.type] || 'bg-gray-500'
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {event.title}
                          </motion.div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Events</span>
                <Badge variant="secondary">{events.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Week</span>
                <Badge variant="secondary">
                  {events.filter(e => {
                    const eventDate = new Date(e.date);
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return eventDate >= weekStart && eventDate <= weekEnd;
                  }).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmed</span>
                <Badge variant="default">
                  {events.filter(e => e.status === 'confirmed').length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-3 h-3 rounded-full", eventTypeColors[event.type])} />
                        <span className="font-medium text-sm">{event.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.isAllDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {getEventsForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No events on this day
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events
                  .filter(event => new Date(event.date) >= new Date())
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", eventTypeColors[event.type])} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => {
            setSelectedEvent(null);
            // Open edit modal
          }}
          onDelete={(eventId) => {
            setEvents(prev => prev.filter(e => e.id !== eventId));
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onAdd={(newEvent) => {
          setEvents(prev => [...prev, newEvent]);
          setShowEventModal(false);
        }}
        selectedDate={selectedDate}
      />
    </div>
    </DashboardLayout>
  );
}

// Event Detail Modal Component
function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", eventTypeColors[event.type])} />
            {event.title}
          </DialogTitle>
          <DialogDescription>
            {new Date(event.date).toLocaleDateString()} • {event.isAllDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {event.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {event.type}
            </Badge>
          </div>

          {event.attendees && event.attendees.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Attendees</Label>
              <div className="flex items-center gap-2 mt-2">
                {event.attendees.slice(0, 3).map(attendee => (
                  <Avatar key={attendee.id} className="h-6 w-6">
                    <AvatarImage src={attendee.avatar} />
                    <AvatarFallback className="text-xs">
                      {attendee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {event.attendees.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{event.attendees.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onEdit(event)} className="gap-2">
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(event.id)} className="gap-2">
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Event Modal Component
function AddEventModal({
  isOpen,
  onClose,
  onAdd,
  selectedDate
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: CalendarEvent) => void;
  selectedDate: Date | null;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    type: "event" as 'event' | 'meeting' | 'deadline' | 'personal',
    location: "",
    isAllDay: false
  });

  const handleSubmit = () => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      ...formData,
      status: 'confirmed',
      color: eventTypeColors[formData.type],
      attendees: []
    };
    
    onAdd(newEvent);
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "10:00",
      type: "event",
      location: "",
      isAllDay: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new calendar event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'event' | 'meeting' | 'deadline' | 'personal') => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!formData.isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Event location"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isAllDay">All day event</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
