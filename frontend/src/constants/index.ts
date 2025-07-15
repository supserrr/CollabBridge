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
  [UserRole.ADMIN]: 'Administrator',
};

// Event type labels
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.WEDDING]: 'Wedding',
  [EventType.CORPORATE]: 'Corporate Event',
  [EventType.BIRTHDAY]: 'Birthday Party',
  [EventType.ANNIVERSARY]: 'Anniversary',
  [EventType.GRADUATION]: 'Graduation',
  [EventType.BABY_SHOWER]: 'Baby Shower',
  [EventType.CONCERT]: 'Concert',
  [EventType.FESTIVAL]: 'Festival',
  [EventType.CONFERENCE]: 'Conference',
  [EventType.WORKSHOP]: 'Workshop',
  [EventType.OTHER]: 'Other',
};

// Creative professional categories
export const CREATIVE_CATEGORIES = [
  'photographer',
  'videographer',
  'dj',
  'band',
  'florist',
  'decorator',
  'caterer',
  'baker',
  'makeup-artist',
  'hair-stylist',
  'wedding-planner',
  'mc',
  'security',
  'transportation',
  'lighting',
  'sound-engineer',
  'graphic-designer',
  'invitation-designer',
  'other',
];

export const CATEGORY_LABELS: Record<string, string> = {
  photographer: 'Photographer',
  videographer: 'Videographer',
  dj: 'DJ',
  band: 'Live Band',
  florist: 'Florist',
  decorator: 'Decorator',
  caterer: 'Caterer',
  baker: 'Baker',
  'makeup-artist': 'Makeup Artist',
  'hair-stylist': 'Hair Stylist',
  'wedding-planner': 'Wedding Planner',
  mc: 'Master of Ceremonies',
  security: 'Security',
  transportation: 'Transportation',
  lighting: 'Lighting Technician',
  'sound-engineer': 'Sound Engineer',
  'graphic-designer': 'Graphic Designer',
  'invitation-designer': 'Invitation Designer',
  other: 'Other',
};

// Location suggestions (you can replace with actual API)
export const POPULAR_LOCATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC',
];

// Pagination defaults
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 12,
  maxLimit: 100,
};

// Rating configuration
export const RATING = {
  min: 1,
  max: 5,
  default: 0,
};

// Navigation items
export const NAVIGATION_ITEMS = [
  { href: '/browse-professionals', label: 'Find Talent' },
  { href: '/events', label: 'Browse Events' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
];

// Footer links
export const FOOTER_LINKS = {
  platform: [
    { href: '/browse-professionals', label: 'Find Talent' },
    { href: '/events', label: 'Browse Events' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
  ],
  resources: [
    { href: '/blog', label: 'Blog' },
    { href: '/help', label: 'Help Center' },
    { href: '/guides', label: 'Event Guides' },
    { href: '/api-docs', label: 'API Documentation' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/accessibility', label: 'Accessibility' },
  ],
};

// Social media links
export const SOCIAL_LINKS = [
  { href: '#', label: 'Facebook', icon: 'facebook' },
  { href: '#', label: 'Instagram', icon: 'instagram' },
  { href: '#', label: 'Twitter', icon: 'twitter' },
  { href: '#', label: 'LinkedIn', icon: 'linkedin' },
];

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'collabbridge-theme',
  user: 'collabbridge-user',
  language: 'collabbridge-language',
  searchFilters: 'collabbridge-search-filters',
};

// Theme configuration
export const THEME = {
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  password: {
    minLength: 'Password must be at least 8 characters long',
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    number: 'Password must contain at least one number',
    special: 'Password must contain at least one special character',
  },
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  fileSize: (maxSize: string) => `File size must be less than ${maxSize}`,
  fileType: (allowedTypes: string) => `File type not allowed. Allowed types: ${allowedTypes}`,
};

// Default avatars
export const DEFAULT_AVATARS = {
  user: '/images/default-avatar.png',
  company: '/images/default-company.png',
};

// Success messages
export const SUCCESS_MESSAGES = {
  login: 'Successfully signed in!',
  register: 'Account created successfully!',
  logout: 'Successfully signed out!',
  profileUpdate: 'Profile updated successfully!',
  eventCreated: 'Event created successfully!',
  applicationSubmitted: 'Application submitted successfully!',
  messagesSent: 'Message sent successfully!',
};

// Error messages
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  fileUpload: 'Failed to upload file. Please try again.',
};
