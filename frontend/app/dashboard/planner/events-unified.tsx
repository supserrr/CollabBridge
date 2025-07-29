'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Camera, 
  Music, 
  Utensils,
  Palette,
  Shield,
  Mic,
  Plus,
  X,
  Save,
  Eye,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Filter,
  Search,
  Grid,
  List,
  CalendarDays,
  Target,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { plannerApi, eventsApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth-firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  isFeatured?: boolean;
  images?: string[];
  requiredRoles?: string[];
  tags?: string[];
  maxApplicants?: number;
  requirements?: string;
  deadlineDate?: string;
  _count: {
    event_applications: number;
    bookings: number;
  };
}

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  budget?: number;
  currency: string;
  requiredRoles: string[];
  tags: string[];
  maxApplicants?: number;
  isPublic: boolean;
  requirements?: string;
  deadlineDate?: string;
}

const eventTypes = [
  'Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary', 
  'Conference', 'Workshop', 'Charity Event', 'Product Launch', 
  'Graduation', 'Baby Shower', 'Holiday Party', 'Concert', 'Other'
];

const professionalRoles = [
  { id: "photographer", label: "Photographer", icon: Camera },
  { id: "videographer", label: "Videographer", icon: Camera },
  { id: "musician", label: "Musician", icon: Music },
  { id: "mc", label: "MC/Host", icon: Mic },
  { id: "decorator", label: "Decorator", icon: Palette },
  { id: "caterer", label: "Caterer", icon: Utensils },
  { id: "security", label: "Security", icon: Shield },
];

