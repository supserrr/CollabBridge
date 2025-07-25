'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth-firebase';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PageProps {
  params: {
    username: string;
  };
}

export default function TeamManagementPage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Verify the username matches the logged-in user
      if (user.username !== params.username) {
        router.push(`/${user.username}/dashboard/analytics/team`);
        return;
      }
      
      // Check if user is event planner (team management is for planners)
      if (user.role !== 'EVENT_PLANNER') {
        router.push(`/${user.username}/dashboard/analytics`);
        return;
      }
    } else if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router, params.username]);

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
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage your event planning team and collaborators</p>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">Team management tools will help you organize and collaborate with your event planning team.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
