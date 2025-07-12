'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, MapPin, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiHelpers } from '@/lib/api';
import { formatRating, getAvailabilityIcon } from '@/lib/utils';

interface Professional {
  user_id: string;
  name: string;
  email: string;
  bio: string;
  phone: string;
  location: string;
  rating: number;
  availability_status: string;
  created_at: string;
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedLocation) params.append('location', selectedLocation);
      if (minRating) params.append('minRating', minRating);

      const url = searchTerm ? '/users/professionals/search' : '/users/professionals';
      const response = await apiHelpers.get(`${url}?${params.toString()}`);
      setProfessionals(response.professionals || []);
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProfessionals();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setMinRating('');
    fetchProfessionals();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Creative Professionals</h1>
          <p className="text-gray-600 mt-2">
            Discover talented professionals for your next event
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Professionals
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, bio, or skills..."
                  className="form-input pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Filter by location..."
                className="form-input"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="form-select"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <Button onClick={handleSearch} className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Professionals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Link
                key={professional.user_id}
                href={`/professionals/${professional.user_id}`}
                className="card-interactive block"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                      <span className="text-lg font-medium text-primary-600">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(professional.rating || 0)}
                        <span className="text-sm text-gray-500 ml-1">
                          ({formatRating(professional.rating || 0)})
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-lg">
                    {getAvailabilityIcon(professional.availability_status)}
                  </span>
                </div>

                {/* Bio */}
                {professional.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {professional.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-500">
                  {professional.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {professional.location}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {professional.email}
                  </div>

                  {professional.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {professional.phone}
                    </div>
                  )}
                </div>

                {/* Availability Status */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      professional.availability_status === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : professional.availability_status === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {professional.availability_status || 'available'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No professionals found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedLocation || minRating
                ? 'Try adjusting your search criteria'
                : 'No professionals are currently available'
              }
            </p>
            {searchTerm || selectedLocation || minRating ? (
              <Button onClick={clearFilters}>Clear Filters</Button>
            ) : null}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-primary-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Are you a creative professional?
            </h2>
            <p className="text-gray-600 mb-6">
              Join our platform and connect with event planners across Rwanda
            </p>
            <Link href="/register">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Join as Professional
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}