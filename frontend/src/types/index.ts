// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  language: string;
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  eventPlannerProfile?: EventPlannerProfile;
  creativeProfile?: CreativeProfile;
}

export enum UserRole {
  EVENT_PLANNER = 'EVENT_PLANNER',
  CREATIVE_PROFESSIONAL = 'CREATIVE_PROFESSIONAL',
  ADMIN = 'ADMIN'
}

export interface EventPlannerProfile {
  id: string;
  userId: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  socialLinks?: Record<string, string>;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeProfile {
  id: string;
  userId: string;
  professionalTitle?: string;
  experience?: string;
  bio?: string;
  skills?: string[];
  categories?: string[];
  portfolioImages?: string[];
  portfolioLinks?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  location?: string;
  isAvailable: boolean;
  availableFrom?: string;
  availableTo?: string;
  socialLinks?: Record<string, string>;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location: string;
  budget: number;
  budgetFlexible: boolean;
  status: EventStatus;
  isPublic: boolean;
  isFeatured: boolean;
  requiredRoles: string[];
  maxApplications?: number;
  contactEmail?: string;
  contactPhone?: string;
  additionalRequirements?: string;
  images?: string[];
  eventPlannerId: string;
  eventPlanner: EventPlannerProfile;
  applications?: EventApplication[];
  bookings?: Booking[];
  createdAt: string;
  updatedAt: string;
}

export enum EventType {
  WEDDING = 'WEDDING',
  CORPORATE = 'CORPORATE',
  BIRTHDAY = 'BIRTHDAY',
  CONCERT = 'CONCERT',
  CONFERENCE = 'CONFERENCE',
  OTHER = 'OTHER'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Application types
export interface EventApplication {
  id: string;
  eventId: string;
  creativeId: string;
  message: string;
  proposedRate?: number;
  rateType?: RateType;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  event: Event;
  creative: CreativeProfile;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum RateType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  FIXED = 'FIXED'
}

// Booking types
export interface Booking {
  id: string;
  eventId: string;
  creativeId: string;
  plannerId: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  startDate: string;
  endDate: string;
  terms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  event: Event;
  creative: CreativeProfile;
  planner: EventPlannerProfile;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: User;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  participantUsers: User[];
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  BOOKING_REQUEST = 'BOOKING_REQUEST'
}

// Review types
export interface Review {
  id: string;
  eventId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  title?: string;
  content?: string;
  communicationRating?: number;
  professionalismRating?: number;
  qualityRating?: number;
  skillsRating?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  event: Event;
  reviewer: User;
  reviewee: User;
}

// Search types
export interface SearchFilters {
  categories?: string[];
  location?: string;
  minRating?: number;
  maxRate?: number;
  availability?: boolean;
  skills?: string;
  search?: string;
  eventType?: EventType;
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  usersByRole: Record<string, number>;
  eventsByType: Record<string, number>;
  bookingsByStatus: Record<string, number>;
}

// Promotion types
export interface Promotion {
  id: string;
  userId: string;
  type: PromotionType;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PromotionType {
  FEATURED_PROFILE = 'FEATURED_PROFILE',
  FEATURED_EVENT = 'FEATURED_EVENT',
  PREMIUM_LISTING = 'PREMIUM_LISTING'
}

// Report types
export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  reporter: User;
  reported: User;
}

export enum ReportReason {
  INAPPROPRIATE = 'INAPPROPRIATE',
  SPAM = 'SPAM',
  FALSE_INFORMATION = 'FALSE_INFORMATION',
  HARASSMENT = 'HARASSMENT',
  OTHER = 'OTHER'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

// Form types
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  acceptTerms: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface EventForm {
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location: string;
  budget: number;
  budgetFlexible: boolean;
  isPublic: boolean;
  requiredRoles: string[];
  maxApplications?: number;
  contactEmail?: string;
  contactPhone?: string;
  additionalRequirements?: string;
  images?: FileList;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  // Creative specific
  professionalTitle?: string;
  experience?: string;
  skills?: string[];
  categories?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  isAvailable?: boolean;
  availableFrom?: string;
  availableTo?: string;
  // Planner specific
  businessName?: string;
  businessType?: string;
}

// Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
