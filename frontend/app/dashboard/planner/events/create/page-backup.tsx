"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

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
  "Wedding", "Corporate Event", "Birthday Party", "Anniversary", 
  "Conference", "Workshop", "Charity Event", "Product Launch",
  "Graduation", "Baby Shower", "Holiday Party", "Other"
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

export default function CreateEvent() {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "",
    date: null,
    startTime: "",
    endTime: "",
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
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.eventType || 
          !formData.date || !formData.startTime || !formData.endTime || 
          !formData.location.venue) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Import API and auth utilities
      const { eventsApi } = await import('@/lib/api');
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
        startDate: combineDateAndTime(formData.date, formData.startTime),
        endDate: combineDateAndTime(formData.date, formData.endTime),
        location: formData.location.venue,
        address: [
          formData.location.address,
          formData.location.city,
          formData.location.state,
          formData.location.zipCode
        ].filter(Boolean).join(', '),
        budget: formData.budget.total || undefined,
        currency: formData.budget.currency || 'USD',
        requiredRoles: formData.requirements.map(req => req.category) || [],
        tags: formData.preferences.themes || [],
        maxApplicants: undefined,
        isPublic: formData.isPublic !== false,
        requirements: formData.requirements.map(req => req.description).join('\n') || '',
        deadlineDate: formData.applicationDeadline?.toISOString() || undefined,
      };

      console.log('Creating event with data:', eventData);

      // Create the event using the API
      const response = await eventsApi.createEvent(eventData);
      
      console.log('Event created successfully:', response);
      alert('Event created successfully!');
      
      // Redirect to manage events page
      window.location.href = '/dashboard/planner/manage-events';
      
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Event data that failed:', {
        title: formData.title,
        eventType: mapEventType(formData.eventType),
        startDate: formData.date,
        endDate: formData.date,
        location: formData.location.venue
      });
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Try to parse more detailed error from API response
        if (error.message.includes('API Error:')) {
          try {
            // The error might contain JSON response details
            errorMessage = `API Error: ${error.message}`;
          } catch (e) {
            errorMessage = error.message;
          }
        }
      }
      
      alert(`Failed to create event: ${errorMessage}`);
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

  const combineDateAndTime = (date: Date | null, time: string): string => {
    if (!date || !time) {
      throw new Error('Date and time are required');
    }
    
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj.toISOString();
  };

  const steps = [
    { id: 1, title: "Basic Information", icon: Calendar },
    { id: 2, title: "Location & Date", icon: MapPin },
    { id: 3, title: "Requirements", icon: Users },
    { id: 4, title: "Preferences", icon: Palette },
    { id: 5, title: "Review & Publish", icon: CheckCircle }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Steps */}
        <div className="lg:col-span-1">
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
        <div className="lg:col-span-3">
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
                              <SelectItem key={type} value={type}>
                                {type}
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
    </DashboardLayout>
  );
}
