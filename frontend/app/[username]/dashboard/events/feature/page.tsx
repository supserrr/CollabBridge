'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth-firebase';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function FeatureEventsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feature Events</h1>
          <p className="text-muted-foreground">Promote your events to reach more creative professionals</p>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">Event featuring options coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
