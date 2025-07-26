'use client';

import { redirect } from 'next/navigation';

export default function ProfessionalCalendarPage() {
  // Redirect to the dynamic route
  redirect('/dashboard/professional/calendar');
}
