// Environment configuration
export const ENV = {
  API_URL: import.meta.env.NEXT_PUBLIC_API_URL || 'https://collabbridge.onrender.com/api',
  APP_URL: import.meta.env.NEXT_PUBLIC_APP_URL || 'https://collabbridge.vercel.app',
  CLOUDINARY_CLOUD_NAME: import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dh3ntu9nh',
  CLOUDINARY_API_KEY: import.meta.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '876738923338492',
  MAX_FILE_SIZE: parseInt(import.meta.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
  ALLOWED_FILE_TYPES: (import.meta.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp').split(','),
  FIREBASE: {
    API_KEY: import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyADfbs4p9tW8YQ4-ydwrh4QibOJNDK4Wqc',
    AUTH_DOMAIN: import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'collabbridge-2c528.firebaseapp.com',
    PROJECT_ID: import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'collabbridge-2c528',
    STORAGE_BUCKET: import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'collabbridge-2c528.firebasestorage.app',
    MESSAGING_SENDER_ID: import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '617937121656',
    APP_ID: import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:617937121656:web:468903268a98578371d88d',
    MEASUREMENT_ID: import.meta.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-Q834WCMRP2',
  },
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  IS_PRODUCTION: import.meta.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: import.meta.env.NODE_ENV === 'development',
};

// Application constants
export const APP_CONFIG = {
  name: 'CollabBridge',
  description: 'Connect event planners with talented creative professionals',
  version: '1.0.0',
  supportEmail: 'support@collabbridge.com',
  features: {
    realTimeMessaging: true,
    fileUpload: true,
    notifications: true,
    analytics: true,
  },
};

// API configuration
export const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Socket.IO configuration
export const SOCKET_CONFIG = {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
};

// File upload configuration
export const FILE_CONFIG = {
  maxSize: ENV.MAX_FILE_SIZE,
  allowedTypes: ENV.ALLOWED_FILE_TYPES,
  cloudinary: {
    cloudName: ENV.CLOUDINARY_CLOUD_NAME,
    apiKey: ENV.CLOUDINARY_API_KEY,
  },
};

// Theme configuration
export const THEME_CONFIG = {
  colors: {
    primary: '#3B82F6',
    secondary: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

export default {
  ENV,
  APP_CONFIG,
  API_CONFIG,
  SOCKET_CONFIG,
  FILE_CONFIG,
  THEME_CONFIG,
};
