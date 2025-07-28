"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';
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
  Upload,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  location: {
    venue: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  budget: {
    total: number;
    currency: string;
  };
  guestCount: number;
  images: string[];
  requirements: {
    category: string;
    description: string;
    budget: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  preferences: {
    style: string[];
    themes: string[];
    specialRequests: string;
  };
  isPublic: boolean;
  isFeatured: boolean;
  applicationDeadline: Date | null;
}

const eventTypes = [
  { value: "WEDDING", label: "Wedding" },
  { value: "CORPORATE", label: "Corporate Event" },
  { value: "BIRTHDAY", label: "Birthday Party" },
  { value: "CONCERT", label: "Concert" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "OTHER", label: "Other" }
];

const professionalCategories = [
  { id: "photographer", label: "Photographer", icon: Camera },
  { id: "videographer", label: "Videographer", icon: Camera },
  { id: "dj", label: "DJ/Music", icon: Music },
  { id: "mc", label: "MC/Host", icon: Mic },
  { id: "decorator", label: "Decorator", icon: Palette },
  { id: "caterer", label: "Caterer", icon: Utensils },
  { id: "security", label: "Security", icon: Shield },
];

const eventStyles = [
  "Modern", "Classic", "Rustic", "Elegant", "Casual", "Formal",
  "Vintage", "Bohemian", "Minimalist", "Luxury", "Outdoor", "Indoor"
];

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function CreateEvent({ params }: PageProps) {
  const { username } = use(params);
  const { user, loading } = useAuth();

  // Authentication and authorization check
  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/signin';
        return;
      }
      
      if (user.username !== username) {
        window.location.href = `/${user.username}/dashboard/events/create`;
        return;
      }
      
      if (user.role !== 'EVENT_PLANNER') {
        window.location.href = `/${user.username}/dashboard`;
        return;
      }
    }
  }, [user, loading, username]);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "",
    date: null,
    startTime: "09:00", // Default start time
    endTime: "17:00",   // Default end time
    location: {
      venue: "",
      address: "",
      city: "",
      state: "",
      zipCode: ""
    },
    budget: {
      total: 0,
      currency: "USD"
    },
    guestCount: 0,
    images: [],
    requirements: [],
    preferences: {
      style: [],
      themes: [],
      specialRequests: ""
    },
    isPublic: true,
    isFeatured: false,
    applicationDeadline: null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        alert('Please log in to upload images');
        return;
      }

      console.log('Uploading files:', files.length, 'files');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        console.log('Adding file:', file.name, file.type, file.size);
        formData.append('files', file);
      });

      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/multiple`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        
        // Extract URLs from the response
        const uploadedUrls = result.files ? result.files.map((file: any) => file.url) : [];
        console.log('Extracted URLs:', uploadedUrls);
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        
        alert(`Successfully uploaded ${uploadedUrls.length} images!`);
      } else {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(`Failed to upload images: ${(error as Error).message || 'Please try again.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        {
          category: "",
          description: "",
          budget: 0,
          priority: "medium"
        }
      ]
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const handleSubmit = async () => {
    console.log('Form submission started');
    console.log('Current form data:', formData);
    
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.eventType || !formData.date || !formData.startTime || !formData.endTime) {
        const missingFields = [];
        if (!formData.title) missingFields.push('title');
        if (!formData.description) missingFields.push('description');
        if (!formData.eventType) missingFields.push('event type');
        if (!formData.date) missingFields.push('date');
        if (!formData.startTime) missingFields.push('start time');
        if (!formData.endTime) missingFields.push('end time');
        
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      console.log('Validation passed, proceeding with submission');

      // Get Firebase token using the same pattern as the API
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      console.log('User authenticated:', firebaseUser.uid);
      
      // Transform form data to match backend API expectations
      // Convert date to YYYY-MM-DD format if it's a Date object
      let dateStr = '';
      if (formData.date instanceof Date) {
        dateStr = formData.date.toISOString().split('T')[0];
      } else if (typeof formData.date === 'string') {
        dateStr = formData.date;
      } else {
        throw new Error('Please select a valid event date');
      }
      
      if (!dateStr || !formData.startTime || !formData.endTime) {
        throw new Error('Date and time fields are required');
      }
      
      // Ensure time format is HH:MM
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
        throw new Error('Please enter valid time in HH:MM format');
      }
      
      const startDateTime = new Date(`${dateStr}T${formData.startTime}:00.000Z`);
      const endDateTime = new Date(`${dateStr}T${formData.endTime}:00.000Z`);
      
      // Validate the created dates
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error('Invalid date or time format');
      }
      
      // Ensure end time is after start time
      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time');
      }
      
      const startDateTimeISO = startDateTime.toISOString();
      const endDateTimeISO = endDateTime.toISOString();
      
      console.log('Date transformation:', {
        originalDate: formData.date,
        dateStr,
        startTime: formData.startTime,
        endTime: formData.endTime,
        startDateTime: startDateTimeISO,
        endDateTime: endDateTimeISO
      });
      
      // Extract required roles from requirements
      const requiredRoles = formData.requirements.map(req => req.category).filter(Boolean);
      
      // Ensure at least one required role (backend validation requires min 1)
      if (requiredRoles.length === 0) {
        requiredRoles.push('photographer'); // Default to photographer if none selected
      }
      
      console.log('Required roles:', requiredRoles);
      
      const apiData = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType, // Already in correct enum format
        startDate: startDateTimeISO,
        endDate: endDateTimeISO,
        location: formData.location.venue || formData.location.address || formData.location.city,
        address: `${formData.location.address}, ${formData.location.city}, ${formData.location.state} ${formData.location.zipCode}`.trim(),
        budget: formData.budget.total,
        currency: formData.budget.currency,
        requiredRoles: requiredRoles,
        tags: [...formData.preferences.style, ...formData.preferences.themes].filter(Boolean),
        maxApplicants: formData.guestCount || undefined,
        isPublic: formData.isPublic,
        images: formData.images,
        requirements: formData.preferences.specialRequests || undefined,
        deadlineDate: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : undefined,
      };
      
      console.log('Sending event data to API:', apiData);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/events`);
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Event created successfully:', result);
        alert('Event created successfully!');
        // Redirect to events dashboard or show success message
        window.location.href = `/${username}/dashboard/planner`;
      } else {
        const errorData = await response.json();
        console.error('Error creating event:', errorData);
        alert(`Failed to create event: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${(error as Error).message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: "Basic Information", icon: Calendar },
    { id: 2, title: "Location & Date", icon: MapPin },
    { id: 3, title: "Requirements", icon: Users },
    { id: 4, title: "Preferences", icon: Palette },
    { id: 5, title: "Review & Publish", icon: CheckCircle }
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
          <p className="text-muted-foreground">Post your event and find creative professionals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Progress Steps */}
        <div className="w-80 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{step.title}</p>
                    </div>
                    {isCompleted && <CheckCircle className="h-4 w-4" />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    
                    <div className="space-y-4">
                      {/* Event Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter your event title..."
                          className="text-lg"
                        />
                      </div>

                      {/* Event Type */}
                      <div className="space-y-2">
                        <Label>Event Type *</Label>
                        <Select 
                          value={formData.eventType} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Event Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your event in detail..."
                          rows={6}
                        />
                      </div>

                      {/* Event Images */}
                      <div className="space-y-2">
                        <Label>Event Images</Label>
                        <div className="space-y-4">
                          {/* Upload Button */}
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                              disabled={isUploading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              disabled={isUploading}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {isUploading ? 'Uploading...' : 'Upload Images'}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Add photos to showcase your event
                            </span>
                          </div>

                          {/* Image Preview Grid */}
                          {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {formData.images.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image}
                                    alt={`Event image ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Guest Count and Budget */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Expected Guest Count</Label>
                          <Input
                            type="number"
                            value={formData.guestCount}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              guestCount: parseInt(e.target.value) || 0 
                            }))}
                            placeholder="Number of guests"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Budget ($)</Label>
                          <Input
                            type="number"
                            value={formData.budget.total}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              budget: { ...prev.budget, total: parseInt(e.target.value) || 0 }
                            }))}
                            placeholder="Total budget"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Location & Date */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Location & Date</h2>
                    
                    <div className="space-y-4">
                      {/* Venue Information */}
                      <div className="space-y-2">
                        <Label>Venue Name</Label>
                        <Input
                          value={formData.location.venue}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, venue: e.target.value }
                          }))}
                          placeholder="Enter venue name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={formData.location.address}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, address: e.target.value }
                          }))}
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={formData.location.city}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, city: e.target.value }
                            }))}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={formData.location.state}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, state: e.target.value }
                            }))}
                            placeholder="State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP Code</Label>
                          <Input
                            value={formData.location.zipCode}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, zipCode: e.target.value }
                            }))}
                            placeholder="ZIP"
                          />
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Event Date *</Label>
                          <Input
                            type="date"
                            value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              date: e.target.value ? new Date(e.target.value) : null 
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              startTime: e.target.value 
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              endTime: e.target.value 
                            }))}
                          />
                        </div>
                      </div>

                      {/* Application Deadline */}
                      <div className="space-y-2">
                        <Label>Application Deadline</Label>
                        <Input
                          type="date"
                          value={formData.applicationDeadline ? formData.applicationDeadline.toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            applicationDeadline: e.target.value ? new Date(e.target.value) : null 
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          When should professionals submit their applications by?
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Requirements */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Professional Requirements</h2>
                      <Button onClick={addRequirement} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Requirement
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.requirements.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mb-4">No requirements added yet</p>
                          <Button onClick={addRequirement} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Your First Requirement
                          </Button>
                        </div>
                      )}

                      {formData.requirements.map((requirement, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="font-medium">Requirement #{index + 1}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRequirement(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label>Professional Category</Label>
                                <Select 
                                  value={requirement.category} 
                                  onValueChange={(value) => updateRequirement(index, 'category', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {professionalCategories.map(category => (
                                      <SelectItem key={category.id} value={category.id}>
                                        <div className="flex items-center gap-2">
                                          <category.icon className="h-4 w-4" />
                                          {category.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Priority Level</Label>
                                <Select 
                                  value={requirement.priority} 
                                  onValueChange={(value) => updateRequirement(index, 'priority', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="high">High Priority</SelectItem>
                                    <SelectItem value="medium">Medium Priority</SelectItem>
                                    <SelectItem value="low">Low Priority</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <Label>Description & Requirements</Label>
                              <Textarea
                                value={requirement.description}
                                onChange={(e) => updateRequirement(index, 'description', e.target.value)}
                                placeholder="Describe what you need from this professional..."
                                rows={3}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Budget Allocation ($)</Label>
                              <Input
                                type="number"
                                value={requirement.budget}
                                onChange={(e) => updateRequirement(index, 'budget', parseInt(e.target.value) || 0)}
                                placeholder="Budget for this role"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Preferences */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Event Preferences</h2>
                    
                    <div className="space-y-6">
                      {/* Event Style */}
                      <div className="space-y-3">
                        <Label>Event Style (select all that apply)</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {eventStyles.map(style => (
                            <div key={style} className="flex items-center space-x-2">
                              <Checkbox
                                id={style}
                                checked={formData.preferences.style.includes(style)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      preferences: {
                                        ...prev.preferences,
                                        style: [...prev.preferences.style, style]
                                      }
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      preferences: {
                                        ...prev.preferences,
                                        style: prev.preferences.style.filter(s => s !== style)
                                      }
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={style} className="text-sm">{style}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Themes */}
                      <div className="space-y-2">
                        <Label>Themes (comma-separated)</Label>
                        <Input
                          value={formData.preferences.themes.join(', ')}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              themes: e.target.value.split(',').map(theme => theme.trim()).filter(Boolean)
                            }
                          }))}
                          placeholder="e.g., Garden Party, Vintage, Tropical"
                        />
                      </div>

                      {/* Special Requests */}
                      <div className="space-y-2">
                        <Label>Special Requests or Additional Information</Label>
                        <Textarea
                          value={formData.preferences.specialRequests}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              specialRequests: e.target.value
                            }
                          }))}
                          placeholder="Any special requirements, accessibility needs, or additional details..."
                          rows={4}
                        />
                      </div>

                      {/* Visibility Settings */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Visibility Settings</h3>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Public Event</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow all professionals to see and apply to this event
                            </p>
                          </div>
                          <Switch
                            checked={formData.isPublic}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                              ...prev, 
                              isPublic: checked 
                            }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Featured Event</Label>
                            <p className="text-sm text-muted-foreground">
                              Promote your event for better visibility (additional cost)
                            </p>
                          </div>
                          <Switch
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) => setFormData(prev => ({ 
                              ...prev, 
                              isFeatured: checked 
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review & Publish */}
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Review & Publish</h2>
                    
                    <div className="space-y-6">
                      {/* Event Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Event Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">{formData.title || "Untitled Event"}</h3>
                            <Badge variant="secondary">{formData.eventType}</Badge>
                          </div>
                          
                          <p className="text-muted-foreground">
                            {formData.description || "No description provided"}
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formData.date ? formData.date.toLocaleDateString() : "Date not set"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {formData.startTime} - {formData.endTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {formData.location.city}, {formData.location.state}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {formData.guestCount} guests
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              ${formData.budget.total} budget
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Final Actions */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">Ready to publish your event?</p>
                          <p className="text-sm text-muted-foreground">
                            Once published, professionals can start applying immediately
                          </p>
                        </div>
                        <Button 
                          onClick={handleSubmit} 
                          disabled={isSubmitting}
                          size="lg"
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {isSubmitting ? "Publishing..." : "Publish Event"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentStep >= step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  disabled={currentStep === 5}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
