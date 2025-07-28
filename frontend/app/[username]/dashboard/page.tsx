'use client';

import { useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-firebase';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';
import { Loader2 } from 'lucide-react';

interface DashboardPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { username } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Verify the username matches the logged-in user
      if (user.username !== username) {
        router.push(`/${user.username}/dashboard`);
        return;
      }

      // Redirect based on user role
      if (user.role === 'EVENT_PLANNER') {
        router.push(`/${username}/dashboard/planner`);
      } else if (user.role === 'CREATIVE_PROFESSIONAL') {
        router.push(`/${username}/dashboard/professional`);
      }
    } else if (!loading && !user) {
      // User not authenticated, redirect to signin
      router.push('/signin');
    }
  }, [user, loading, router, username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
