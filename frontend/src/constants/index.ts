import { EventType, UserRole } from '@/types';

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
    resetPassword: '/auth/reset-password',
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
  uploads: '/uploads',
};

// User role labels
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.EVENT_PLANNER]: 'Event Planner',
  [UserRole.CREATIVE_PROFESSIONAL]: 'Creative Professional',
  [UserRole.ADMIN]: 'Admin',
};

// Event type labels
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.WEDDING]: 'Wedding',
  [EventType.CORPORATE]: 'Corporate',
  [EventType.BIRTHDAY]: 'Birthday',
  [EventType.CONCERT]: 'Concert',
  [EventType.CONFERENCE]: 'Conference',
  [EventType.OTHER]: 'Other',
};

// Creative categories
export const CREATIVE_CATEGORIES = [
  'photographer',
  'videographer',
  'dj',
  'musician',
  'band',
  'mc',
  'host',
  'decorator',
  'florist',
  'caterer',
  'baker',
  'makeup_artist',
  'hair_stylist',
  'fashion_designer',
  'lighting_technician',
  'sound_engineer',
  'event_coordinator',
  'security',
  'transportation',
  'entertainment',
  'other',
];

// Skills by category
export const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  photographer: [
    'wedding photography',
    'portrait photography',
    'event photography',
    'commercial photography',
    'fashion photography',
    'product photography',
    'drone photography',
    'underwater photography',
  ],
  videographer: [
    'wedding videography',
    'event videography',
    'commercial videography',
    'documentary filming',
    'drone videography',
    'live streaming',
    'video editing',
    'motion graphics',
  ],
  dj: [
    'wedding dj',
    'party dj',
    'corporate events',
    'club dj',
    'radio dj',
    'mixing',
    'scratching',
    'live remixing',
  ],
  musician: [
    'solo performance',
    'acoustic guitar',
    'piano',
    'violin',
    'saxophone',
    'vocals',
    'jazz',
    'classical',
  ],
  // Add more as needed...
};

// Common event requirements
export const EVENT_REQUIREMENTS = [
  'Professional equipment',
  'Backup equipment',
  'Insurance coverage',
  'Portfolio samples',
  'References',
  'Contract signing',
  'Deposit required',
  'Cancellation policy',
  'Setup/breakdown included',
  'Transportation included',
];

// Pagination defaults
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

// File upload constraints
export const FILE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  },
};

// Time zones
export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
  // Add more as needed...
];

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
];
