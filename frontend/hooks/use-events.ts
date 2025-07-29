import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '@/lib/api';

export interface Event {
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
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  status: string;
  images: string[];
  event_planners: {
    id: string;
    businessName: string;
    avgRating?: number;
    totalReviews?: number;
    users: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  };
}

export interface EventFilters {
  page?: number;
  limit?: number;
  eventType?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface EventsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useEvents(initialFilters: EventFilters = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<EventsPagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<EventFilters>(initialFilters);

  const fetchEvents = useCallback(async (newFilters?: EventFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalFilters = { ...filters, ...newFilters };
      const response = await eventsApi.getEvents(finalFilters);
      
      setEvents(response.events);
      setPagination(response.pagination);
      
      if (newFilters) {
        setFilters(finalFilters);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshEvents = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    fetchEvents({ ...filters, ...newFilters, page: 1 });
  }, [fetchEvents, filters]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchEvents({ ...filters, page: pagination.page + 1 });
    }
  }, [fetchEvents, filters, pagination]);

  const goToPage = useCallback((page: number) => {
    fetchEvents({ ...filters, page });
  }, [fetchEvents, filters]);

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    pagination,
    filters,
    fetchEvents,
    refreshEvents,
    updateFilters,
    loadMore,
    goToPage,
  };
}
