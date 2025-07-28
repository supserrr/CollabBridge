'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth-firebase';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function BudgetTrackerPage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    params.then(({ username }) => {
      setUsername(username);
    });
  }, [params]);

  useEffect(() => {
    if (!loading && user && username) {
      // Verify the username matches the logged-in user
      if (user.username !== username) {
        router.push(`/${user.username}/dashboard/analytics/budget`);
        return;
      }
      
      // Check if user is event planner (budget tracker is for planners)
      if (user.role !== 'EVENT_PLANNER') {
        router.push(`/${user.username}/dashboard/analytics`);
        return;
      }
    } else if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router, username]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Tracker</h1>
          <p className="text-muted-foreground">Monitor your event budgets and expenses</p>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">Your budget tracking dashboard will help you manage event expenses and financial planning.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
