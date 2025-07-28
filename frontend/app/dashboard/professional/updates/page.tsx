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

// Mock data for demonstration
const mockConversations = [
  {
    id: '1',
    participantId: 'user1',
    participantName: 'Sarah Johnson',
    participantAvatar: '',
    lastMessage: 'Thanks for your portfolio submission! We\'d love to discuss the wedding details further.',
    timestamp: new Date('2024-01-15T14:30:00'),
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '2',
    participantId: 'user2',
    participantName: 'Michael Chen',
    participantAvatar: '',
    lastMessage: 'The corporate event proposal looks great. When can we schedule a call?',
    timestamp: new Date('2024-01-15T10:15:00'),
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '3',
    participantId: 'user3',
    participantName: 'Emily Rodriguez',
    participantAvatar: '',
    lastMessage: 'Could you send me some additional portfolio samples for the birthday party?',
    timestamp: new Date('2024-01-14T16:45:00'),
    unreadCount: 1,
    isOnline: true
  }
];

const mockEvents = [
  {
    id: '1',
    title: 'Sarah & John Wedding Consultation',
    description: 'Initial meeting to discuss wedding photography requirements',
    startDate: new Date('2024-01-20T14:00:00'),
    endDate: new Date('2024-01-20T15:30:00'),
    location: 'Downtown Cafe',
    type: 'meeting',
    status: 'scheduled',
    priority: 'high',
    attendees: ['Sarah Johnson', 'John Smith']
  },
  {
    id: '2',
    title: 'Corporate Gala Setup',
    description: 'Event setup and preparation for TechCorp annual gala',
    startDate: new Date('2024-01-25T09:00:00'),
    endDate: new Date('2024-01-25T18:00:00'),
    location: 'Grand Ballroom',
    type: 'event',
    status: 'scheduled',
    priority: 'urgent',
    attendees: ['Michael Chen', 'Event Team']
  },
  {
    id: '3',
    title: 'Portfolio Review Deadline',
    description: 'Submit updated portfolio samples for Q1 projects',
    startDate: new Date('2024-01-18T23:59:00'),
    endDate: new Date('2024-01-18T23:59:00'),
    location: 'Online',
    type: 'deadline',
    status: 'scheduled',
    priority: 'medium',
    attendees: []
  }
];

export default function UpdatesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContactUsername, setNewContactUsername] = useState('');
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);

  // Filter conversations based on search
  const filteredConversations = mockConversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter upcoming events
  const upcomingEvents = mockEvents
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const handleNewContact = () => {
    if (!newContactUsername.trim()) return;
    
    // Here you would implement the logic to find user by username
    // and create a new conversation
    console.log('Creating conversation with username:', newContactUsername);
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
                      placeholder="Enter username to message"
                      value={newContactUsername}
                      onChange={(e) => setNewContactUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsNewContactDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleNewContact}>
                      Start Conversation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Conversations</span>
                    <Badge variant="secondary">
                      {filteredConversations.reduce((acc, conv) => acc + conv.unreadCount, 0)} unread
                    </Badge>
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    <div className="space-y-1 p-4 pt-0">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
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
                                {conversation.participantName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {conversation.participantName}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {conversation.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                          
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Message Interface */}
              <Card className="lg:col-span-2">
                {selectedConversation ? (
                  <div className="h-full">
                    {(() => {
                      const conversation = mockConversations.find(c => c.id === selectedConversation);
                      return conversation ? (
                        <MessagingInterface
                          conversationId={conversation.id}
                          recipientId={conversation.participantId}
                          recipientName={conversation.participantName}
                          recipientAvatar={conversation.participantAvatar}
                          onlineStatus={conversation.isOnline}
                        />
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getEventTypeIcon(event.type)}
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                      </div>
                      <Badge variant={getPriorityColor(event.priority)}>
                        {event.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatEventTime(event.startDate)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.attendees.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.attendees.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline">
                        {event.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {upcomingEvents.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarProvider>
  );
}
