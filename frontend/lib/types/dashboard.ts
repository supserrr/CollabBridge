export interface DashboardStats {
  totalApplications?: number;
  activeBookings?: number;
  totalEarnings?: number;
  profileViews?: number;
  averageRating?: number;
  completionRate?: number;
  totalEvents?: number;
  pendingApplications?: number;
  confirmedBookings?: number;
  monthlyRevenue?: number;
}

export interface ActivityItem {
  id: string;
  type: 'application' | 'booking' | 'message' | 'review' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'completed';
  metadata?: Record<string, any>;
}