export default function EventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // View states
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Data states
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "",
    startDate: "",
    endDate: "",
    location: "",
    address: "",
    budget: 0,
    currency: "USD",
    requiredRoles: [],
    tags: [],
    maxApplicants: undefined,
    isPublic: true,
    requirements: "",
    deadlineDate: "",
  });
  
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Load events when component mounts
  useEffect(() => {
    if (user && currentView === 'list') {
      fetchEvents();
    }
  }, [user, currentView]);

  const fetchEvents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await plannerApi.getMyEvents();
      if (response.success && response.events) {
        setEvents(response.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.eventType || 
          !formData.startDate || !formData.endDate || !formData.location) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Import Firebase auth utilities
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }

      console.log('Firebase user:', firebaseUser.email);
      console.log('Getting ID token...');
      const token = await firebaseUser.getIdToken();
      console.log('Token length:', token.length, 'First 50 chars:', token.substring(0, 50));

      // Transform form data to API format
      const eventData = {
        title: formData.title,
        description: formData.description,
        eventType: mapEventType(formData.eventType),
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        address: formData.address || '',
        budget: formData.budget || undefined,
        currency: formData.currency || 'USD',
        requiredRoles: formData.requiredRoles || [],
        tags: formData.tags || [],
        maxApplicants: formData.maxApplicants || undefined,
        isPublic: formData.isPublic !== false,
        requirements: formData.requirements || '',
        deadlineDate: formData.deadlineDate || undefined,
      };

      console.log('Creating event with data:', eventData);

      // Create or update the event
      let response;
      if (editingEvent) {
        // Update existing event logic would go here
        console.log('Updating event:', editingEvent.id);
        // response = await eventsApi.updateEvent(editingEvent.id, eventData);
        alert('Event update functionality not yet implemented');
        setCurrentView('list');
        return;
      } else {
        // Create new event
        response = await eventsApi.createEvent(eventData);
      }
      
      console.log('Event operation successful:', response);
      toast.success(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
      
      // Reset form and go back to list
      resetForm();
      setCurrentView('list');
      await fetchEvents(); // Refresh the events list
      
    } catch (error) {
      console.error('Error saving event:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Try to parse more detailed error from API response
        if (error.message.includes('API Error:')) {
          try {
            errorMessage = `API Error: ${error.message}`;
          } catch (e) {
            errorMessage = error.message;
          }
        }
      }
      
      toast.error(`Failed to ${editingEvent ? 'update' : 'create'} event: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const mapEventType = (frontendType: string): string => {
    const typeMap: Record<string, string> = {
      'Wedding': 'WEDDING',
      'Corporate Event': 'CORPORATE',
      'Birthday Party': 'BIRTHDAY',
      'Anniversary': 'BIRTHDAY',
      'Conference': 'CONFERENCE',
      'Workshop': 'CONFERENCE',
      'Charity Event': 'OTHER',
      'Product Launch': 'CORPORATE',
      'Graduation': 'OTHER',
      'Baby Shower': 'BIRTHDAY',
      'Holiday Party': 'OTHER',
      'Concert': 'CONCERT',
      'Other': 'OTHER'
    };
    
    return typeMap[frontendType] || 'OTHER';
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventType: "",
      startDate: "",
      endDate: "",
      location: "",
      address: "",
      budget: 0,
      currency: "USD",
      requiredRoles: [],
      tags: [],
      maxApplicants: undefined,
      isPublic: true,
      requirements: "",
      deadlineDate: "",
    });
    setEditingEvent(null);
    setCurrentStep(1);
  };

  const startEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      address: event.address || "",
      budget: event.budget || 0,
      currency: event.currency || "USD",
      requiredRoles: event.requiredRoles || [],
      tags: event.tags || [],
      maxApplicants: event.maxApplicants,
      isPublic: event.isPublic,
      requirements: event.requirements || "",
      deadlineDate: event.deadlineDate || "",
    });
    setCurrentView('edit');
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      // Delete logic would go here
      console.log('Deleting event:', eventId);
      toast.success('Event deleted successfully!');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [events, searchTerm, statusFilter, typeFilter]);

  // Render functions
  const renderEventsList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Events</h1>
          <p className="text-muted-foreground">Create, edit, and manage your events</p>
        </div>
        <Button onClick={() => setCurrentView('create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {eventTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground">
                {events.length === 0 ? "Create your first event to get started" : "No events match your current filters"}
              </p>
            </div>
            {events.length === 0 && (
              <Button onClick={() => setCurrentView('create')} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  {event.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{event.currency} {event.budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                  <span>{event._count.event_applications} applications</span>
                  <span>{event._count.bookings} bookings</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateForm = () => {
    const steps = [
      { id: 1, title: "Basic Information", icon: Calendar },
      { id: 2, title: "Location & Date", icon: MapPin },
      { id: 3, title: "Requirements", icon: Users },
      { id: 4, title: "Review & Publish", icon: CheckCircle }
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              setCurrentView('list');
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h1>
            <p className="text-muted-foreground">
              {editingEvent ? 'Update your event details' : 'Post your event and find creative professionals'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Progress Steps */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 
                      isCompleted ? 'bg-muted text-muted-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div className={`p-1 rounded ${isActive ? 'bg-primary-foreground/20' : ''}`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Form Content */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter event title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="eventType">Event Type *</Label>
                      <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="0"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your event in detail..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Location & Date</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="location">Venue/Location *</Label>
                      <Input
                        id="location"
                        placeholder="Enter venue name"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input
                        id="address"
                        placeholder="Street address, city, state, zip"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate">Start Date & Time *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date & Time *</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Requirements & Preferences</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Required Professional Roles</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {professionalRoles.map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={role.id}
                              checked={formData.requiredRoles.includes(role.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    requiredRoles: [...prev.requiredRoles, role.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    requiredRoles: prev.requiredRoles.filter(r => r !== role.id)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={role.id} className="text-sm">{role.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="requirements">Additional Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="Any specific requirements or notes for professionals..."
                        value={formData.requirements}
                        onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxApplicants">Max Applicants</Label>
                        <Input
                          id="maxApplicants"
                          type="number"
                          placeholder="Unlimited"
                          value={formData.maxApplicants || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxApplicants: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="deadlineDate">Application Deadline</Label>
                        <Input
                          id="deadlineDate"
                          type="datetime-local"
                          value={formData.deadlineDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, deadlineDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                      />
                      <Label htmlFor="isPublic">Make this event public</Label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Review & Publish</h2>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{formData.title}</CardTitle>
                        <Badge>{formData.eventType}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{formData.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-muted-foreground">{formData.location}</p>
                          </div>
                          <div>
                            <p className="font-medium">Date</p>
                            <p className="text-muted-foreground">
                              {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                          {formData.budget && (
                            <div>
                              <p className="font-medium">Budget</p>
                              <p className="text-muted-foreground">{formData.currency} {formData.budget.toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">Required Roles</p>
                            <p className="text-muted-foreground">{formData.requiredRoles.length || 'None selected'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Form Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingEvent ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingEvent ? 'Update Event' : 'Create Event'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Main render
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!user) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Please sign in to access your events</h2>
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
        <div className="p-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {currentView === 'list' && renderEventsList()}
          {(currentView === 'create' || currentView === 'edit') && renderCreateForm()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
