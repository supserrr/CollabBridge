export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  location: EventLocation;
  budget: EventBudget;
  guestCount: number;
  requirements: EventRequirement[];
  preferences: EventPreferences;
  isPublic: boolean;
  isFeatured: boolean;
  applicationDeadline: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  applicationsCount?: number;
  viewsCount?: number;
}

export interface EventLocation {
  venue: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventBudget {
  total: number;
  currency: string;
  breakdown?: {
    category: string;
    amount: number;
  }[];
}

export interface EventRequirement {
  id?: string;
  category: string;
  description: string;
  budget: number;
  priority: 'high' | 'medium' | 'low';
  skills?: string[];
  experienceLevel?: 'entry' | 'intermediate' | 'expert';
}

export interface EventPreferences {
  style: string[];
  themes: string[];
  specialRequests: string;
  accessibility?: string[];
  dietaryRestrictions?: string[];
}
