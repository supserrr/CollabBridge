"use client"

import Image from 'next/image'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardBanner } from "@/components/dashboard/dashboard-banner";
import { motion } from "framer-motion";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface PageProps {
  params: {
    username: string;
  };
}

interface Professional {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  location: string;
  skills: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  isVerified: boolean;
  followers: number;
  following: number;
  portfolioImages: string[];
  responseTime: string;
  completedProjects: number;
}

interface FilterState {
  category: string;
  location: string;
  minRating: number;
  maxRate: number;
  availability: string[];
  experience: number[];
  skills: string[];
}

interface PageProps {
  params: {
    username: string;
  };
}

export default function BrowseProfessionals({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    location: "",
    minRating: 0,
    maxRate: 1000,
    availability: [],
    experience: [0, 10],
    skills: []
  });

  const categories = [
    "Photographer", "Videographer", "DJ", "MC/Host", "Decorator", 
    "Caterer", "Event Coordinator", "Makeup Artist", "Florist", "Security"
  ];

  const availabilityOptions = ["available", "busy", "unavailable"];
  const skillsOptions = [
    "Wedding Photography", "Corporate Events", "Music Production", 
    "Event Planning", "Floral Design", "Audio/Visual", "Lighting Design"
  ];

  useEffect(() => {
    if (!authLoading && user) {
      // Verify the username matches the logged-in user
      if (user.username !== params.username) {
        router.push(`/${user.username}/dashboard/browse-professionals`);
        return;
      }
    } else if (!authLoading && !user) {
      router.push('/signin');
      return;
    }
    
    if (user) {
      fetchProfessionals();
      loadSavedProfessionals();
    }
  }, [user, authLoading, router, params.username]);

  useEffect(() => {
    applyFilters();
  }, [professionals, searchQuery, filters, showSavedOnly, favorites]);

  const fetchProfessionals = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/professionals/browse', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProfessionals(data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = professionals;

    // Show only saved professionals if that tab is selected
    if (showSavedOnly) {
      filtered = filtered.filter(prof => favorites.includes(prof.id));
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(prof => 
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(prof => prof.title.includes(filters.category));
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(prof => prof.rating >= filters.minRating);
    }

    // Rate filter
    filtered = filtered.filter(prof => prof.hourlyRate <= filters.maxRate);

    // Availability filter
    if (filters.availability.length > 0) {
      filtered = filtered.filter(prof => filters.availability.includes(prof.availability));
    }

    // Experience filter
    filtered = filtered.filter(prof => 
      prof.experience >= filters.experience[0] && prof.experience <= filters.experience[1]
    );

    setFilteredProfessionals(filtered);
  };

  const toggleFavorite = async (professionalId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const isSaved = favorites.includes(professionalId);
      
      const response = await fetch(`/api/saved-professionals/${professionalId}`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFavorites(prev => 
          isSaved 
            ? prev.filter(id => id !== professionalId)
            : [...prev, professionalId]
        );
      } else {
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const loadSavedProfessionals = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/saved-professionals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const savedIds = await response.json();
        setFavorites(savedIds);
      }
    } catch (error) {
      console.error('Error loading saved professionals:', error);
    }
  };

  const sendBookingRequest = async (professionalId: string, message: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/bookings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ professionalId, message })
      });
      // Show success message
    } catch (error) {
      console.error('Error sending booking request:', error);
    }
  };

  if (loading || authLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <DashboardLayout>
      <DashboardBanner 
        title="Browse Professionals"
        subtitle="Find the perfect creative professionals for your event"
      >
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </DashboardBanner>
      
      <div className="space-y-6 p-6">
      {/* Tabs for All vs Saved Professionals */}
      <Tabs value={showSavedOnly ? "saved" : "all"} onValueChange={(value) => setShowSavedOnly(value === "saved")}>
        <TabsList>
          <TabsTrigger value="all">All Professionals</TabsTrigger>
          <TabsTrigger value="saved">Saved Professionals ({favorites.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-6">
          {/* Search Bar for Saved */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search saved professionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </TabsContent>
      </Tabs>

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

            {/* Experience Filter */}
            <div className="space-y-2">
              <Label>Experience: {filters.experience[0]}-{filters.experience[1]} years</Label>
              <Slider
                value={filters.experience}
                onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <Label>Availability</Label>
            <div className="flex gap-4">
              {availabilityOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={filters.availability.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters(prev => ({ 
                          ...prev, 
                          availability: [...prev.availability, option] 
                        }));
                      } else {
                        setFilters(prev => ({ 
                          ...prev, 
                          availability: prev.availability.filter(a => a !== option) 
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={option} className="capitalize">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => setFilters({
              category: "",
              location: "",
              minRating: 0,
              maxRate: 1000,
              availability: [],
              experience: [0, 10],
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
          Showing {filteredProfessionals.length} of {professionals.length} professionals
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProfessionals.map((professional) => (
          <motion.div
            key={professional.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={professional.avatar} />
                    <AvatarFallback>{professional.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{professional.name}</h3>
                      {professional.isVerified && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{professional.title}</p>
                  </div>
                  {user && user.role === 'EVENT_PLANNER' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(professional.id)}
                      className="p-1"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.includes(professional.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {professional.bio}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {professional.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {professional.experience}yr exp
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{professional.rating}</span>
                    <span className="text-xs text-muted-foreground">({professional.reviewCount})</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {professional.availability}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold">${professional.hourlyRate}/hr</span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={professional.avatar} />
                              <AvatarFallback>{professional.name[0]}</AvatarFallback>
                            </Avatar>
                            {professional.name}
                            {professional.isVerified && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </DialogTitle>
                          <DialogDescription>
                            {professional.title} • {professional.location}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">About</h4>
                            <p className="text-sm text-muted-foreground">{professional.bio}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {professional.skills.map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="font-semibold">{professional.completedProjects}</div>
                              <div className="text-xs text-muted-foreground">Projects</div>
                            </div>
                            <div>
                              <div className="font-semibold">{professional.responseTime}</div>
                              <div className="text-xs text-muted-foreground">Response Time</div>
                            </div>
                            <div>
                              <div className="font-semibold">{professional.rating}/5</div>
                              <div className="text-xs text-muted-foreground">Rating</div>
                            </div>
                          </div>
                          
                          {professional.portfolioImages.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Portfolio</h4>
                              <div className="grid grid-cols-3 gap-2">
                                {professional.portfolioImages.slice(0, 6).map((image, idx) => (
                                  <img
                                    key={idx}
                                    src={image}
                                    alt={`Portfolio ${idx + 1}`}
                                    className="aspect-square object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {user && user.role === 'EVENT_PLANNER' ? (
                      <BookingRequestDialog 
                        professional={professional}
                        onSendRequest={sendBookingRequest}
                      />
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => window.location.href = '/signin'}
                        className="gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Sign in to Contact
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProfessionals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {showSavedOnly ? "No saved professionals" : "No professionals found"}
            </h3>
            <p>
              {showSavedOnly 
                ? "You haven't saved any professionals yet. Browse all professionals to save your favorites!"
                : "Try adjusting your search criteria or filters"
              }
            </p>
            {showSavedOnly && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowSavedOnly(false)}
              >
                Browse All Professionals
              </Button>
            )}
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
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
      onSendRequest(professional.id, message);
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
