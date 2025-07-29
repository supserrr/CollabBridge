"use client"

import Image from 'next/image'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Calendar, 
  Eye,
  Heart,
  MessageSquare,
  Check,
  Users,
  UserCheck,
  ChevronDown,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ProfileCard } from "@/components/ui/profile-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FloatingCreateButton } from "@/components/ui/floating-create-button";
import { useAuth } from "@/hooks/use-auth-firebase";
import { auth } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Professional data structure interface - standardized across the app
 * Matches the interface used in the main professionals page
 */
interface Professional {
  id: number
  name: string
  title: string
  company: string
  location: string
  rating: number
  reviews: number
  hourlyRate: string
  skills: string[]
  avatar: string
  verified: boolean
  responseTime: string
  completedProjects: number
  description: string
  availability: string
  portfolioImages?: string[]
}

/**
 * Filter state interface for professionals filtering
 */
interface FilterState {
  category: string;
  location: string;
  minRating: number;
  maxRate: number;
  availability: string;
  skills: string[];
}

/**
 * API Response interface for professionals endpoint
 */
interface ProfessionalsResponse {
  professionals: Professional[]
  total: number
  page: number
  pages: number
  filters: {
    skillCategories?: string[]
    locations?: string[]
    availabilityOptions?: string[]
  }
}

export default function BrowseProfessionals() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    location: "",
    minRating: 0,
    maxRate: 1000,
    availability: "",
    skills: []
  });

  const categories = [
    "Photographer", "Videographer", "DJ", "MC/Host", "Decorator", 
    "Caterer", "Event Coordinator", "Makeup Artist", "Florist", "Security"
  ];

  const availabilityOptions = ["Available", "Busy"];
  const skillsOptions = [
    "Wedding Photography", "Corporate Events", "Music Production", 
    "Event Planning", "Floral Design", "Audio/Visual", "Lighting Design"
  ];

  useEffect(() => {
    if (user && auth.currentUser) {
      fetchProfessionals();
    }
  }, [user]);

  useEffect(() => {
    if (user && auth.currentUser) {
      fetchProfessionals();
    }
  }, [searchQuery, filters]);

  // Handle professional actions
  const handleContactProfessional = (professionalId: number) => {
    // TODO: Implement contact functionality
    console.log('Contact professional:', professionalId);
  };

  const handleViewProfile = (professionalId: number) => {
    // TODO: Navigate to professional profile page
    console.log('View profile:', professionalId);
  };

  const handleSaveProfile = (professionalId: number) => {
    toggleFavorite(professionalId.toString());
  };

  const fetchProfessionals = async (page = 1) => {
    if (!user || !auth.currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = await auth.currentUser.getIdToken();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
        ...(filters.maxRate < 1000 && { maxRate: filters.maxRate.toString() }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') }),
      });

      const response = await fetch(`/api/professionals?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch professionals: ${response.statusText}`);
      }
      
      const data: ProfessionalsResponse = await response.json();
      setProfessionals(data.professionals || []);
      setTotal(data.total || 0);
      setCurrentPage(data.page || 1);
      setTotalPages(data.pages || 1);
      
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setError(error instanceof Error ? error.message : 'Failed to load professionals');
      setProfessionals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (professionalId: string) => {
    if (!auth.currentUser) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      const isFavorited = favorites.includes(professionalId);
      
      const response = await fetch(`/api/saved-professionals/${professionalId}`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setFavorites(prev => 
          isFavorited 
            ? prev.filter(id => id !== professionalId)
            : [...prev, professionalId]
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Fetch saved professionals on load
  useEffect(() => {
    const fetchSavedProfessionals = async () => {
      if (!user || !auth.currentUser) return;
      
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch('/api/saved-professionals', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        }
      } catch (error) {
        console.error('Error fetching saved professionals:', error);
      }
    };

    fetchSavedProfessionals();
  }, [user]);

  const sendBookingRequest = async (professionalId: string, message: string) => {
    if (!auth.currentUser) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          recipientId: professionalId, 
          content: message,
          messageType: 'BOOKING_REQUEST'
        })
      });
      
      if (response.ok) {
        // Show success message or redirect
        console.log('Booking request sent successfully');
      }
    } catch (error) {
      console.error('Error sending booking request:', error);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col space-y-8 p-8">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Browse Professionals</h2>
                <p className="text-muted-foreground">
                  Find and connect with creative professionals for your events
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <Skeleton className="h-48 w-full" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Browse Professionals</h1>
                <p className="text-muted-foreground">Find the perfect creative professionals for your event</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, skills, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-muted/50 p-6 rounded-lg space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select value={filters.minRating.toString()} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, minRating: parseInt(value) }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Rate Filter */}
            <div className="space-y-2">
              <Label>Max Hourly Rate: ${filters.maxRate}</Label>
              <Slider
                value={[filters.maxRate]}
                onValueChange={([value]) => setFilters(prev => ({ ...prev, maxRate: value }))}
                max={1000}
                min={0}
                step={50}
                className="w-full"
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {availabilityOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => setFilters({
              category: "",
              location: "",
              minRating: 0,
              maxRate: 1000,
              availability: "",
              skills: []
            })}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </motion.div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {professionals.length} of {total} professionals
        </p>
        <Select defaultValue="relevance">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Most Relevant</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="rate-low">Lowest Rate</SelectItem>
            <SelectItem value="rate-high">Highest Rate</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Professionals Grid */}
      <div className="flex flex-wrap justify-center gap-8">
        {professionals.map((professional: Professional) => (
          <ProfileCard 
            key={professional.id}
            professional={professional}
            onContact={(id) => handleContactProfessional(id)}
            onViewProfile={(id) => handleViewProfile(id)}
            onSaveProfile={(id) => handleSaveProfile(id)}
            isSaved={favorites.includes(professional.id.toString())}
          />
        ))}
      </div>

      {professionals.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No professionals found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </div>
      )}
          </div>
        </div>
      </SidebarInset>
      <FloatingCreateButton />
    </SidebarProvider>
  );
}

// Booking Request Dialog Component
function BookingRequestDialog({ 
  professional, 
  onSendRequest 
}: { 
  professional: Professional;
  onSendRequest: (professionalId: string, message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendRequest(professional.id.toString(), message);
      setMessage("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <MessageSquare className="h-3 w-3" />
          Book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Booking Request</DialogTitle>
          <DialogDescription>
            Send a booking request to {professional.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={professional.avatar} />
              <AvatarFallback>{professional.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{professional.name}</p>
              <p className="text-sm text-muted-foreground">${professional.hourlyRate}/hr</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell them about your event and requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!message.trim()}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
