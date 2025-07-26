'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function PlannerEventsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Events</h1>
          <p className="text-muted-foreground">Manage your created events and bookings</p>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">Events management page coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
