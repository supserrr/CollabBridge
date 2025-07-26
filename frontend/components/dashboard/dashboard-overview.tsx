"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { StatsWidget } from "@/components/ui/stats-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  ChatBubble, 
  ChatBubbleMessage, 
  ChatBubbleAvatar 
} from "@/components/ui/chat-bubble";
import { 
  Briefcase, 
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  TrendingUp,
  Star,
  Award,
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";

interface DashboardOverviewProps {
  userRole: "CREATIVE_PROFESSIONAL" | "EVENT_PLANNER";
  stats: {
    primary: { title: string; amount: number; change: number; currency?: string };
    secondary: Array<{ title: string; value: string | number; icon: React.ReactNode; change?: string }>;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    status?: string;
  }>;
  upcomingEvents?: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    views: number;
    applications: number;
    status: string;
    tags: string[];
    createdAt: string;
  }>;
  events?: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    budget: number;
    currency: string;
    status: string;
    applications: number;
    confirmedCreatives: number;
    category: string;
    description: string;
  }>;
}

export function DashboardOverview({ 
  userRole, 
  stats, 
  recentActivity, 
  upcomingEvents = [],
  projects = [],
  events = []
}: DashboardOverviewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const bentoItems = [
    {
      name: "Performance Overview",
      className: "col-span-3 md:col-span-2 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20" />
      ),
      Icon: TrendingUp,
      description: "Track your key metrics and performance indicators",
      href: "#analytics",
      cta: "View Analytics",
    },
    {
      name: "Recent Messages",
      className: "col-span-3 md:col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20" />
      ),
      Icon: MessageSquare,
      description: "Stay connected with your network",
      href: "#messages",
      cta: "View All",
    },
    {
      name: userRole === "CREATIVE_PROFESSIONAL" ? "Portfolio Projects" : "Active Events",
      className: "col-span-3 md:col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20" />
      ),
      Icon: userRole === "CREATIVE_PROFESSIONAL" ? Briefcase : CalendarIcon,
      description: userRole === "CREATIVE_PROFESSIONAL" 
        ? "Manage your creative portfolio" 
        : "Organize and track your events",
      href: userRole === "CREATIVE_PROFESSIONAL" ? "#portfolio" : "#events",
      cta: "Manage",
    },
    {
      name: "Calendar & Schedule",
      className: "col-span-3 md:col-span-2 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20" />
      ),
      Icon: CalendarIcon,
      description: "Keep track of important dates and deadlines",
      href: "#calendar",
      cta: "View Calendar",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <StatsWidget
              title={stats.primary.title}
              amount={stats.primary.amount}
              change={stats.primary.change}
              currency={stats.primary.currency}
              className="h-full"
            />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.secondary.slice(0, 2).map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BentoGrid className="auto-rows-[20rem] grid-cols-1 md:grid-cols-3">
          {bentoItems.map((item) => (
            <BentoCard key={item.name} {...item} />
          ))}
        </BentoGrid>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Activity
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === 'message' && <MessageSquare className="h-4 w-4" />}
                      {activity.type === 'project' && <Briefcase className="h-4 w-4" />}
                      {activity.type === 'event' && <CalendarIcon className="h-4 w-4" />}
                      {activity.type === 'application' && <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      {activity.status && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar & Upcoming */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userRole === "CREATIVE_PROFESSIONAL" ? (
                <>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Update Portfolio
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Events
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Find Creatives
                  </Button>
                </>
              )}
              <Button className="w-full justify-start" variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardOverview;
