'use client';

import { redirect } from 'next/navigation';

export default function ProfessionalMessagesPage() {
  // Redirect to the dynamic route
  redirect('/dashboard/professional/messages');
}
