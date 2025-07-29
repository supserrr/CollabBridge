'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified events page with create view
    router.replace('/dashboard/planner/events?view=create');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to events...</p>
      </div>
    </div>
  );
}