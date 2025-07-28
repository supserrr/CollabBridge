'use client';

import { redirect } from 'next/navigation';

export default function ProfessionalCalendarPage() {
  // Redirect to the unified updates page
  redirect('/dashboard/professional/updates');
}
