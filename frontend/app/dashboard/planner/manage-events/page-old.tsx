"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { plannerApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth-firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function ManageEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating/editing events
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

  // Dashboard stats
  const [stats, setStats] = useState<{
    totalEvents: number;
    activeEvents: number;
    totalApplications: number;
    pendingApplications: number;
    totalBudget: number;
    avgRating: number;
  }>({
    totalEvents: 0,
    activeEvents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalBudget: 0,
    avgRating: 0
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchStats();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await plannerApi.getMyEvents();
      setEvents(response.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (user?.username) {
        const response = await plannerApi.getDashboardStats(user.username);
        setStats({
          totalEvents: Number(response.totalEvents) || 0,
          activeEvents: Number(response.activeEvents) || 0,
          totalApplications: Number(response.totalApplications) || 0,
          pendingApplications: Number(response.pendingApplications) || 0,
          totalBudget: Number(response.totalBudget) || 0,
          avgRating: Number(response.avgRating) || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Keep default values on error
    }
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
      maxApplicants: 0,
      isPublic: true,
      requirements: "",
      deadlineDate: "",
    });
  };

  const handleCreateEvent = () => {
    resetForm();
    setEditingEvent(null);
    setShowCreateForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setFormData({
      title: event.title || "",
      description: event.description || "",
      eventType: event.eventType || "",
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      location: event.location || "",
      address: event.address || "",
      budget: event.budget || 0,
      currency: event.currency || "USD",
      requiredRoles: event.requiredRoles || [],
      tags: event.tags || [],
      maxApplicants: event.maxApplicants || 0,
      isPublic: event.isPublic !== false,
      requirements: event.requirements || "",
      deadlineDate: event.deadlineDate ? new Date(event.deadlineDate).toISOString().slice(0, 16) : "",
    });
    setEditingEvent(event);
    setShowCreateForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        setError('You must be logged in to delete events.');
        return;
      }

      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to delete event (${res.status})`);
      }
      
      setEvents(events.filter(e => e.id !== eventId));
      setError(null);
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      const token = await firebaseUser.getIdToken();
      const url = editingEvent 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/events/${editingEvent.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/events`;
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const updateData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : null,
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents(); // Refresh events list
        fetchStats(); // Refresh stats
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save event');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save event');
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            
            {/* Header Section with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
                <p className="text-muted-foreground">Manage all your events and track performance</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleCreateEvent} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Calendar
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  My Events
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Bento Grid Layout - Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
                  
                  {/* Total Events */}
                  <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border p-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Total Events</p>
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalEvents || 0}</h2>
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          All time
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Events created</p>
                  </div>
                  
                  {/* Active Events */}
                  <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border p-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Active Events</p>
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.activeEvents || 0}</h2>
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          Currently running
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Live events</p>
                  </div>
                  
                  {/* Total Applications */}
                  <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 rounded-xl border p-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Applications</p>
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalApplications || 0}</h2>
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          +22.3%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">From professionals</p>
                  </div>
                  
                  {/* Total Budget */}
                  <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-xl border p-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <DollarSign className="h-4 w-4 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">${(stats.totalBudget || 0).toLocaleString()}</h2>
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                          Across all events
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Budget allocated</p>
                  </div>
                </div>

                {/* Recent Events Section */}
                <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-950 rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Recent Events</h3>
                      <p className="text-sm text-muted-foreground">Your latest events and their status</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("events")}>
                      View All
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">No events yet</h4>
                      <p className="text-muted-foreground mb-4">Create your first event to get started</p>
                      <Button onClick={handleCreateEvent}>Create Event</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.slice(0, 5).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {event._count.event_applications} applications
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(event.startDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Link href={`/dashboard/events/${event.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Events Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== "ALL" 
                    ? "Try adjusting your search or filters"
                    : "Create your first event to get started"
                  }
                </p>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {event.description.length > 100 
                              ? `${event.description.substring(0, 100)}...`
                              : event.description
                            }
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(event.budget || 0, event.currency)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event._count.event_applications} applications</span>
                        </div>
                      </div>
                      
                      {event.requiredRoles && event.requiredRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.requiredRoles.slice(0, 3).map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {event.requiredRoles.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{event.requiredRoles.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditEvent(event)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Performance</CardTitle>
                  <CardDescription>Applications and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                      <p>Analytics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Budget Analysis</CardTitle>
                  <CardDescription>Spending patterns and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                      <p>Budget analytics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

          </div>
        </div>
      </SidebarInset>

      {/* Create/Edit Event Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogDescription>
              {editingEvent ? 'Update your event details' : 'Fill in the details to create a new event'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>
              
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
            </div>

            {/* Date & Location */}
            <div className="space-y-4">
              <h3 className="font-medium">Date & Location</h3>
              
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
            </div>

            {/* Budget & Requirements */}
            <div className="space-y-4">
              <h3 className="font-medium">Budget & Requirements</h3>
              
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
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Settings</h3>
              
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
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForm} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
