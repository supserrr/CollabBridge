import { Event } from './events';
import { Professional } from './profiles';

export interface Booking {
  id: string;
  eventId: string;
  professionalId: string;
  plannerId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message: string;
  proposedRate?: number;
  agreedRate?: number;
  startDate: string;
  endDate: string;
  requirements: string[];
  deliverables?: string[];
  contractTerms?: string;
  paymentSchedule?: PaymentSchedule[];
  createdAt: string;
  updatedAt: string;
  event?: Event;
  professional?: Professional;
}

export interface PaymentSchedule {
  amount: number;
  dueDate: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
}
