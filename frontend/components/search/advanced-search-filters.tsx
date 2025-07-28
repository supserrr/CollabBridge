import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, DollarSign, Star, Filter, Search, X } from 'lucide-react';

interface SearchFilters {
  query: string;
  location: string;
  radius: number;
  categories: string[];
  skills: string[];
  hourlyRateRange: [number, number];
  availability: {
    startDate: string;
    endDate: string;
  };
  rating: number;
  responseTime: number;
  verified: boolean;
  languages: string[];
  experienceLevel: string;
  sortBy: string;
}

interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  location: string;
  distance?: number;
  categories: string[];
  skills: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  responseTime: number;
  isVerified: boolean;
  languages: string[];
  portfolioImages: string[];
  bio: string;
  isAvailable: boolean;
}

const CATEGORIES = [
  'Photography', 'Videography', 'Event Planning', 'Catering', 'Music & DJ',
  'Decoration', 'Lighting', 'Sound Equipment', 'Transportation', 'Security',
  'Makeup & Hair', 'Fashion Design', 'Graphic Design', 'Live Streaming'
];

const SKILLS = [
  'Wedding Photography', 'Corporate Events', 'Concert Production', 'Live Streaming',
  'Audio Engineering', 'Stage Design', 'Event Coordination', 'Vendor Management',
  'Budget Planning', 'Timeline Management', 'Equipment Rental', 'Live Broadcasting'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Chinese', 'Japanese'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert', 'Master'];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'response_time', label: 'Fastest Response' },
  { value: 'newest', label: 'Newest Members' }
];

export default function AdvancedSearchFilters() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    radius: 25,
    categories: [],
    skills: [],
    hourlyRateRange: [50, 500],
    availability: {
      startDate: '',
      endDate: ''
    },
    rating: 0,
    responseTime: 24,
    verified: false,
    languages: [],
    experienceLevel: '',
    sortBy: 'relevance'
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.query || filters.location || filters.categories.length > 0) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        q: filters.query,
        location: filters.location,
        radius: filters.radius.toString(),
        categories: filters.categories.join(','),
        skills: filters.skills.join(','),
        min_rate: filters.hourlyRateRange[0].toString(),
        max_rate: filters.hourlyRateRange[1].toString(),
        start_date: filters.availability.startDate,
        end_date: filters.availability.endDate,
        min_rating: filters.rating.toString(),
        max_response_time: filters.responseTime.toString(),
        verified: filters.verified.toString(),
        languages: filters.languages.join(','),
        experience: filters.experienceLevel,
        sort: filters.sortBy,
        page: currentPage.toString()
      });

      const response = await fetch(`/api/search/professionals?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.professionals);
        setTotalResults(data.data.total);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      radius: 25,
      categories: [],
      skills: [],
      hourlyRateRange: [50, 500],
      availability: { startDate: '', endDate: '' },
      rating: 0,
      responseTime: 24,
      verified: false,
      languages: [],
      experienceLevel: '',
      sortBy: 'relevance'
    });
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleLanguage = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search professionals, skills, or services..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location (city, state, or zip)"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Radius */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Search Radius: {filters.radius} miles
              </label>
              <Slider
                value={[filters.radius]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, radius: value[0] }))}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-medium mb-3 block">Categories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Badge
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-medium mb-3 block">Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={filters.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Hourly Rate Range */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Hourly Rate: ${filters.hourlyRateRange[0]} - ${filters.hourlyRateRange[1]}
              </label>
              <Slider
                value={filters.hourlyRateRange}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  hourlyRateRange: [value[0], value[1]] 
                }))}
                max={1000}
                min={25}
                step={25}
                className="w-full"
              />
            </div>

            {/* Availability Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Available From</label>
                <Input
                  type="date"
                  value={filters.availability.startDate}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    availability: { ...prev.availability, startDate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Available Until</label>
                <Input
                  type="date"
                  value={filters.availability.endDate}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    availability: { ...prev.availability, endDate: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Rating & Response Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Minimum Rating: {filters.rating} stars
                </label>
                <Slider
                  value={[filters.rating]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value[0] }))}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Max Response Time: {filters.responseTime} hours
                </label>
                <Slider
                  value={[filters.responseTime]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, responseTime: value[0] }))}
                  max={72}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="text-sm font-medium mb-3 block">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((language) => (
                  <Badge
                    key={language}
                    variant={filters.languages.includes(language) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Experience Level & Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select
                  value={filters.experienceLevel}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any experience level</SelectItem>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => setFilters(prev => ({ 
                    ...prev, 
                    verified: checked === true 
                  }))}
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Verified professionals only
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Search Results</h2>
          <p className="text-muted-foreground">
            {loading ? 'Searching...' : `Found ${totalResults} professionals`}
          </p>
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((professional) => (
          <Card key={professional.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={professional.avatar || '/images/default-avatar.png'}
                  alt={professional.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{professional.displayName || professional.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{professional.location}</span>
                    {professional.distance && (
                      <span>• {professional.distance.toFixed(1)} mi</span>
                    )}
                  </div>
                </div>
                {professional.isVerified && (
                  <Badge variant="secondary">Verified</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {professional.bio}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {professional.categories.slice(0, 3).map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {professional.categories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{professional.categories.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{professional.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({professional.reviewCount})
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <DollarSign className="h-3 w-3" />
                  <span>${professional.hourlyRate}/hr</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Responds in ~{professional.responseTime}h
                </div>
                <Button size="sm">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalResults > 0 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {Math.ceil(totalResults / 12)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalResults / 12)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
