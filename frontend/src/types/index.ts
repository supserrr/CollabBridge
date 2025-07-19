export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL' | 'ADMIN'
  profileImage?: string
  bio?: string
  location?: string
  isVerified: boolean
  rating?: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface EventPlanner extends User {
  role: 'EVENT_PLANNER'
  company?: string
  eventsOrganized: number
}

export interface CreativeProfessional extends User {
  role: 'CREATIVE_PROFESSIONAL'
  category: CreativeCategory
  skills: string[]
  portfolio: PortfolioItem[]
  hourlyRate?: number
  availability: Availability[]
  completedEvents: number
}

export interface Event {
  id: string
  title: string
  description: string
  eventType: EventType
  date: string
  endDate?: string
  location: string
  budget: {
    min: number
    max: number
  }
  requirements: string[]
  images: string[]
  status: EventStatus
  createdBy: string
  applications: Application[]
  bookings: Booking[]
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: string
  eventId: string
  professionalId: string
  message: string
  proposedRate?: number
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  professional?: CreativeProfessional
}

export interface Booking {
  id: string
  eventId: string
  professionalId: string
  plannerId: string
  status: BookingStatus
  rate: number
  message?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  revieweeId: string
  rating: number
  comment: string
  createdAt: string
  reviewer?: User
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE'
  fileUrl?: string
  readAt?: string
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: Message
  updatedAt: string
  users?: User[]
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  images: string[]
  category: CreativeCategory
  eventType?: EventType
  createdAt: string
}

export interface Availability {
  date: string
  available: boolean
}

export type CreativeCategory = 
  | 'PHOTOGRAPHER'
  | 'VIDEOGRAPHER'
  | 'DJ'
  | 'MUSICIAN'
  | 'CATERER'
  | 'DECORATOR'
  | 'FLORIST'
  | 'MC'
  | 'LIGHTING_TECHNICIAN'
  | 'SOUND_TECHNICIAN'
  | 'MAKEUP_ARTIST'
  | 'OTHER'

export type EventType = 
  | 'WEDDING'
  | 'CORPORATE'
  | 'BIRTHDAY'
  | 'ANNIVERSARY'
  | 'GRADUATION'
  | 'BABY_SHOWER'
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'FESTIVAL'
  | 'CONCERT'
  | 'OTHER'

export type EventStatus = 
  | 'DRAFT'
  | 'PUBLISHED'
  | 'COMPLETED'
  | 'CANCELLED'

export type ApplicationStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type BookingStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
