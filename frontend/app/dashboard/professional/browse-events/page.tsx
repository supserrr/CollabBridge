"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Search,
  Filter,
  Heart,
  Eye,
  Send,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/hooks/use-auth-firebase";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  date: string;
  location: string;
  budget: number;
  guestCount: number;
  clientName: string;
  clientAvatar: string;
  clientRating: number;
  requirements: string[];
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  applicationsCount: number;
  maxApplications?: number;
  isUrgent: boolean;
  isFeatured: boolean;
  postedDate: string;
  deadline: string;
}

export default function BrowseEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [appliedEvents, setAppliedEvents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    eventType: "all",
    location: "",
    minBudget: 0,
    maxBudget: 10000,
    dateRange: "all",
    priority: [] as string[],
    requirements: [] as string[]
  });

  const eventTypes = ["Wedding", "Corporate", "Birthday", "Conference", "Other"];
  const requirementTypes = ["Photography", "Videography", "DJ", "Catering", "Decoration"];

  useEffect(() => {
    fetchEvents();
    fetchUserPreferences();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, filters]);

  const fetchEvents = async () => {
    try {
      // Get Firebase token using the same pattern as the API
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        console.error('Failed to fetch events:', response.statusText);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [favoritesRes, appliedRes] = await Promise.all([
        fetch('/api/user/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/user/applications', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const favoritesData = await favoritesRes.json();
      const appliedData = await appliedRes.json();
      
      setFavorites(favoritesData.map((f: any) => f.eventId));
      setAppliedEvents(appliedData.map((a: any) => a.eventId));
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Event type filter
    if (filters.eventType && filters.eventType !== "all") {
      filtered = filtered.filter(event => event.eventType === filters.eventType);
    }

    // Budget filter
    filtered = filtered.filter(event => 
      event.budget >= filters.minBudget && event.budget <= filters.maxBudget
    );

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const eventDate = new Date();
      
      switch (filters.dateRange) {
        case "week":
          eventDate.setDate(now.getDate() + 7);
          break;
        case "month":
          eventDate.setMonth(now.getMonth() + 1);
          break;
        case "quarter":
          eventDate.setMonth(now.getMonth() + 3);
          break;
      }
      
      filtered = filtered.filter(event => 
        new Date(event.date) <= eventDate && new Date(event.date) >= now
      );
    }

    setFilteredEvents(filtered);
  };

  const toggleFavorite = async (eventId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const isFavorited = favorites.includes(eventId);
      
      await fetch(`/api/events/${eventId}/favorite`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      setFavorites(prev => 
        isFavorited 
          ? prev.filter(id => id !== eventId)
          : [...prev, eventId]
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const submitApplication = async (eventId: string, message: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/events/${eventId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      setAppliedEvents(prev => [...prev, eventId]);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Events</h1>
          <p className="text-muted-foreground">Find events that match your skills and interests</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events by title, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredEvents.length}</div>
              <p className="text-sm text-muted-foreground">Events Available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-muted/50 p-6 rounded-lg space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={filters.eventType} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, eventType: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, dateRange: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Any Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Next 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget Range: ${filters.minBudget} - ${filters.maxBudget}</Label>
              <Slider
                value={[filters.minBudget, filters.maxBudget]}
                onValueChange={([min, max]) => setFilters(prev => ({ 
                  ...prev, 
                  minBudget: min, 
                  maxBudget: max 
                }))}
                max={10000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const isApplied = appliedEvents.includes(event.id);
          const isFavorited = favorites.includes(event.id);
          const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          
          return (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-200 group-hover:border-primary/50">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={event.clientAvatar} />
                        <AvatarFallback>
                          {event.clientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{event.clientName}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{event.clientRating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.isFeatured && (
                        <Badge variant="default" className="text-xs">Featured</Badge>
                      )}
                      {event.isUrgent && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(event.id)}
                        className="p-1"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            isFavorited 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <Badge variant="outline" className="mt-1">{event.eventType}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {daysUntilEvent > 0 ? `${daysUntilEvent} days` : 'Today'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.guestCount} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>${event.budget} budget</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {event.requirements.slice(0, 2).map((req, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {event.requirements.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{event.requirements.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      {event.applicationsCount} applications
                      {event.maxApplications && ` / ${event.maxApplications} max`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Deadline: {new Date(event.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    
                    {isApplied ? (
                      <Button variant="default" size="sm" className="flex-1 gap-1" disabled>
                        <CheckCircle className="h-3 w-3" />
                        Applied
                      </Button>
                    ) : (
                      <ApplicationDialog
                        event={event}
                        onSubmit={(message) => submitApplication(event.id, message)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || Object.values(filters).some(f => f !== "" && f !== 0 && (!Array.isArray(f) || f.length > 0))
              ? "Try adjusting your search criteria or filters"
              : "Check back later for new events"
            }
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setFilters({
              eventType: "all",
              location: "",
              minBudget: 0,
              maxBudget: 10000,
              dateRange: "all",
              priority: [],
              requirements: []
            });
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}

// Application Dialog Component
function ApplicationDialog({ 
  event, 
  onSubmit 
}: { 
  event: Event;
  onSubmit: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 gap-1">
          <Send className="h-3 w-3" />
          Apply
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to Event</DialogTitle>
          <DialogDescription>
            Submit your application for "{event.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={event.clientAvatar} />
                <AvatarFallback>{event.clientName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{event.clientName}</p>
                <p className="text-xs text-muted-foreground">{event.eventType}</p>
              </div>
            </div>
            <p className="text-sm">{event.title}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="application-message">Your Message</Label>
            <Textarea
              id="application-message"
              placeholder="Tell the client why you're the perfect fit for this event..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Make your application stand out with a personalized message
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!message.trim()}>
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
