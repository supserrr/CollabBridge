import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Navigation from '../layout/Navigation';
import Footer from '../layout/Footer';
import { Button, Card, CardContent, Input, Select, Avatar, Badge, Loading } from '../ui';
import authService from '../../services/auth';
import searchService from '../../services/search';
import type { User, CreativeProfile, SearchFilters } from '../../types';

const BrowseProfessionals: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [professionals, setProfessionals] = useState<CreativeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  const categories = [
    'Photography',
    'Videography',
    'Event Planning',
    'Catering',
    'Music & Entertainment',
    'Floral Design',
    'Decoration',
    'Lighting',
    'Sound & AV',
    'Transportation',
    'Security',
    'Other'
  ];

  const priceRanges = [
    { value: '', label: 'Any Budget' },
    { value: '0-50', label: '$0 - $50/hr' },
    { value: '50-100', label: '$50 - $100/hr' },
    { value: '100-200', label: '$100 - $200/hr' },
    { value: '200+', label: '$200+/hr' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'recent', label: 'Most Recent' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }

        // Load professionals
        const result = await searchService.searchProfessionals({});
        setProfessionals(result.data);
      } catch (error) {
        console.error('Error loading professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const filters: SearchFilters = {
        search: searchQuery,
        location,
        // category: selectedCategory, // Need to check if this maps to categories array
        // priceRange, // Need to map to budgetMin/budgetMax
        // sortBy, // This might need separate handling
      };

      const result = await searchService.searchProfessionals(filters);
      setProfessionals(result.data);
    } catch (error) {
      console.error('Error searching professionals:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setSelectedCategory('');
    setPriceRange('');
    setSortBy('relevance');
    handleSearch();
  };

  const formatHourlyRate = (rate?: number) => {
    if (!rate) return 'Rate on request';
    return `$${rate}/hr`;
  };

  const formatDailyRate = (rate?: number) => {
    if (!rate) return null;
    return `$${rate}/day`;
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" text="Loading professionals..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Creative Professionals
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover talented professionals for your next event. Browse portfolios, read reviews, and connect with the perfect match.
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Main Search */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="What service are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="h-12 px-8"
                >
                  {searchLoading ? (
                    <Loading size="sm" />
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Filter Toggle */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'More Filters'}
                </Button>
                
                {(searchQuery || location || selectedCategory || priceRange || sortBy !== 'relevance') && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input w-full"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price Range
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="input w-full"
                    >
                      {priceRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input w-full"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {professionals.length} professional{professionals.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Professionals Grid */}
        {professionals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Card key={professional.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar
                      firstName="Professional"
                      lastName="User"
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">
                        Professional Name {/* Would need to resolve user data */}
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        {professional.professionalTitle || 'Creative Professional'}
                      </p>
                      {professional.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {professional.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between mb-4">
                    {renderRating(4.8)} {/* Mock rating */}
                    <span className="text-sm text-muted-foreground">
                      (24 reviews) {/* Mock review count */}
                    </span>
                  </div>

                  {/* Skills */}
                  {professional.skills && professional.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {professional.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {professional.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {professional.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {professional.bio}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        {formatHourlyRate(professional.hourlyRate)}
                      </div>
                      {professional.dailyRate && (
                        <div className="text-sm text-muted-foreground">
                          {formatDailyRate(professional.dailyRate)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Available
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Profile
                    </Button>
                    <Button className="flex-1">
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No professionals found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or browse all professionals.
              </p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {professionals.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Professionals
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowseProfessionals;
