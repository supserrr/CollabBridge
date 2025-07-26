'use client';

import { redirect } from 'next/navigation';

export default function PlannerMessagesPage() {
  // Redirect to the dynamic route
  redirect('/dashboard/planner/messages');
}
