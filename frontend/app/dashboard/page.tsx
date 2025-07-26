"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-min">
              
              {/* First Row - Stats Cards */}
              {/* Total Revenue */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">$34,250</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +18.2%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">This month's performance</p>
              </div>

              {/* Active Users */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Active Users</p>
                  <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">1,847</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +24.1%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Growing user base</p>
              </div>

              {/* Success Rate */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                  <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">94.8%</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +2.4%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Event completion rate</p>
              </div>

              {/* Second Row */}
              {/* Platform Rating */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950/50 dark:to-orange-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Platform Rating</p>
                  <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">4.9</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      +0.1
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Based on 2,341 reviews</p>
              </div>

              {/* Monthly Growth */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Monthly Growth</p>
                  <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">28.5%</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      New Registrations
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">456 new users this month</p>
              </div>

              {/* System Health */}
              <div className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 rounded-xl border p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">System Health</p>
                  <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100">99.9%</h2>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Operational
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">All systems running smoothly</p>
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
  )
}
