"use client"

import { useEffect, useState } from "react";
import { Search, Filter, MapPin, Star, Calendar, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface BackendProfessional {
  _id: string;
  firebaseUid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  role: string;
  businessName?: string;
  businessType?: string;
  businessDescription?: string;
  experience?: string;
  serviceTypes?: string[];
  portfolioItems?: Array<{
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    createdAt: string;
  }>;
  rating?: number;
  location?: string;
  priceRange?: string;
  availabilityStatus?: string;
  completedProjects?: number;
  responseTime?: string;
  workingSince?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Professional {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  skills: string[];
  avatar: string;
  verified: boolean;
  responseTime: string;
  completedProjects: number;
  description: string;
  availability: string;
  portfolioImages?: string[];
}

// Transform backend professional data to ProfileCard format
const transformProfessional = (backendPro: BackendProfessional): Professional => {
  return {
    id: parseInt(backendPro._id.slice(-6), 16), // Convert hex to number for display
    name: `${backendPro.firstName} ${backendPro.lastName}`,
    title: backendPro.businessType || 'Professional',
    company: backendPro.businessName || 'Independent',
    location: backendPro.location || 'Location not specified',
    rating: backendPro.rating || 0,
    reviews: Math.floor(Math.random() * 50) + 5, // Placeholder since not in backend
    hourlyRate: backendPro.priceRange || 'Contact for pricing',
    skills: backendPro.serviceTypes || [],
    avatar: backendPro.profilePicture || '/placeholder-avatar.jpg',
    verified: backendPro.isEmailVerified,
    responseTime: backendPro.responseTime || 'Within 24 hours',
    completedProjects: backendPro.completedProjects || 0,
    description: backendPro.businessDescription || 'Professional service provider',
    availability: backendPro.availabilityStatus || 'Available',
    portfolioImages: backendPro.portfolioItems?.flatMap(item => item.images) || []
  };
};

export default function BrowseProfessionals() {
  const { user } = useAuth();
  const [backendProfessionals, setBackendProfessionals] = useState<BackendProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

  // Transform backend professionals to ProfileCard format
  const professionals = backendProfessionals.map(transformProfessional);

  const fetchProfessionals = async (page = 1) => {
    try {
      setLoading(true);
      const limit = 20;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { serviceType: filterType }),
        ...(locationFilter !== 'all' && { location: locationFilter }),
        ...(priceFilter !== 'all' && { priceRange: priceFilter }),
        ...(sortBy && { sortBy })
      });

      const response = await fetch(`${BACKEND_URL}/api/professionals?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch professionals: ${response.status}`);
      }

      const data = await response.json();
      
      if (page === 1) {
        setBackendProfessionals(data.professionals || []);
      } else {
        setBackendProfessionals(prev => [...prev, ...(data.professionals || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setError(null);
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError('Failed to load professionals. Please try again.');
      setBackendProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (professionalId: string) => {
    if (!user || !auth.currentUser) return;
    
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
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.professionals?.map((p: any) => p._id) || []);
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
        console.log('Booking request sent successfully');
      }
    } catch (error) {
      console.error('Error sending booking request:', error);
    }
  };

  // Load professionals on mount and when filters change
  useEffect(() => {
    fetchProfessionals(1);
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy, locationFilter, priceFilter]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProfessionals(nextPage);
    }
  };

  if (loading && professionals.length === 0) {
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
        <div className="flex flex-1 flex-col space-y-8 p-8">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Browse Professionals</h2>
              <p className="text-muted-foreground">
                Find and connect with creative professionals for your events
              </p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="videography">Videography</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="florals">Florals</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="recent">Recently Joined</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {professionals.length > 0 ? `Showing ${professionals.length} professionals` : 'No professionals found'}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {professionals.map((professional, index) => {
                const backendPro = backendProfessionals[index];
                return (
                  <ProfileCard
                    key={backendPro._id}
                    professional={professional}
                    onContact={(id) => console.log('Contact professional:', id)}
                    onViewProfile={(id) => console.log('View profile:', id)}
                    onSaveProfile={(id) => toggleFavorite(backendPro._id)}
                    isSaved={favorites.includes(backendPro._id)}
                  />
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button 
                  onClick={loadMore} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
      <FloatingCreateButton />
    </SidebarProvider>
  );
}
