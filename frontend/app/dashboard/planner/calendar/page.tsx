'use client';

import { redirect } from 'next/navigation';

export default function PlannerCalendarPage() {
  // Redirect to the dynamic route
  redirect('/dashboard/planner/calendar');
}
