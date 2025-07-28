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
  Activity
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
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { plannerApi, eventsApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth-firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { uploadMultipleImages, isCloudinaryConfigured, getCloudinaryStatus } from '@/lib/cloudinary-utils';

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
  images?: string[];
}

const eventTypes = [
  { value: 'PHOTO_SHOOT', label: 'Photo Shoot', icon: Camera },
  { value: 'MUSIC_PERFORMANCE', label: 'Music Performance', icon: Music },
  { value: 'CATERING', label: 'Catering', icon: Utensils },
  { value: 'ART_EXHIBITION', label: 'Art Exhibition', icon: Palette },
  { value: 'SECURITY', label: 'Security', icon: Shield },
  { value: 'LIVE_PERFORMANCE', label: 'Live Performance', icon: Mic },
];

const availableRoles = [
  'PHOTOGRAPHER', 'VIDEOGRAPHER', 'MUSICIAN', 'CHEF', 'WAITER', 'ARTIST', 
  'SECURITY_GUARD', 'EVENT_COORDINATOR', 'SOUND_TECHNICIAN', 'LIGHTING_TECHNICIAN'
];

const availableTags = [
  'outdoor', 'indoor', 'corporate', 'wedding', 'birthday', 'concert', 'festival', 
  'exhibition', 'conference', 'workshop', 'networking', 'charity'
];

const professionalCategories = [
  { id: "PHOTOGRAPHER", label: "Photographer", icon: Camera },
  { id: "VIDEOGRAPHER", label: "Videographer", icon: Camera },
  { id: "MUSICIAN", label: "Musician", icon: Music },
  { id: "CHEF", label: "Chef", icon: Utensils },
  { id: "WAITER", label: "Waiter", icon: Users },
  { id: "ARTIST", label: "Artist", icon: Palette },
  { id: "SECURITY_GUARD", label: "Security Guard", icon: Shield },
  { id: "EVENT_COORDINATOR", label: "Event Coordinator", icon: Users },
  { id: "SOUND_TECHNICIAN", label: "Sound Technician", icon: Mic },
  { id: "LIGHTING_TECHNICIAN", label: "Lighting Technician", icon: Palette },
];

const currencyOptions = [
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
  { value: 'GBP', label: '£' },
  { value: 'JPY', label: '¥' },
];

