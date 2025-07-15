import { UserRole, EventType, EventStatus, ApplicationStatus, BookingStatus, MessageType, NotificationType, PromotionType } from '@prisma/client';

export {
  UserRole,
  EventType,
  EventStatus,
  ApplicationStatus,
  BookingStatus,
  MessageType,
  NotificationType,
  PromotionType,
};

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchFilters {
  categories?: string[];
  location?: string;
  minRate?: number;
  maxRate?: number;
  skills?: string[];
  availability?: boolean;
  rating?: number;
}

export interface EventFilters {
  eventType?: EventType;
  location?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minBudget?: number;
  maxBudget?: number;
  requiredRoles?: string[];
  tags?: string[];
}
