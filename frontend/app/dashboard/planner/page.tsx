"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardAnalytics } from "@/components/analytics/dashboard-analytics";

import data from "../data.json";

export default function PlannerDashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Dynamic Analytics Cards */}
            <DashboardAnalytics userRole="EVENT_PLANNER" />

            {/* Recent Messages */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-min">
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
            </div>
            
            {/* Main Chart - Full Width */}
            <div className="w-full">
              <ChartAreaInteractive />
            </div>
            
            {/* Data Table - Full Width */}
            <div className="w-full">
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}