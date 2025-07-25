"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "../../../dashboard/data.json";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    username: string;
  };
}

export default function PlannerDashboard({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.username !== params.username) {
      router.push(`/${user.username}/dashboard/planner`);
      return;
    }
  }, [user, authLoading, params.username, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-min">
              
              {/* First Row - Stats Cards */}
              {/* Total Events */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Events</p>
                  <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">18</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +15.8%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Events this quarter</p>
              </div>

              {/* Active Bookings */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Active Bookings</p>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">47</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +22.3%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Professionals booked</p>
              </div>

              {/* Budget Utilization */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Budget Utilization</p>
                  <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">73%</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Within Target
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">$18,450 of $25,000</p>
              </div>

              {/* Second Row */}
              {/* Upcoming Events */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Upcoming Events</p>
                  <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">5</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                      Next 30 days
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Corporate gala in 3 days</p>
              </div>

              {/* Team Performance */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Team Performance</p>
                  <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">4.8</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Excellent
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Average rating from clients</p>
              </div>

              {/* Recent Messages */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Messages</p>
                  <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100">12</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                      3 Unread
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Latest from Sarah M.</p>
              </div>
              
              {/* Main Chart - Full Width */}
              <div className="md:col-span-3 lg:col-span-3">
                <div className="h-full">
                  <ChartAreaInteractive />
                </div>
              </div>
              
              {/* Data Table - Full Width */}
              <div className="md:col-span-3 lg:col-span-3">
                <DataTable data={data} />
              </div>
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
