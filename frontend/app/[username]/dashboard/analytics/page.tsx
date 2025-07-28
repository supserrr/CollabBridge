"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TrendingUp, Eye, Users, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth-firebase"
import { useRouter } from "next/navigation"
import { useEffect, use } from "react"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default function AnalyticsPage({ params }: PageProps) {
  const { username } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/signin')
      return
    }

    if (user.username !== username) {
      router.push(`/${user.username}/dashboard/analytics`)
      return
    }
  }, [user, authLoading, username, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                  Track your performance and business insights
                </p>
              </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
              
              {/* First Row - Key Metrics */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Profile Views</CardDescription>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">2,847</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-muted-foreground">+12% from last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Inquiries</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">89</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-muted-foreground">+8% from last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Conversion Rate</CardDescription>
                  <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">24%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-muted-foreground">+3% from last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Avg Booking Value</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">$1,250</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-muted-foreground">+15% from last month</p>
                  </div>
                </CardContent>
              </Card>

              {/* Second Row - Performance Chart (Full Width) */}
              <Card className="md:col-span-4 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your business metrics over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ChartAreaInteractive />
                </CardContent>
              </Card>

              {/* Third Row - Analytics Breakdown */}
              <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Google Search</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">1,234</p>
                        <p className="text-xs text-muted-foreground">43%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Direct</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">876</p>
                        <p className="text-xs text-muted-foreground">31%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Social Media</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">456</p>
                        <p className="text-xs text-muted-foreground">16%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Referrals</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">281</p>
                        <p className="text-xs text-muted-foreground">10%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Quick Insights</CardTitle>
                  <CardDescription>Key recommendations for growth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Peak Viewing Hours</p>
                    <p className="text-xs text-muted-foreground">Most views between 2-4 PM</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Best Performing Day</p>
                    <p className="text-xs text-muted-foreground">Wednesdays generate 30% more inquiries</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Portfolio Optimization</p>
                    <p className="text-xs text-muted-foreground">Add 2-3 more wedding photos</p>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
