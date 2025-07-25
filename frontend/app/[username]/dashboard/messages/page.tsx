"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Phone, Video, MoreVertical } from "lucide-react";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    username: string;
  };
}

export default function MessagesPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.username !== params.username) {
      router.push(`/${user.username}/dashboard/messages`);
      return;
    }
  }, [user, authLoading, params.username, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const conversations = [
    {
      id: "1",
      name: "Sarah & Mike Johnson",
      avatar: "/avatars/01.png",
      lastMessage: "Thank you for the amazing wedding photos! We absolutely love them.",
      timestamp: "2 hours ago",
      unread: 2,
      type: "Wedding Photography"
    },
    {
      id: "2",
      name: "TechCorp Inc.",
      avatar: "/avatars/02.png", 
      lastMessage: "Can we schedule a call to discuss the corporate event coverage?",
      timestamp: "5 hours ago",
      unread: 1,
      type: "Corporate Event"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      avatar: "/avatars/03.png",
      lastMessage: "The family portrait session was perfect. When will the photos be ready?",
      timestamp: "1 day ago",
      unread: 0,
      type: "Family Portrait"
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
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground">
                  Communicate with clients and manage inquiries
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Total Messages</CardDescription>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">247</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">12 this week</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Unread</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Respond soon</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Active Conversations</CardDescription>
                  <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">15</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">With clients</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Response Rate</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">98%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Within 2 hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Messages Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              
              {/* Conversations List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-8"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{conversation.name}</p>
                              <div className="flex items-center space-x-2">
                                {conversation.unread > 0 && (
                                  <Badge variant="default" className="h-5 w-5 p-0 text-xs rounded-full flex items-center justify-center">
                                    {conversation.unread}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{conversation.type}</p>
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatars/01.png" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Sarah & Mike Johnson</p>
                        <p className="text-sm text-muted-foreground">Wedding Photography</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                    {/* Sample messages */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-xs">
                        <p className="text-sm">Hi Sarah! Thank you for choosing me for your wedding photography. I'm excited to capture your special day!</p>
                        <p className="text-xs opacity-70 mt-1">2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-3 py-2 max-w-xs">
                        <p className="text-sm">Thank you so much! We're really looking forward to working with you. The venue is absolutely beautiful.</p>
                        <p className="text-xs text-muted-foreground mt-1">2:35 PM</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
