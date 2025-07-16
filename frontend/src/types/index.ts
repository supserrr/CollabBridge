// User types
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

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  BOOKING_REQUEST = 'BOOKING_REQUEST',
}

export interface User {
  id: string;
  firebaseUid: string;
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
  metadata?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
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

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  location?: string;
  terms: boolean;
}

export interface EventForm {
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  budget?: number;
  requiredRoles: string[];
}

// Filter types
export interface ProfessionalFilters {
  categories?: string[];
  location?: string;
  minRating?: number;
  maxRate?: number;
  availability?: boolean;
  experience?: string;
}

export interface EventFilters {
  eventType?: EventType[];
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  categories?: string[];
}
