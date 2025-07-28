'use client';

import { redirect } from 'next/navigation';

export default function PlannerMessagesPage() {
  // Redirect to the unified updates page
  redirect('/dashboard/planner/updates');
}
