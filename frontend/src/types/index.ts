// User types
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
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventPlanner {
  id: string;
  userId: string;
  user: User;
  companyName?: string;
  website?: string;
}

export interface CreativeProfile {
  id: string;
  userId: string;
  user: User;
  categories: string[];
  portfolioImages: string[];
  portfolioLinks: string[];
  hourlyRate?: number;
  experience?: string;
  equipment?: string;
  isAvailable: boolean;
  responseTime?: number;
  completedProjects: number;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  endDate?: string;
  location: string;
  address?: string;
  budget?: number;
  requiredRoles: string[];
  images: string[];
  status: EventStatus;
  isPublic: boolean;
  isFeatured: boolean;
  planner: EventPlanner;
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventApplication {
  id: string;
  eventId: string;
  event: Event;
  creative: CreativeProfile;
  message?: string;
  proposedRate?: number;
  status: ApplicationStatus;
  appliedAt: string;
}

// Message types
export interface Message {
  id: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  sender: User;
  receiver: User;
  createdAt: string;
}

// Review types
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  giver: User;
  receiver: User;
  createdAt: string;
}

// Enums
export enum UserRole {
  EVENT_PLANNER = 'EVENT_PLANNER',
  CREATIVE_PROFESSIONAL = 'CREATIVE_PROFESSIONAL',
  ADMIN = 'ADMIN'
}

export enum EventType {
  WEDDING = 'WEDDING',
  CORPORATE = 'CORPORATE',
  BIRTHDAY = 'BIRTHDAY',
  ANNIVERSARY = 'ANNIVERSARY',
  GRADUATION = 'GRADUATION',
  BABY_SHOWER = 'BABY_SHOWER',
  CONCERT = 'CONCERT',
  FESTIVAL = 'FESTIVAL',
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  OTHER = 'OTHER'
}

export enum EventStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  VOICE = 'VOICE'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
  date: string;
  endDate?: string;
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
