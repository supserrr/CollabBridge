"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconCurrencyDollar, 
  IconCalendar,
  IconArrowUpRight,
  IconArrowDownRight,
  IconLoader2
} from "@tabler/icons-react"
import { useDashboardAnalytics } from "@/hooks/use-dashboard-analytics"
import { useEffect, useState } from "react"

export function DashboardCharts() {
  const { analytics, chartData, isLoading, error, refreshChartData } = useDashboardAnalytics();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!isLoading) {
      refreshChartData(selectedTimeRange, 'events');
    }
  }, [selectedTimeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <IconLoader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <span>Error loading analytics: {error}</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <span>No analytics data available</span>
      </div>
    );
  }

  // Process chart data for monthly revenue view
  const monthlyData = chartData.slice(-6).map((item, index) => {
    const date = new Date(item.date);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const prevValue = index > 0 ? chartData[chartData.length - 6 + index - 1].value : 0;
    const growth = prevValue > 0 ? ((item.value - prevValue) / prevValue * 100) : 0;
    
    return {
      month,
      revenue: item.value * 1000, // Convert to revenue estimate
      projects: item.value,
      growth: Math.round(growth)
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant={selectedTimeRange === '7d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeRange('7d')}
          >
            7D
          </Button>
          <Button 
            variant={selectedTimeRange === '30d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeRange('30d')}
          >
            30D
          </Button>
          <Button 
            variant={selectedTimeRange === '90d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeRange('90d')}
          >
            90D
          </Button>
        </div>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="services">Performance</TabsTrigger>
          <TabsTrigger value="performance">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your activity performance over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={data.month + index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium w-12">{data.month}</div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <IconCurrencyDollar className="h-4 w-4 text-green-600" />
                          <span className="font-medium">${data.revenue.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {data.projects} activities
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {data.growth > 0 ? (
                        <>
                          <IconArrowUpRight className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">+{data.growth}%</span>
                        </>
                      ) : data.growth < 0 ? (
                        <>
                          <IconArrowDownRight className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">{data.growth}%</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-gray-600">0%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Your current performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Events</span>
                      <span className="font-medium">{analytics.totalEvents.current}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analytics.totalEvents.change > 0 ? '+' : ''}{analytics.totalEvents.change.toFixed(1)}% from last month
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Active Bookings</span>
                      <span className="font-medium">{analytics.activeBookings.current}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analytics.activeBookings.change > 0 ? '+' : ''}{analytics.activeBookings.change.toFixed(1)}% from last month
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Team Rating</span>
                      <span className="font-medium">{analytics.teamPerformance.rating}/5.0</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analytics.teamPerformance.totalReviews} reviews
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Revenue</span>
                      <span className="font-medium">${analytics.revenue.current.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analytics.revenue.change > 0 ? '+' : ''}{analytics.revenue.change.toFixed(1)}% from last month
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget Utilization</CardTitle>
                <CardDescription>
                  Current budget allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Budget Used</span>
                    <span className="font-medium">
                      ${analytics.budgetUtilization.used.toLocaleString()} / ${analytics.budgetUtilization.total.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={analytics.budgetUtilization.percentage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Team Rating</span>
                    <span className="font-medium">{analytics.teamPerformance.rating}/5.0</span>
                  </div>
                  <Progress value={(analytics.teamPerformance.rating / 5) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Activity</CardTitle>
                <CardDescription>
                  Your schedule overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Upcoming Events</span>
                    <span className="font-medium">{analytics.upcomingEvents.count}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Next: {analytics.upcomingEvents.next}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Revenue</span>
                    <span className="font-medium">${analytics.revenue.current.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
