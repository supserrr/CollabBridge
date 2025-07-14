export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL' | 'ADMIN';
  location?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPlanner {
  id: string;
  userId: string;
  companyName?: string;
  website?: string;
  user: User;
}

export interface CreativeProfile {
  id: string;
  userId: string;
  categories: string[];
  portfolioImages: string[];
  portfolioLinks: string[];
  hourlyRate?: number;
  experience?: string;
  equipment?: string;
  availableFrom?: string;
  availableTo?: string;
  workingHours?: any;
  isAvailable: boolean;
  user: User;
}

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
  plannerId: string;
  planner: EventPlanner;
  createdAt: string;
  updatedAt: string;
}

export type EventType = 
  | 'WEDDING'
  | 'CORPORATE'
  | 'BIRTHDAY'
  | 'ANNIVERSARY'
  | 'GRADUATION'
  | 'BABY_SHOWER'
  | 'CONCERT'
  | 'FESTIVAL'
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'OTHER';

export type EventStatus = 'ACTIVE' | 'DRAFT' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';

export interface EventApplication {
  id: string;
  eventId: string;
  creativeId: string;
  userId: string;
  message?: string;
  proposedRate?: number;
  status: ApplicationStatus;
  appliedAt: string;
  event: Event;
  creative: CreativeProfile;
  user: User;
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Booking {
  id: string;
  eventId: string;
  plannerId: string;
  creativeId: string;
  userId: string;
  agreedRate?: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  event: Event;
  planner: EventPlanner;
  creative: CreativeProfile;
  user: User;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  giverId: string;
  receiverId: string;
  eventId?: string;
  createdAt: string;
  giver: User;
  receiver: User;
}

export interface Message {
  id: string;
  content: string;
  attachments: string[];
  messageType: MessageType;
  isRead: boolean;
  senderId: string;
  receiverId: string;
  eventId?: string;
  createdAt: string;
  sender: User;
  receiver: User;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VOICE';
