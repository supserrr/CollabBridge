import { EventType, UserRole } from '../types';

// App configuration
export const APP_CONFIG = {
  name: 'CollabBridge',
  description: 'Connect event planners with talented creative professionals',
  version: '1.0.0',
  supportEmail: 'support@collabbridge.com',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    verifyToken: '/auth/verify-token',
    me: '/auth/me',
  },
  users: {
    profile: '/users/profile',
    update: '/users/profile',
    avatar: '/users/avatar',
  },
  events: {
    list: '/events',
    create: '/events',
    detail: (id: string) => `/events/${id}`,
    update: (id: string) => `/events/${id}`,
    delete: (id: string) => `/events/${id}`,
    myEvents: '/events/my/events',
    apply: (id: string) => `/events/${id}/apply`,
  },
  professionals: {
    list: '/search/professionals',
    profile: (id: string) => `/professionals/${id}`,
  },
  messages: {
    conversations: '/messages/conversations',
    conversation: (id: string) => `/messages/conversations/${id}`,
    send: '/messages/send',
  },
  bookings: {
    list: '/bookings',
    create: '/bookings',
    detail: (id: string) => `/bookings/${id}`,
    updateStatus: (id: string) => `/bookings/${id}/status`,
  },
  reviews: {
    list: '/reviews',
    create: '/reviews',
    detail: (id: string) => `/reviews/${id}`,
  },
  uploads: {
    single: '/uploads/single',
    multiple: '/uploads/multiple',
    delete: (publicId: string) => `/uploads/${publicId}`,
  },
};

// User role labels
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.EVENT_PLANNER]: 'Event Planner',
  [UserRole.CREATIVE_PROFESSIONAL]: 'Creative Professional',
  [UserRole.ADMIN]: 'Administrator',
};

// Event type labels
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.WEDDING]: 'Wedding',
  [EventType.CORPORATE]: 'Corporate Event',
  [EventType.BIRTHDAY]: 'Birthday Party',
  [EventType.CONCERT]: 'Concert',
  [EventType.CONFERENCE]: 'Conference',
  [EventType.OTHER]: 'Other',
};

// Creative professional categories
export const CREATIVE_CATEGORIES = [
  'Photography',
  'Videography',
  'DJ/Music',
  'Catering',
  'Decoration',
  'Event Planning',
  'Lighting',
  'Sound Engineering',
  'Entertainment',
  'Security',
  'Transportation',
  'Florist',
  'Makeup Artist',
  'Wedding Planner',
  'MC/Host',
  'Other',
];

// Skills for creative professionals
export const CREATIVE_SKILLS = [
  'Portrait Photography',
  'Event Photography',
  'Wedding Photography',
  'Drone Photography',
  'Video Editing',
  'Live Streaming',
  'Sound Mixing',
  'Stage Design',
  'Floral Arrangements',
  'Cake Design',
  'Menu Planning',
  'Event Coordination',
  'Venue Setup',
  'Crowd Management',
  'Equipment Rental',
];

// Default working hours
export const DEFAULT_WORKING_HOURS = {
  monday: { start: '09:00', end: '17:00', available: true },
  tuesday: { start: '09:00', end: '17:00', available: true },
  wednesday: { start: '09:00', end: '17:00', available: true },
  thursday: { start: '09:00', end: '17:00', available: true },
  friday: { start: '09:00', end: '17:00', available: true },
  saturday: { start: '10:00', end: '16:00', available: true },
  sunday: { start: '10:00', end: '16:00', available: false },
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
];

// Currency options
export const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];
