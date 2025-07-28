'use client';

import { redirect } from 'next/navigation';

export default function PlannerCalendarPage() {
  // Redirect to the unified updates page
  redirect('/dashboard/planner/updates');
}
