"use client";

import React, { useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function BookingsPage({ params }: PageProps) {
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
      router.push(`/${user.username}/dashboard/bookings`);
      return;
    }
  }, [user, authLoading, username, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingBookings = [
    {
      id: "1",
      title: "Wedding Photography - Sarah & Mike",
      client: "Sarah Johnson",
      date: "2024-02-15",
      time: "10:00 AM",
      location: "Grand Ballroom, Downtown Hotel",
      amount: "$2,500",
      status: "confirmed",
      avatar: "/avatars/01.png"
    },
    {
      id: "2", 
      title: "Corporate Event Coverage",
      client: "TechCorp Inc.",
      date: "2024-02-20",
      time: "2:00 PM",
      location: "Conference Center",
      amount: "$1,800",
      status: "pending",
      avatar: "/avatars/02.png"
    },
    {
      id: "3",
      title: "Family Portrait Session",
      client: "Rodriguez Family",
      date: "2024-02-22",
      time: "11:00 AM", 
      location: "Central Park",
      amount: "$450",
      status: "confirmed",
      avatar: "/avatars/03.png"
    }
  ];

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
                <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                <p className="text-muted-foreground">
                  Manage your confirmed bookings and upcoming events
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Total Bookings</CardDescription>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">23</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">+3 this month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Upcoming Events</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">7</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Next 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Pending Confirmations</CardDescription>
                  <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">$12.8K</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">This quarter</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your scheduled events and photo sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={booking.avatar} />
                        <AvatarFallback>{booking.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{booking.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                            <span className="font-medium text-green-600">{booking.amount}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Client: {booking.client}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Calendar</CardTitle>
                  <CardDescription>Your upcoming schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div>
                        <p className="font-medium">Feb 15 - Wedding</p>
                        <p className="text-sm text-muted-foreground">Sarah & Mike Johnson</p>
                      </div>
                      <Badge>Confirmed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div>
                        <p className="font-medium">Feb 20 - Corporate</p>
                        <p className="text-sm text-muted-foreground">TechCorp Event</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div>
                        <p className="font-medium">Feb 22 - Portrait</p>
                        <p className="text-sm text-muted-foreground">Rodriguez Family</p>
                      </div>
                      <Badge>Confirmed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your bookings efficiently</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule New Booking
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Clients
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Generate Invoice
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    Time Tracking
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
