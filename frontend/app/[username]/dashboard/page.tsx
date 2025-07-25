'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-firebase';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';
import { Loader2 } from 'lucide-react';

interface DashboardPageProps {
  params: {
    username: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Verify the username matches the logged-in user
      if (user.username !== params.username) {
        router.push(`/${user.username}/dashboard`);
        return;
      }

      // Redirect based on user role
      if (user.role === 'EVENT_PLANNER') {
        router.push(`/${params.username}/dashboard/planner`);
      } else if (user.role === 'CREATIVE_PROFESSIONAL') {
        router.push(`/${params.username}/dashboard/professional`);
      }
    } else if (!loading && !user) {
      // User not authenticated, redirect to signin
      router.push('/signin');
    }
  }, [user, loading, router, params.username]);

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
