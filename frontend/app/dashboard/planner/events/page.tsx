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
  images: string[];
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
    images: [],
  });
  
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // File handling functions
  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`)
        return
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return
      }
      validFiles.push(file)
    })

    return validFiles
  }

  const handleFileSelection = (files: FileList) => {
    const validFiles = validateFiles(files)
    if (validFiles.length > 0) {
      setPreviewFiles(prev => [...prev, ...validFiles])
    }
  }

  const uploadSelectedFiles = async () => {
    if (previewFiles.length === 0) return

    setUploadingImages(true)
    try {
      const uploadPromises = previewFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Upload failed')
        }
        
        return await response.json()
      })

      const results = await Promise.all(uploadPromises)
      const newImageUrls = results.map(result => result.url)
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImageUrls]
      }))
      
      setPreviewFiles([])
      toast.success(`Successfully uploaded ${newImageUrls.length} image(s)`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

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
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        location: formData.location,
        address: formData.address || '',
        budget: formData.budget || undefined,
        currency: formData.currency || 'USD',
        requiredRoles: formData.requiredRoles || [],
        tags: formData.tags || [],
        maxApplicants: formData.maxApplicants || undefined,
        isPublic: formData.isPublic !== false,
        requirements: formData.requirements || '',
        deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : undefined,
        images: formData.images || [],
      };

      console.log('Creating event with data:', eventData);
      console.log('isPublic value:', eventData.isPublic);
      console.log('Form isPublic value:', formData.isPublic);
      console.log('Stringified event data:', JSON.stringify(eventData, null, 2));

      // Validate required fields
      if (!formData.title || !formData.description || !formData.eventType || 
          !formData.startDate || !formData.endDate || !formData.location) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Validate field lengths to match backend validation
      if (formData.title.trim().length < 3 || formData.title.trim().length > 100) {
        alert('Title must be between 3 and 100 characters');
        setIsSubmitting(false);
        return;
      }

      if (formData.description.trim().length < 10 || formData.description.trim().length > 2000) {
        alert('Description must be between 10 and 2000 characters');
        setIsSubmitting(false);
        return;
      }

      if (formData.location.trim().length < 2 || formData.location.trim().length > 100) {
        alert('Location must be between 2 and 100 characters');
        setIsSubmitting(false);
        return;
      }

      if (formData.address && formData.address.trim().length > 200) {
        alert('Address must be less than 200 characters');
        setIsSubmitting(false);
        return;
      }

      if (formData.currency && formData.currency.length !== 3) {
        alert('Currency must be exactly 3 characters (e.g., USD)');
        setIsSubmitting(false);
        return;
      }

      // Create or update the event
      let response;
      if (editingEvent) {
        // Update existing event
        console.log('Updating event:', editingEvent.id);
        response = await eventsApi.updateEvent(editingEvent.id, eventData);
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
      images: [],
    });
    setEditingEvent(null);
    setCurrentStep(1);
  };

  const startEdit = (event: Event) => {
    setEditingEvent(event);
    
    // Convert ISO dates to datetime-local format (YYYY-MM-DDTHH:MM)
    const formatDateForInput = (isoDate: string) => {
      if (!isoDate) return '';
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: formatDateForInput(event.startDate),
      endDate: formatDateForInput(event.endDate),
      location: event.location,
      address: event.address || "",
      budget: event.budget || 0,
      currency: event.currency || "USD",
      requiredRoles: event.requiredRoles || [],
      tags: event.tags || [],
      maxApplicants: event.maxApplicants,
      isPublic: event.isPublic,
      requirements: event.requirements || "",
      deadlineDate: event.deadlineDate ? formatDateForInput(event.deadlineDate) : "",
      images: event.images || [],
    });
    setCurrentView('edit');
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventsApi.deleteEvent(eventId);
      toast.success('Event deleted successfully!');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const publishEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to publish this event? It will become visible to creative professionals.')) return;
    
    try {
      console.log('Publishing event:', eventId);
      const response = await eventsApi.publishEvent(eventId);
      console.log('Publish response:', response);
      toast.success('Event published successfully!');
      await fetchEvents();
    } catch (error) {
      console.error('Error publishing event:', error);
      toast.error('Failed to publish event');
    }
  };

  // Direct upload without preview (for drag & drop)
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    // Validate files
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate progress for UX
        await new Promise(resolve => setTimeout(resolve, 500 + (index * 200)));
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to upload ${file.name}`);
        }
        
        const data = await response.json();
        return data.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  // Add image via URL
  const addImageByUrl = (url: string) => {
    if (url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
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
            <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden">
              {/* Event Image */}
              {event.images && event.images.length > 0 && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {event.status === 'DRAFT' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => publishEvent(event.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
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
                
                {/* Image thumbnails if multiple images */}
                {event.images && event.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {event.images.slice(1, 4).map((image, index) => (
                      <div key={index} className="flex-shrink-0">
                        <img
                          src={image}
                          alt={`${event.title} ${index + 2}`}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                    {event.images.length > 4 && (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-500">+{event.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}
                
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
                        placeholder="Enter event title (3-100 characters)"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={formData.title.length > 0 && formData.title.length < 3 ? 'border-red-300' : ''}
                      />
                      {formData.title.length > 0 && formData.title.length < 3 && (
                        <p className="text-sm text-red-600 mt-1">
                          Title must be at least 3 characters ({formData.title.length}/3)
                        </p>
                      )}
                      {formData.title.length >= 3 && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Title looks good ({formData.title.length}/100)
                        </p>
                      )}
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
                        placeholder="Describe your event in detail... (minimum 10 characters)"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className={formData.description.length > 0 && formData.description.length < 10 ? 'border-red-300' : ''}
                      />
                      {formData.description.length > 0 && formData.description.length < 10 && (
                        <p className="text-sm text-red-600 mt-1">
                          Description must be at least 10 characters ({formData.description.length}/10)
                        </p>
                      )}
                      {formData.description.length >= 10 && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ Description looks good ({formData.description.length}/2000)
                        </p>
                      )}
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
                    
                    {/* Modern Image Upload Section */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-semibold">Event Images</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add images to showcase your event. Drag & drop or click to browse.
                        </p>
                      </div>

                      {/* Upload Area */}
                      <div className="space-y-4">
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                            dragActive 
                              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          } ${uploadingImages ? 'pointer-events-none opacity-60' : ''}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => !uploadingImages && document.getElementById('file-upload')?.click()}
                        >
                          {/* Upload Icon and Text */}
                          <div className="space-y-4">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                              dragActive 
                                ? 'bg-blue-100 dark:bg-blue-900 scale-110' 
                                : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:scale-105'
                            }`}>
                              {uploadingImages ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              ) : (
                                <Upload className={`h-8 w-8 transition-all duration-300 ${
                                  dragActive ? 'text-blue-600 animate-bounce' : 'text-gray-400 group-hover:text-gray-600'
                                }`} />
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {uploadingImages ? 'Uploading images...' : 
                                 dragActive ? 'Drop your images here' : 'Upload Event Images'}
                              </h3>
                              
                              {!uploadingImages && (
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Drag and drop your images here, or{' '}
                                    <span className="text-blue-600 font-medium">browse files</span>
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    PNG, JPG, GIF up to 10MB each • Multiple files supported
                                  </p>
                                </div>
                              )}
                              
                              {uploadingImages && (
                                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hidden File Input */}
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileSelection(e.target.files);
                              }
                            }}
                            disabled={uploadingImages}
                          />
                        </div>

                        {/* File Preview Section */}
                        {previewFiles.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                Ready to Upload ({previewFiles.length} files)
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewFiles([])}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Clear
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {previewFiles.map((file, index) => (
                                <div key={index} className="relative group">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-white border-2 border-gray-200 dark:border-gray-600">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                                    <p className="truncate">{file.name}</p>
                                    <p>{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                                  </div>
                                  <button
                                    type="button"
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                    onClick={() => {
                                      setPreviewFiles(files => files.filter((_, i) => i !== index));
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-3">
                              <Button
                                type="button"
                                onClick={uploadSelectedFiles}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={uploadingImages}
                              >
                                {uploadingImages ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>Upload {previewFiles.length} Image{previewFiles.length > 1 ? 's' : ''}</>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPreviewFiles([])}
                                disabled={uploadingImages}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* URL Input Alternative */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or add by URL</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  const url = input.value.trim();
                                  if (url) {
                                    addImageByUrl(url);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => {
                              const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                              const url = input.value.trim();
                              if (url) {
                                addImageByUrl(url);
                                input.value = '';
                              }
                            }}
                          >
                            Add URL
                          </Button>
                        </div>
                      </div>

                      {/* Image Gallery */}
                      {formData.images.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              Selected Images ({formData.images.length})
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Clear All
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                  <img
                                    src={image}
                                    alt={`Event image ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS4zMzMzIDY2LjY2NjdIMTE0LjY2N1Y5My4zMzMzSDg1LjMzMzNWNjYuNjY2N1oiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCA4MEMxMDMuNjgyIDgwIDEwNi42NjcgNzcuMDE0NiAxMDYuNjY3IDczLjMzMzNDMTA2LjY2NyA2OS42NTIxIDEwMy42ODIgNjYuNjY2NyAxMDAgNjYuNjY2N0M5Ni4zMTc5IDY2LjY2NjcgOTMuMzMzMyA2OS42NTIxIDkzLjMzMzMgNzMuMzMzM0M5My4zMzMzIDc3LjAxNDYgOTYuMzE3OSA4MCAxMDAgODBaIiBmaWxsPSIjNjU3Mzg0Ii8+CjxwYXRoIGQ9Ik02Ni42NjY3IDUzLjMzMzNWMTQ2LjY2N0gxMzMuMzMzVjUzLjMzMzNINjYuNjY2N1pNODAgMTMzLjMzM0w5My4zMzMzIDEyMEwxMDYuNjY3IDEzMy4zMzNMMTIwIDExMy4zMzNWNjYuNjY2N0g4MFYxMzMuMzMzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                                    }}
                                  />
                                </div>
                                
                                {/* Remove Button */}
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      images: prev.images.filter((_, i) => i !== index)
                                    }));
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                
                                {/* Image Index */}
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
