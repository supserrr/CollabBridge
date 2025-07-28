"use client";

import React, { useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Search, Briefcase } from "lucide-react";
import Link from "next/link";

import data from "../../../dashboard/data.json";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function ProfessionalDashboard({ params }: PageProps) {
  const { username } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.username !== username) {
      router.push(`/${user.username}/dashboard/professional`);
      return;
    }
  }, [user, authLoading, username, router]);

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
            
            {/* Header Section with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Professional Dashboard</h1>
                <p className="text-muted-foreground">Manage your portfolio and find new opportunities</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/${username}/dashboard/browse-events`}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Events
                  </Button>
                </Link>
                <Link href={`/${username}/dashboard/portfolio`}>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Manage Portfolio
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-min">
              
              {/* First Row - Stats Cards */}
              {/* Total Earnings */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">$2,450.00</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +12.5%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Strong growth this month</p>
              </div>

              {/* New Customers */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">New Customers</p>
                  <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">234</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      -20%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Needs attention</p>
              </div>

              {/* Portfolio Views */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Portfolio Views</p>
                  <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">1,847</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +28.5%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Growing visibility</p>
              </div>

              {/* Second Row */}
              {/* Client Rating */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950/50 dark:to-orange-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Client Rating</p>
                  <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">4.9</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      +0.2
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Based on 47 reviews</p>
              </div>

              {/* Quick Stats */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Quick Stats</p>
                  <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">12</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Active Projects
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">48 completed, 3 in review</p>
              </div>

              {/* Recent Activity */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recent Activity</p>
                  <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100">3</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      New Updates
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Project completed 2h ago</p>
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
