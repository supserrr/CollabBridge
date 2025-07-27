import { useState, useEffect } from 'react';
import { DashboardStats, ActivityItem } from '@/lib/types/dashboard';

export function useDashboardData(userRole: 'professional' | 'planner') {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const [statsRes, activityRes] = await Promise.all([
          fetch(`/api/dashboard/${userRole}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/dashboard/${userRole}/activity`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!statsRes.ok || !activityRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, activityData] = await Promise.all([
          statsRes.json(),
          activityRes.json()
        ]);

        setStats(statsData);
        setRecentActivity(activityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userRole]);

  const refreshData = () => {
    setLoading(true);
    setError(null);
    // Re-fetch data logic here
  };

  return { stats, recentActivity, loading, error, refreshData };
}

