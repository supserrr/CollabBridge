import { z } from 'zod';
import { UserRole, EventType, MessageType, RateType } from '../types';

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Profile validation schemas
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  // Creative professional specific fields
  professionalTitle: z
    .string()
    .max(100, 'Professional title must be less than 100 characters')
    .optional(),
  experience: z
    .string()
    .max(20, 'Experience must be less than 20 characters')
    .optional(),
  skills: z
    .array(z.string())
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  categories: z
    .array(z.string())
    .max(10, 'Maximum 10 categories allowed')
    .optional(),
  hourlyRate: z
    .number()
    .min(0, 'Hourly rate must be positive')
    .max(10000, 'Hourly rate seems too high')
    .optional(),
  dailyRate: z
    .number()
    .min(0, 'Daily rate must be positive')
    .max(50000, 'Daily rate seems too high')
    .optional(),
  isAvailable: z.boolean().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  // Event planner specific fields
  businessName: z
    .string()
    .max(100, 'Business name must be less than 100 characters')
    .optional(),
  businessType: z
    .string()
    .max(50, 'Business type must be less than 50 characters')
    .optional(),
});

// Event validation schemas
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Event description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  eventType: z.nativeEnum(EventType, {
    errorMap: () => ({ message: 'Please select a valid event type' }),
  }),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Start date must be in the future',
    }),
  endDate: z
    .string()
    .min(1, 'End date is required'),
  location: z
    .string()
    .min(1, 'Event location is required')
    .max(200, 'Location must be less than 200 characters'),
  budget: z
    .number()
    .min(1, 'Budget must be greater than 0')
    .max(1000000, 'Budget seems too high'),
  budgetFlexible: z.boolean(),
  isPublic: z.boolean(),
  requiredRoles: z
    .array(z.string())
    .min(1, 'At least one role is required')
    .max(10, 'Maximum 10 roles allowed'),
  maxApplications: z
    .number()
    .min(1, 'Must allow at least 1 application')
    .max(100, 'Maximum 100 applications allowed')
    .optional(),
  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  additionalRequirements: z
    .string()
    .max(1000, 'Additional requirements must be less than 1000 characters')
    .optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Application validation schema
export const applicationSchema = z.object({
  message: z
    .string()
    .min(1, 'Application message is required')
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  proposedRate: z
    .number()
    .min(0, 'Rate must be positive')
    .max(50000, 'Rate seems too high')
    .optional(),
  rateType: z.nativeEnum(RateType).optional(),
});

// Message validation schema
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(2000, 'Message must be less than 2000 characters'),
  messageType: z.nativeEnum(MessageType).optional(),
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
}).refine((data) => data.conversationId || data.recipientId, {
  message: 'Either conversation ID or recipient ID is required',
});

// Review validation schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  title: z
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters')
    .optional(),
  communicationRating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  professionalismRating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  qualityRating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  skillsRating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  isPublic: z.boolean(),
});

// Booking validation schema
export const bookingSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be greater than 0')
    .max(1000000, 'Amount seems too high'),
  currency: z
    .string()
    .min(3, 'Currency code must be 3 characters')
    .max(3, 'Currency code must be 3 characters'),
  startDate: z
    .string()
    .min(1, 'Start date is required'),
  endDate: z
    .string()
    .min(1, 'End date is required'),
  terms: z
    .string()
    .max(2000, 'Terms must be less than 2000 characters')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Search validation schema
export const searchSchema = z.object({
  search: z.string().optional(),
  categories: z.array(z.string()).optional(),
  location: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxRate: z.number().min(0).optional(),
  availability: z.boolean().optional(),
  skills: z.string().optional(),
  eventType: z.nativeEnum(EventType).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject must be less than 100 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

// Export types for form validation
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
