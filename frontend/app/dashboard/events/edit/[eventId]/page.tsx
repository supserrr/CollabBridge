"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";
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
import { eventsApi } from "@/lib/api";

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
  "WEDDING", "CORPORATE", "BIRTHDAY", "CONCERT", "CONFERENCE", "OTHER"
];

const professionalCategories = [
  { id: "PHOTOGRAPHY", label: "Photographer", icon: Camera },
  { id: "VIDEOGRAPHY", label: "Videographer", icon: Camera },
  { id: "DJ", label: "DJ/Music", icon: Music },
  { id: "MC", label: "MC/Host", icon: Mic },
  { id: "DECORATION", label: "Decorator", icon: Palette },
  { id: "CATERING", label: "Caterer", icon: Utensils },
  { id: "SECURITY", label: "Security", icon: Shield },
];

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    maxApplicants: 0,
    isPublic: true,
    requirements: "",
    deadlineDate: "",
  });

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const data = await eventsApi.getEventById(eventId);
        
        // Convert event data to form format
        setFormData({
          title: data.title || "",
          description: data.description || "",
          eventType: data.eventType || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "",
          location: data.location || "",
          address: data.address || "",
          budget: data.budget || 0,
          currency: data.currency || "USD",
          requiredRoles: (data as any).requiredRoles || [],
          tags: data.tags || [],
          maxApplicants: (data as any).maxApplicants || 0,
          isPublic: data.isPublic !== false,
          requirements: data.requirements || "",
          deadlineDate: (data as any).deadlineDate ? new Date((data as any).deadlineDate).toISOString().slice(0, 16) : "",
        });
        
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      const token = await firebaseUser.getIdToken();
      
      // Prepare the update data
      const updateData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : null,
      };
      
      console.log('Updating event with data:', updateData);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Signal that an event was updated
        localStorage.setItem('eventUpdated', 'true');
        setSuccessMessage('Event updated successfully!');
        
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          router.push('/dashboard/planner/events');
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Error updating event:', errorData);
        
        // Show more specific error message
        const errorMessage = errorData.message || `Failed to update event (${response.status})`;
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRequiredRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.includes(role)
        ? prev.requiredRoles.filter(r => r !== role)
        : [...prev.requiredRoles, role]
    }));
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );
  
  if (error) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
            <p className="text-muted-foreground">Update your event details</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your event"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Date & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Venue</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event venue"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget & Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div>
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

              <div>
                <Label>Required Professionals</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {professionalCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={formData.requiredRoles.includes(category.id)}
                        onCheckedChange={() => toggleRequiredRole(category.id)}
                      />
                      <Label htmlFor={category.id} className="text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Event Tags</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {["outdoor", "indoor", "corporate", "wedding", "birthday", "concert", "festival", "exhibition", "conference", "workshop", "networking", "charity"].map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
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
                      <Label htmlFor={`tag-${tag}`} className="text-sm">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Additional Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Any specific requirements, skills, or equipment needed..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxApplicants">Max Applicants</Label>
                <Input
                  id="maxApplicants"
                  type="number"
                  value={formData.maxApplicants}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxApplicants: Number(e.target.value) }))}
                  placeholder="Unlimited"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
