'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Calendar as CalendarIcon, 
  Search, 
  UserPlus, 
  Filter,
  Bell,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessagingInterface } from '@/components/messaging/messaging-interface';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useAuth } from '@/hooks/use-auth-firebase';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: 'event' | 'meeting' | 'deadline';
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attendees: string[];
}

export default function PlannerUpdatesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContactUsername, setNewContactUsername] = useState('');
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
  
  // Real data states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !auth.currentUser) return;
      
      try {
        const token = await auth.currentUser.getIdToken();
        
        // Fetch conversations
        const conversationsResponse = await fetch('/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          setConversations(conversationsData.data || []);
        }

        // Fetch upcoming events
        const eventsResponse = await fetch('/api/calendar/events?type=upcoming', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setUpcomingEvents(eventsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewContact = async () => {
    if (!newContactUsername.trim() || !auth.currentUser) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      
      // Create a new conversation
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientUsername: newContactUsername.trim(),
          content: `Hi! I'd like to connect with you for potential collaboration opportunities.`,
        }),
      });

      if (response.ok) {
        // Refresh conversations
        const conversationsResponse = await fetch('/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          setConversations(conversationsData.data || []);
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    
    setNewContactUsername('');
    setIsNewContactDialogOpen(false);
  };

  const formatEventTime = (date: Date) => {
    return new Date(date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'event':
        return <CalendarIcon className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Updates</h2>
          <div className="flex items-center space-x-2">
            <Dialog open={isNewContactDialogOpen} onOpenChange={setIsNewContactDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  New Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username to connect"
                      value={newContactUsername}
                      onChange={(e) => setNewContactUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsNewContactDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleNewContact}>
                      Connect
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Conversations List */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Conversations
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-start space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredConversations.length > 0 ? (
                      <div className="space-y-4">
                        {filteredConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className={cn(
                              "flex items-start space-x-4 p-3 rounded-lg cursor-pointer transition-colors",
                              selectedConversation === conversation.id
                                ? "bg-accent"
                                : "hover:bg-accent/50"
                            )}
                            onClick={() => setSelectedConversation(conversation.id)}
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={conversation.participantAvatar} />
                                <AvatarFallback>
                                  {conversation.participantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.isOnline && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{conversation.participantName}</p>
                                <span className="text-xs text-muted-foreground">
                                  {formatEventTime(conversation.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>No conversations found</p>
                        <p className="text-sm">Start a new conversation with professionals</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Message Thread */}
              <Card className="col-span-4">
                <CardContent className="p-0">
                  {selectedConversation ? (
                    <MessagingInterface 
                      conversationId={selectedConversation}
                      className="h-[500px]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">Select a conversation</p>
                        <p>Choose a conversation from the list to start messaging</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-5 w-5" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 pt-1">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium">{event.title}</h3>
                            <Badge variant={getPriorityColor(event.priority)}>
                              {event.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatEventTime(event.startDate)}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.location}
                            </span>
                            {event.attendees.length > 0 && (
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {event.attendees.length} attendees
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>No upcoming events</p>
                    <p className="text-sm">Your calendar is clear for now</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarProvider>
  );
}
