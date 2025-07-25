'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-firebase';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    username: string;
  };
}

export default function ReviewsPage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Verify the username matches the logged-in user
      if (user.username !== params.username) {
        router.push(`/${user.username}/dashboard/reviews`);
        return;
      }
    } else if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router, params.username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold">Reviews</h1>
                <p className="text-muted-foreground">View and manage your client reviews and feedback</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">Reviews feature coming soon</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Client reviews and ratings will be displayed here once available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
