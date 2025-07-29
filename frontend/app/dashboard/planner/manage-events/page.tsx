'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageEventsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified events page
    router.replace('/dashboard/planner/events');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="ml-3">Redirecting to events...</p>
    </div>
  );
}
