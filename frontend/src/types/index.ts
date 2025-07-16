export enum UserRole {
  EVENT_PLANNER = 'EVENT_PLANNER',
  CREATIVE_PROFESSIONAL = 'CREATIVE_PROFESSIONAL',
  ADMIN = 'ADMIN',
}

export enum EventType {
  WEDDING = 'WEDDING',
  CORPORATE = 'CORPORATE',
  BIRTHDAY = 'BIRTHDAY',
  CONCERT = 'CONCERT',
  CONFERENCE = 'CONFERENCE',
  OTHER = 'OTHER',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  BOOKING_REQUEST = 'BOOKING_REQUEST',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  location?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  timezone: string;
  language: string;
  isVerified: boolean;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPlanner {
  id: string;
  userId: string;
  user: User;
  companyName?: string;
  website?: string;
  taxId?: string;
}

export interface CreativeProfile {
  id: string;
  userId: string;
  user: User;
  categories: string[];
  portfolioImages: string[];
  portfolioLinks: string[];
  hourlyRate?: number;
  dailyRate?: number;
  experience?: string;
  equipment?: string;
  skills: string[];
  languages: string[];
  availableFrom?: string;
  availableTo?: string;
  workingHours?: any;
  isAvailable: boolean;
  responseTime?: number;
  travelRadius?: number;
  certifications: string[];
  awards: string[];
  socialMedia?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  eventPlannerId: string;
  eventPlanner: EventPlanner;
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  budget?: number;
  currency: string;
  requiredRoles: string[];
  tags: string[];
  maxApplicants?: number;
  isPublic: boolean;
  isFeatured: boolean;
  status: EventStatus;
  images: string[];
  attachments?: any;
  requirements?: string;
  contactInfo?: any;
  deadlineDate?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
    bookings: number;
  };
}

export interface EventApplication {
  id: string;
  eventId: string;
  event: Event;
  professionalId: string;
  professional: CreativeProfile;
  message?: string;
  proposedRate?: number;
  availability?: any;
  portfolio: string[];
  status: ApplicationStatus;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  eventId: string;
  event: Event;
  eventPlannerId: string;
  eventPlanner: EventPlanner;
  professionalId: string;
  professional: CreativeProfile;
  startDate: string;
  endDate: string;
  rate: number;
  currency: string;
  description?: string;
  requirements: string[];
  status: BookingStatus;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  contract?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  booking: Booking;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  reviewee: User;
  professionalId?: string;
  professional?: CreativeProfile;
  rating: number;
  comment: string;
  skills: string[];
  communication?: number;
  professionalism?: number;
  quality?: number;
  wouldRecommend: boolean;
  isPublic: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  recipientId: string;
  recipient: User;
  content: string;
  messageType: MessageType;
  attachments: string[];
  metadata?: any;
  readAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessageId?: string;
  lastMessage?: Message;
  lastMessageAt: string;
  isArchived: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchFilters {
  categories: string[];
  skills: string[];
  locations: string[];
  rateRange: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface FormErrors {
  [key: string]: string | string[];
}
