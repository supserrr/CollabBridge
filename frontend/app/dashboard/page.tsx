"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth-firebase";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/firebase";

interface DashboardStats {
  totalRevenue?: number;
  revenueGrowth?: number;
  activeUsers?: number;
  userGrowth?: number;
  successRate?: number;
  successRateChange?: number;
  platformRating?: number;
  ratingChange?: number;
  monthlyGrowth?: number;
  newRegistrations?: number;
  systemHealth?: number;
  totalEvents?: number;
  totalBookings?: number;
  avgRating?: number;
  reviewCount?: number;
}

export default function Page() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !auth.currentUser) return;
      
      try {
        const token = await auth.currentUser.getIdToken();
        
        // Fetch analytics data
        const analyticsResponse = await fetch('/api/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData.analytics) {
            setStats(analyticsData.analytics);
          }
        }

        // Fetch events data for table
        const eventsResponse = await fetch('/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setTableData(eventsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatPercentage = (value: number | undefined) => 
    value ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : '+0.0%';

  const formatCurrency = (value: number | undefined) => 
    value ? `$${value.toLocaleString()}` : '$0';

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="space-y-6">
              <div className="text-center p-8">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                  Real-time analytics and insights for your events
                </p>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-24 mb-4" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-950/50">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(stats.totalRevenue)}
                    </h3>
                    <p className="text-sm text-green-600">{formatPercentage(stats.revenueGrowth)}</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-purple-50 dark:bg-purple-950/50">
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {stats.activeUsers?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-sm text-green-600">{formatPercentage(stats.userGrowth)}</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-950/50">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {stats.successRate ? `${stats.successRate.toFixed(1)}%` : '0.0%'}
                    </h3>
                    <p className="text-sm text-green-600">{formatPercentage(stats.successRateChange)}</p>
                  </div>
                  
                  <div className="p-6 border rounded-lg bg-orange-50 dark:bg-orange-950/50">
                    <p className="text-sm text-muted-foreground">Platform Rating</p>
                    <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {stats.avgRating ? stats.avgRating.toFixed(1) : '0.0'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.reviewCount || 0} reviews
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Analytics Overview</h3>
                  <ChartAreaInteractive />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <DataTable data={tableData} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
