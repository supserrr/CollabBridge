'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Plus,
  Grid3X3,
  List,
  SlidersHorizontal,
  Clock,
  DollarSign,
  Eye,
  Heart,
  Share2,
  Camera,
  Music,
  Palette,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiHelpers } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  budget_min: number;
  budget_max: number;
  required_skills: string[];
  status: 'open' | 'in-progress' | 'completed';
  applicants_count: number;
  created_by: string;
  created_at: string;
  image_url?: string;
  featured?: boolean;
  urgent?: boolean;
}

const eventCategories = [
  { id: 'all', name: 'All Events', icon: Grid3X3, count: 0 },
  { id: 'photography', name: 'Photography', icon: Camera, count: 0 },
  { id: 'music', name: 'Music & DJ', icon: Music, count: 0 },
  { id: 'decoration', name: 'Decoration', icon: Palette, count: 0 },
  { id: 'videography', name: 'Videography', icon: Camera, count: 0 },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'budget_high', label: 'Highest Budget' },
  { value: 'budget_low', label: 'Lowest Budget' },
  { value: 'deadline', label: 'Deadline Soon' },
  { value: 'popular', label: 'Most Popular' },
];

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiHelpers.get('/events');
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             event.required_skills.some(skill => 
                               skill.toLowerCase().includes(selectedCategory.toLowerCase())
                             );
      const matchesPrice = event.budget_min >= priceRange[0] && event.budget_max <= priceRange[1];
      const matchesLocation = !locationFilter || 
                             event.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
    });

    // Sort events
    switch (sortBy) {
      case 'budget_high':
        filtered.sort((a, b) => b.budget_max - a.budget_max);
        break;
      case 'budget_low':
        filtered.sort((a, b) => a.budget_min - b.budget_min);
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.applicants_count - a.applicants_count);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [events, searchQuery, selectedCategory, sortBy, priceRange, locationFilter]);

  const featuredEvents = events.filter(event => event.featured).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container-responsive py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container-responsive py-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-medium text-white ring-1 ring-white/20">
              <Sparkles className="mr-2 h-4 w-4 text-purple-300" />
              <span>{events.length} Active Events Available</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Events</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with event planners across Rwanda and showcase your creative talents. 
              Find the perfect opportunity to grow your portfolio and career.
            </p>

            {user?.role === 'planner' && (
              <Link href="/events/create">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Event
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Events
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hand-picked opportunities with high visibility and excellent compensation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <div key={event.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <Award className="mr-1 h-3 w-3" />
                      Featured
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {event.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="mr-2 h-4 w-4 text-purple-500" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                        {formatCurrency(event.budget_min)} - {formatCurrency(event.budget_max)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="mr-1 h-4 w-4" />
                        {event.applicants_count} applicants
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Events Section */}
      <section className="py-16">
        <div className="container-responsive">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events by title, description, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                
                <div className="flex items-center border border-gray-300 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'text-gray-500 hover:text-purple-600'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'text-gray-500 hover:text-purple-600'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              {eventCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-600 border-purple-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                    } border`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatCurrency(priceRange[0])}
                      </span>
                      <span className="text-sm text-gray-500">-</span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(priceRange[1])}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <span>
                Showing {filteredEvents.length} of {events.length} events
              </span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Updated 2 min ago</span>
              </div>
            </div>
          </div>

          {/* Events Grid/List */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or browse all events
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setLocationFilter('');
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Event Card Component
function EventCard({ event, viewMode }: { event: Event; viewMode: 'grid' | 'list' }) {
  const [liked, setLiked] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {event.title}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
              {event.urgent && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Urgent
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {event.description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="mr-2 h-4 w-4 text-purple-500" />
                {event.location}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                {formatCurrency(event.budget_min)} - {formatCurrency(event.budget_max)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="mr-2 h-4 w-4" />
                {event.applicants_count} applicants
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {event.required_skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
              {event.required_skills.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  +{event.required_skills.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <div className="ml-6 flex flex-col space-y-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-xl transition-colors ${
                liked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-xl text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
            <Link href={`/events/${event.id}`}>
              <Button size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-16 w-16 text-purple-400" />
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
          {event.urgent && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
              Urgent
            </span>
          )}
        </div>
        
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setLiked(!liked)}
            className={`p-2 rounded-xl backdrop-blur-sm transition-colors ${
              liked 
                ? 'text-red-500 bg-white/90' 
                : 'text-white hover:text-red-500 bg-black/20 hover:bg-white/90'
            }`}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
          {event.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="mr-2 h-4 w-4 text-purple-500" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="mr-2 h-4 w-4 text-green-500" />
            {formatCurrency(event.budget_min)} - {formatCurrency(event.budget_max)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {event.required_skills.slice(0, 2).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
              {skill}
            </span>
          ))}
          {event.required_skills.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
              +{event.required_skills.length - 2}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="mr-1 h-4 w-4" />
            {event.applicants_count} applicants
          </div>
          <Link href={`/events/${event.id}`}>
            <Button size="sm" variant="outline" className="group-hover:bg-purple-50 group-hover:border-purple-300">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}