export default function ManageEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Check Cloudinary configuration
  const cloudinaryStatus = getCloudinaryStatus();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: '',
    startDate: '',
    endDate: '',
    location: '',
    address: '',
    budget: 0,
    currency: 'USD',
    requiredRoles: [],
    tags: [],
    maxApplicants: undefined,
    isPublic: true,
    requirements: '',
    deadlineDate: '',
    images: [],
  });

  console.log('ManageEventsPage - Component mounted');
  console.log('ManageEventsPage - Environment check:', {
    'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
    'user': user,
    'userRole': user?.role,
    'loading': loading
  });
  console.log('ManageEventsPage - Current user:', user);
  console.log('ManageEventsPage - User role:', user?.role);

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      console.log('Fetch events - firebaseUser:', firebaseUser?.email);
      console.log('Fetch events - user state:', user?.email);
      
      if (!firebaseUser) {
        console.log('No Firebase user found');
        setError('Please sign in to view your events. If you already have an account, try refreshing the page.');
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      
      console.log('Fetching events from API...');
      console.log('User role from state:', user?.role);
      
      // Try to fetch user's events first (requires EVENT_PLANNER role)
      const myEventsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('My events response status:', myEventsResponse.status);
      
      if (myEventsResponse.ok) {
        const data = await myEventsResponse.json();
        console.log('My events response data:', data);
        
        // Backend returns { success: true, events, pagination }
        if (data.success && Array.isArray(data.events)) {
          console.log('Setting user events:', data.events);
          setEvents(data.events);
          setError(null); // Clear any previous errors
        } else {
          console.log('Fallback: setting events as array:', data);
          setEvents(Array.isArray(data) ? data : []);
        }
      } else if (myEventsResponse.status === 403) {
        // User doesn't have EVENT_PLANNER role, try to fetch public events instead
        console.log('User does not have EVENT_PLANNER role, fetching public events as fallback');
        
        try {
          const publicEventsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
          
          if (publicEventsResponse.ok) {
            const publicData = await publicEventsResponse.json();
            console.log('Public events response:', publicData);
            
            if (publicData.success && Array.isArray(publicData.events)) {
              setEvents(publicData.events);
              setError('Showing public events. Sign in as an Event Planner to manage your own events.');
            } else {
              setEvents([]);
              setError('You need to be an Event Planner to manage events. Please update your profile or contact support.');
            }
          } else {
            setError('You need to be an Event Planner to manage events. Please update your profile or contact support.');
          }
        } catch (fallbackErr) {
          console.error('Error fetching public events:', fallbackErr);
          setError('You need to be an Event Planner to manage events. Please update your profile or contact support.');
        }
      } else if (myEventsResponse.status === 401) {
        // Authentication failed, try public events
        console.log('Authentication failed, fetching public events as fallback');
        
        try {
          const publicEventsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
          
          if (publicEventsResponse.ok) {
            const publicData = await publicEventsResponse.json();
            console.log('Public events response:', publicData);
            
            if (publicData.success && Array.isArray(publicData.events)) {
              setEvents(publicData.events);
              setError('Please sign in to see your personal events. Showing public events for now.');
            } else {
              setEvents([]);
              setError('Authentication failed. Please sign in to view your events.');
            }
          } else {
            setError('Authentication failed. Please sign in to view your events.');
          }
        } catch (fallbackErr) {
          console.error('Error fetching public events:', fallbackErr);
          setError('Authentication failed. Please sign in to view your events.');
        }
      } else {
        console.error('Failed to fetch my events, status:', myEventsResponse.status);
        const errorText = await myEventsResponse.text();
        console.error('Error response:', errorText);
        setError('Failed to fetch events. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - user:', user);
    
    // Always try to fetch events, even if user is null (auth might be working but state not updated)
    fetchEvents();
    
    if (!user) {
      console.log('No user found - setting loading to false to show sign-in message after fetch attempt');
      // Don't set loading to false immediately, let fetchEvents try first
    }
  }, [user]);

  // Image upload functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedImages(prev => [...prev, ...files]);

    // Create preview URLs for new uploads
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrls(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventType: '',
      startDate: '',
      endDate: '',
      location: '',
      address: '',
      budget: 0,
      currency: 'USD',
      requiredRoles: [],
      tags: [],
      maxApplicants: undefined,
      isPublic: true,
      requirements: '',
      deadlineDate: '',
      images: [],
    });
    setSelectedImages([]);
    setImageUrls([]);
    setEditingEvent(null);
  };

  // Handle create event
  const handleCreateEvent = async () => {
    if (!user) {
      toast.error('You must be logged in to create events.');
      return;
    }

    if (!formData.title || !formData.description || !formData.eventType || !formData.startDate || !formData.endDate || !formData.location) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrls: string[] = [];

      // Upload images to Cloudinary if any
      if (selectedImages.length > 0) {
        // Check Cloudinary configuration first
        const cloudinaryStatus = getCloudinaryStatus();
        if (!cloudinaryStatus.configured) {
          toast.error(`Cloudinary not configured: ${cloudinaryStatus.issues.join(', ')}`);
          setLoading(false);
          return;
        }

        setUploadingImages(true);
        try {
          uploadedImageUrls = await uploadMultipleImages(selectedImages, {
            folder: 'events',
            uploadPreset: 'ml_default',
            onProgress: (completed, total) => {
              console.log(`Upload progress: ${completed}/${total}`);
            }
          });
          
          console.log(`Successfully uploaded ${uploadedImageUrls.length} images`);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error occurred';
          toast.error(`Failed to upload images: ${errorMessage}`);
          setUploadingImages(false);
          setLoading(false);
          return;
        }
        setUploadingImages(false);
      }

      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        toast.error('You must be logged in to create events.');
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      
      // Ensure dates are properly formatted as ISO strings
      const eventData = {
        ...formData,
        images: uploadedImageUrls,
        budget: formData.budget || undefined,
        maxApplicants: formData.maxApplicants || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : undefined,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [newEvent, ...prev]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success('Event created successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create event. Please try again.');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit event
  const handleEditEvent = async () => {
    if (!user || !editingEvent) {
      toast.error('You must be logged in to edit events.');
      return;
    }

    if (!formData.title || !formData.description || !formData.eventType || !formData.startDate || !formData.endDate || !formData.location) {
      toast.error('Please fill in all required fields.');
      return;
    }

    console.log('=== EVENT UPDATE DEBUG START ===');
    console.log('Edit Event Debug:', {
      editingEventId: editingEvent.id,
      editingEventTitle: editingEvent.title,
      existingImages: editingEvent.images || [],
      selectedImagesCount: selectedImages.length,
      imageUrlsCount: imageUrls.length,
      formDataImages: formData.images || []
    });
    console.log('User info:', { 
      userId: user.id, 
      userEmail: user.email, 
      userRole: user.role 
    });
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    setLoading(true);
    try {
      let finalImageUrls: string[] = [];

      // Start with existing images from the event
      if (editingEvent.images) {
        finalImageUrls = [...editingEvent.images];
      }

      // Upload new images if any
      if (selectedImages.length > 0) {
        // Check Cloudinary configuration first
        const cloudinaryStatus = getCloudinaryStatus();
        if (!cloudinaryStatus.configured) {
          toast.error(`Cloudinary not configured: ${cloudinaryStatus.issues.join(', ')}`);
          setLoading(false);
          return;
        }

        setUploadingImages(true);
        try {
          const uploadedImageUrls = await uploadMultipleImages(selectedImages, {
            folder: 'events',
            uploadPreset: 'ml_default',
            onProgress: (completed, total) => {
              console.log(`Upload progress: ${completed}/${total}`);
            }
          });
          
          finalImageUrls = [...finalImageUrls, ...uploadedImageUrls];
          console.log(`Successfully uploaded ${uploadedImageUrls.length} images`);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error occurred';
          toast.error(`Failed to upload images: ${errorMessage}`);
          setUploadingImages(false);
          setLoading(false);
          return;
        }
        setUploadingImages(false);
      }

      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        toast.error('You must be logged in to edit events.');
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      
      // Ensure dates are properly formatted as ISO strings
      const eventData = {
        ...formData,
        images: finalImageUrls,
        budget: formData.budget || undefined,
        maxApplicants: formData.maxApplicants || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : undefined,
      };

      console.log('Sending update request to:', `${process.env.NEXT_PUBLIC_API_URL}/api/events/${editingEvent.id}`);
      console.log('Event data being sent:', eventData);
      console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      console.log('Update response status:', response.status);
      console.log('Update response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const updatedEvent = await response.json();
        console.log('Update successful:', updatedEvent);
        setEvents(prev => prev.map(event => event.id === editingEvent.id ? updatedEvent : event));
        setIsEditDialogOpen(false);
        resetForm();
        toast.success(`Event "${editingEvent.title}" updated successfully! Images: ${finalImageUrls.length}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Update failed:', response.status, errorData);
        toast.error(`Update failed (${response.status}): ${errorData.error || 'Please try again'}`);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setLoading(true);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        toast.error('You must be logged in to delete events.');
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        toast.success('Event deleted successfully!');
      } else {
        toast.error('Failed to delete event. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      location: event.location,
      address: event.address || '',
      budget: event.budget || 0,
      currency: event.currency,
      requiredRoles: event.requiredRoles || [],
      tags: event.tags || [],
      maxApplicants: event.maxApplicants,
      isPublic: event.isPublic,
      requirements: event.requirements || '',
      deadlineDate: event.deadlineDate ? new Date(event.deadlineDate).toISOString().slice(0, 16) : '',
      images: event.images || [],
    });
    // Show existing images
    setImageUrls(event.images || []);
    setSelectedImages([]);
    setIsEditDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (event: Event) => {
    setViewingEvent(event);
    setIsViewDialogOpen(true);
  };

  // Close view dialog
  const closeViewDialog = () => {
    setViewingEvent(null);
    setIsViewDialogOpen(false);
  };

  // Filter events with enhanced safety checks
  const filteredEvents = useMemo(() => {
    console.log('Filtering events - events:', events, 'length:', events?.length);
    
    if (!Array.isArray(events)) {
      console.warn('Events is not an array:', typeof events, events);
      return [];
    }
    
    return events.filter((event: Event) => {
      if (!event) return false;
      
      const matchesSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (event.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [events, searchTerm, statusFilter, typeFilter]);

  // Utility functions
  const getStatusColor = (status: string | undefined | null) => {
    if (!status) {
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
    
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

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number | undefined | null, currency: string | undefined | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount);
    } catch (error) {
      return `$${amount}`;
    }
  };

  if (loading && !user) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading user authentication...</p>
                </div>
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
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Manage Events</h1>
                <p className="text-muted-foreground">Create, edit, and manage your events</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    console.log('Testing API connection...');
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
                      const data = await response.json();
                      console.log('API test response:', data);
                      alert(`API connected! Found ${data.events?.length || 0} public events`);
                    } catch (err) {
                      console.error('API test failed:', err);
                      alert('API connection failed: ' + err);
                    }
                  }}
                >
                  Test API
                </Button>
                <Button onClick={openCreateDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
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
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Events Grid/List */}
            {filteredEvents.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
                <p className="text-muted-foreground">No events match your current filters.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredEvents.map((event) => (
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
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status ? event.status.replace('_', ' ') : 'Unknown'}
                        </Badge>
                        <Badge variant="outline">
                          {event.eventType ? event.eventType.replace('_', ' ') : 'Unknown'}
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
                          <DollarSign className="h-4 w-4" />
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
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openViewDialog(event)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(event)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
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

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event..."
                rows={3}
              />
            </div>

            {/* Event Images Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <Label>Event Images</Label>
                {!cloudinaryStatus.configured && (
                  <Badge variant="destructive" className="text-xs">
                    Upload Disabled
                  </Badge>
                )}
              </div>
              
              {!cloudinaryStatus.configured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Image upload is currently disabled. Cloudinary configuration required.</span>
                  </div>
                </div>
              )}
              
              <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 ${!cloudinaryStatus.configured ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upload high-quality images to showcase your event
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                      disabled={!cloudinaryStatus.configured}
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview Grid */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Event image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address (optional)"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Required Professionals */}
            <div className="space-y-3">
              <Label>Required Professionals</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {professionalCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`create-${category.id}`}
                      checked={formData.requiredRoles.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            requiredRoles: [...prev.requiredRoles, category.id]
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            requiredRoles: prev.requiredRoles.filter(r => r !== category.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`create-${category.id}`} className="text-sm flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Tags */}
            <div className="space-y-3">
              <Label>Event Tags</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`create-tag-${tag}`}
                      checked={formData.tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            tags: [...prev.tags, tag]
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            tags: prev.tags.filter(t => t !== tag)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`create-tag-${tag}`} className="text-sm">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Any specific requirements, skills, or equipment needed..."
                rows={3}
              />
            </div>

            {/* Event Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxApplicants">Max Applicants</Label>
                <Input
                  id="maxApplicants"
                  type="number"
                  value={formData.maxApplicants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxApplicants: Number(e.target.value) || undefined }))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlineDate">Application Deadline</Label>
                <Input
                  id="deadlineDate"
                  type="datetime-local"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadlineDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="isPublic">Make this event public</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={loading || uploadingImages}>
              {uploadingImages ? 'Uploading Images...' : loading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              {editingEvent ? `Update "${editingEvent.title}" event details and settings` : 'Update event details and settings'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
            <div><strong>Mode:</strong> {editingEvent ? `Editing "${editingEvent.title}"` : 'Creating new event'}</div>
            <div><strong>Existing Images:</strong> {editingEvent?.images?.length || 0}</div>
            <div><strong>New Images:</strong> {selectedImages.length}</div>
            <div><strong>Total Preview URLs:</strong> {imageUrls.length}</div>
          </div>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Event Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-eventType">Event Type *</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event..."
                rows={3}
              />
            </div>

            {/* Event Images Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <Label>Event Images</Label>
                {!cloudinaryStatus.configured && (
                  <Badge variant="destructive" className="text-xs">
                    Upload Disabled
                  </Badge>
                )}
              </div>
              
              {!cloudinaryStatus.configured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Image upload is currently disabled. Cloudinary configuration required.</span>
                  </div>
                </div>
              )}
              
              <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 ${!cloudinaryStatus.configured ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upload additional images or replace existing ones
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                      disabled={!cloudinaryStatus.configured}
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview Grid */}
              {imageUrls.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Event Images ({imageUrls.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {/* Show if this is an existing or new image */}
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                          {index < (editingEvent?.images?.length || 0) ? 'Existing' : 'New'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date & Time *</Label>
                <Input
                  id="edit-startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date & Time *</Label>
                <Input
                  id="edit-endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Full Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address (optional)"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-budget">Budget</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Required Professionals */}
            <div className="space-y-3">
              <Label>Required Professionals</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {professionalCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${category.id}`}
                      checked={formData.requiredRoles.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            requiredRoles: [...prev.requiredRoles, category.id]
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            requiredRoles: prev.requiredRoles.filter(r => r !== category.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`edit-${category.id}`} className="text-sm flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Tags */}
            <div className="space-y-3">
              <Label>Event Tags</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-tag-${tag}`}
                      checked={formData.tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            tags: [...prev.tags, tag]
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            tags: prev.tags.filter(t => t !== tag)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`edit-tag-${tag}`} className="text-sm">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="space-y-2">
              <Label htmlFor="edit-requirements">Additional Requirements</Label>
              <Textarea
                id="edit-requirements"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Any specific requirements, skills, or equipment needed..."
                rows={3}
              />
            </div>

            {/* Event Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-maxApplicants">Max Applicants</Label>
                <Input
                  id="edit-maxApplicants"
                  type="number"
                  value={formData.maxApplicants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxApplicants: Number(e.target.value) || undefined }))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deadlineDate">Application Deadline</Label>
                <Input
                  id="edit-deadlineDate"
                  type="datetime-local"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadlineDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="edit-isPublic">Make this event public</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEvent} disabled={loading || uploadingImages}>
              {uploadingImages ? 'Uploading Images...' : loading ? 'Updating...' : 'Update Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Event Details
            </DialogTitle>
            <DialogDescription>
              View complete information about this event
            </DialogDescription>
          </DialogHeader>

          {viewingEvent && (
            <div className="space-y-6">
              {/* Event Images */}
              {viewingEvent.images && viewingEvent.images.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewingEvent.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-lg font-medium">{viewingEvent.title}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{viewingEvent.description}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                    <Badge variant="outline" className="mt-1">
                      {viewingEvent.eventType ? viewingEvent.eventType.replace('_', ' ') : 'Unknown'}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(viewingEvent.status)}>
                      {viewingEvent.status ? viewingEvent.status.replace('_', ' ') : 'Unknown'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Details</h3>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{viewingEvent.location}</p>
                    </div>
                    {viewingEvent.address && (
                      <p className="text-sm text-muted-foreground mt-1">{viewingEvent.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        {formatDate(viewingEvent.startDate)} - {formatDate(viewingEvent.endDate)}
                      </p>
                    </div>
                  </div>

                  {viewingEvent.budget && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Budget</label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {formatCurrency(viewingEvent.budget, viewingEvent.currency)}
                        </p>
                      </div>
                    </div>
                  )}

                  {viewingEvent.deadlineDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Application Deadline</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{formatDate(viewingEvent.deadlineDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements & Roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewingEvent.requiredRoles && viewingEvent.requiredRoles.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Required Roles</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewingEvent.requiredRoles.map((role, index) => (
                        <Badge key={index} variant="secondary">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {viewingEvent.tags && viewingEvent.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewingEvent.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {viewingEvent.requirements && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Requirements</label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{viewingEvent.requirements}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{viewingEvent._count?.event_applications || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{viewingEvent._count?.bookings || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Bookings</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{viewingEvent.maxApplicants || 'No limit'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Max Applicants</p>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${viewingEvent.isPublic ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">{viewingEvent.isPublic ? 'Public Event' : 'Private Event'}</span>
                </div>
                
                {viewingEvent.isFeatured && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Featured Event</span>
                  </div>
                )}
              </div>

              {/* Created By */}
              {viewingEvent.event_planners && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Event Planner</label>
                  <div className="flex items-center gap-3 mt-2">
                    {viewingEvent.event_planners.users?.avatar ? (
                      <img
                        src={viewingEvent.event_planners.users.avatar}
                        alt={viewingEvent.event_planners.users.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{viewingEvent.event_planners.users?.name}</p>
                      <p className="text-xs text-muted-foreground">{viewingEvent.event_planners.users?.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeViewDialog}>
              Close
            </Button>
            <Button onClick={() => {
              closeViewDialog();
              if (viewingEvent) openEditDialog(viewingEvent);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
