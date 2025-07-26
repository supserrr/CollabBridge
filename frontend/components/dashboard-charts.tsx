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
  IconArrowDownRight
} from "@tabler/icons-react"

export function DashboardCharts() {
  const monthlyData = [
    { month: "Jan", revenue: 4200, projects: 8, growth: 12 },
    { month: "Feb", revenue: 3800, projects: 6, growth: -8 },
    { month: "Mar", revenue: 5100, projects: 12, growth: 34 },
    { month: "Apr", revenue: 4700, projects: 10, growth: -8 },
    { month: "May", revenue: 5900, projects: 15, growth: 26 },
    { month: "Jun", revenue: 6200, projects: 18, growth: 5 },
  ]

  const topServices = [
    { service: "Wedding Photography", bookings: 45, revenue: 67500, growth: 15 },
    { service: "Portrait Sessions", bookings: 32, revenue: 19200, growth: 8 },
    { service: "Corporate Events", bookings: 18, revenue: 27000, growth: -5 },
    { service: "Product Photography", bookings: 25, revenue: 15000, growth: 22 },
  ]

  return (
    <div className="space-y-4">
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="services">Top Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Your revenue performance over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium w-12">{data.month}</div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <IconCurrencyDollar className="h-4 w-4 text-green-600" />
                          <span className="font-medium">${data.revenue.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {data.projects} projects completed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {data.growth > 0 ? (
                        <>
                          <IconArrowUpRight className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">+{data.growth}%</span>
                        </>
                      ) : (
                        <>
                          <IconArrowDownRight className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">{data.growth}%</span>
                        </>
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
              <CardTitle>Top Performing Services</CardTitle>
              <CardDescription>
                Your most popular and profitable service offerings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={service.service} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="font-medium">{service.service}</span>
                          <Badge variant="outline">{service.bookings} bookings</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue: ${service.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {service.growth > 0 ? (
                          <IconTrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <IconTrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${service.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {service.growth > 0 ? '+' : ''}{service.growth}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={(service.revenue / Math.max(...topServices.map(s => s.revenue))) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Health</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Client Retention Rate</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Project Success Rate</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>On-Time Delivery</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Client Satisfaction</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
                <CardDescription>
                  Track your progress towards monthly targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Revenue Target</span>
                    <span className="font-medium">$7,500 / $10,000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Project Target</span>
                    <span className="font-medium">12 / 15</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>New Clients</span>
                    <span className="font-medium">8 / 10</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">Days remaining</span>
                  <Badge variant="secondary">12 days</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
