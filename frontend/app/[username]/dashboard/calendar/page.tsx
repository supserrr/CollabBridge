"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth-firebase"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Calendar, Clock, MapPin, Users, Video, Phone, MessageSquare, CheckCircle, AlertCircle, Calendar as CalendarIcon, Plus } from "lucide-react"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default function CalendarPage({ params }: PageProps) {
  const { username } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/signin')
      return
    }

    if (user.username !== username) {
      router.push(`/${user.username}/dashboard/calendar`)
      return
    }
  }, [user, authLoading, username, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Mock calendar events data
  const events = [
    {
      id: 1,
      title: "Sarah & Mike's Wedding Planning",
      client: "Sarah Johnson",
      type: "wedding",
      date: "2024-03-15",
      time: "2:00 PM - 4:00 PM",
      status: "confirmed",
      location: "Downtown Convention Center",
      attendees: 2,
      meetingType: "in-person"
    },
    {
      id: 2,
      title: "Corporate Event Consultation",
      client: "TechCorp Inc.",
      type: "corporate",
      date: "2024-03-16",
      time: "10:00 AM - 11:30 AM",
      status: "pending",
      location: "Video Call",
      attendees: 5,
      meetingType: "video"
    },
    {
      id: 3,
      title: "Portfolio Review Session",
      client: "Emily Davis",
      type: "consultation",
      date: "2024-03-18",
      time: "1:00 PM - 2:00 PM",
      status: "confirmed",
      location: "Phone Call",
      attendees: 1,
      meetingType: "phone"
    },
    {
      id: 4,
      title: "Birthday Party Planning",
      client: "Rodriguez Family",
      type: "birthday",
      date: "2024-03-20",
      time: "3:00 PM - 5:00 PM",
      status: "confirmed",
      location: "Central Park Pavilion",
      attendees: 3,
      meetingType: "in-person"
    }
  ]

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "wedding": return "bg-gradient-to-r from-pink-500 to-rose-500"
      case "corporate": return "bg-gradient-to-r from-blue-500 to-indigo-500"
      case "consultation": return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "birthday": return "bg-gradient-to-r from-purple-500 to-violet-500"
      default: return "bg-gradient-to-r from-gray-500 to-slate-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending": return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />
      case "phone": return <Phone className="h-4 w-4" />
      case "in-person": return <MapPin className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your appointments and meetings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'EVENT_PLANNER' && (
            <Link href={`/${username}/dashboard/events/create`}>
              <Button className="gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          )}
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Appointment
          </Button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
        
        {/* Calendar Stats - First Row */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border">
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">appointments scheduled</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border">
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">24</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">total meetings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border">
          <CardHeader className="pb-2">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">18</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">ready to go</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border">
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">6</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">awaiting confirmation</p>
          </CardContent>
        </Card>

        {/* Upcoming Events - Second Row */}
        <Card className="md:col-span-4 lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled meetings and consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${getEventTypeColor(event.type)} flex items-center justify-center text-white`}>
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.client}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          {getMeetingIcon(event.meetingType)}
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees} attendee{event.attendees > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(event.status)}
                      <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Today's Schedule - Third Row */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common calendar operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Schedule Meeting</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Video className="h-5 w-5" />
                <span className="text-sm">Video Call</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Phone className="h-5 w-5" />
                <span className="text-sm">Phone Call</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">Consultation</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>What's happening today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Morning Review</p>
                  <p className="text-xs text-muted-foreground">9:00 AM - Prepare for client calls</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Video className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Client Consultation</p>
                  <p className="text-xs text-muted-foreground">2:00 PM - Wedding planning session</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Phone className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Follow-up Call</p>
                  <p className="text-xs text-muted-foreground">4:30 PM - Event status update</p>
                </div>
              </div>
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
