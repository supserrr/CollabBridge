'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, MapPin, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiHelpers } from '@/lib/api';
import { formatDate, getEventTypeColor, getStatusColor } from '@/lib/utils';

interface Event {
  event_id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  event_type: string;
  status: string;
  planner_name: string;
  required_roles: string[];
  created_at: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const eventTypes = [
    'wedding',
    'corporate',
    'birthday',
    'conference',
    'workshop',
    'concert',
    'other'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedType) params.append('event_type', selectedType);
      if (selectedLocation) params.append('location', selectedLocation);

      const url = searchTerm ? '/events/search' : '/events';
      const response = await apiHelpers.get(`${url}?${params.toString()}`);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEvents();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedLocation('');
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
          <p className="text-gray-600 mt-2">
            Discover exciting events and opportunities to showcase your skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, description, or location..."
                  className="form-input pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
              >
                <option value="">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
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

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.event_id}
                href={`/events/${event.event_id}`}
                className="card-interactive block"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.planner_name}
                  </div>
                </div>

                {event.required_roles && event.required_roles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Required Roles:</p>
                    <div className="flex flex-wrap gap-1">
                      {event.required_roles.slice(0, 3).map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                        >
                          {role}
                        </span>
                      ))}
                      {event.required_roles.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                          +{event.required_roles.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedType || selectedLocation
                ? 'Try adjusting your search criteria'
                : 'No events are currently available'
              }
            </p>
            {searchTerm || selectedType || selectedLocation ? (
              <Button onClick={clearFilters}>Clear Filters</Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}