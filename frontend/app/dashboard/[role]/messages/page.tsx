"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile,
  Users,
  Calendar,
  MapPin,
  Star,
  Circle,
  Check,
  CheckCheck,
  ArrowLeft,
  Plus,
  Filter,
  Archive,
  Trash2,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: 'professional' | 'planner';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  eventId?: string;
  eventTitle?: string;
  status: 'active' | 'archived' | 'blocked';
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  role: 'professional' | 'planner';
  isOnline: boolean;
  lastSeen?: string;
  title?: string;
  location?: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowConversationList(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser?.id || '',
      receiverId: selectedConversation.participantId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      messageType: 'text',
      isRead: false
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          messageType: 'text'
        })
      });
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex h-[calc(100vh-2rem)] bg-background rounded-lg border overflow-hidden">
            {/* Conversations Sidebar */}
            <AnimatePresence mode="wait">
              {(showConversationList || !isMobile) && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className={cn(
                    "border-r bg-card flex flex-col",
                    isMobile ? "absolute inset-0 z-20" : "w-80"
                  )}
          >
            {/* Conversations Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Messages</h1>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>All Conversations</DropdownMenuItem>
                      <DropdownMenuItem>Unread</DropdownMenuItem>
                      <DropdownMenuItem>Archived</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Mark all as read</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted",
                      selectedConversation?.id === conversation.id && "bg-muted"
                    )}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.participantAvatar} />
                        <AvatarFallback>
                          {conversation.participantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <Circle className="absolute -bottom-1 -right-1 h-4 w-4 fill-green-500 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{conversation.participantName}</p>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessageTime}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="min-w-[20px] h-5 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conversation.eventTitle && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {conversation.eventTitle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button variant="ghost" size="sm" onClick={handleBackToList}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.participantAvatar} />
                    <AvatarFallback>
                      {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation.isOnline && (
                    <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                  )}
                </div>
                
                <div>
                  <p className="font-medium">{selectedConversation.participantName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.isOnline 
                      ? 'Online' 
                      : `Last seen ${selectedConversation.lastMessageTime}`
                    }
                  </p>
                </div>

                <Badge variant="outline" className="capitalize">
                  {selectedConversation.participantRole}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>View Event Details</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-yellow-600">
                      <Flag className="h-4 w-4 mr-2" />
                      Report User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.senderId === currentUser?.id;
                  const showAvatar = !isOwnMessage && (
                    index === 0 || 
                    messages[index - 1].senderId !== message.senderId
                  );

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isOwnMessage && (
                        <Avatar className={cn("h-8 w-8", !showAvatar && "invisible")}>
                          <AvatarImage src={selectedConversation.participantAvatar} />
                          <AvatarFallback className="text-xs">
                            {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={cn(
                        "max-w-[70%] space-y-1",
                        isOwnMessage && "flex flex-col items-end"
                      )}>
                        <div className={cn(
                          "px-4 py-2 rounded-2xl",
                          isOwnMessage 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}>
                          {message.messageType === 'system' ? (
                            <p className="text-center text-sm text-muted-foreground italic">
                              {message.content}
                            </p>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}

                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-background/20 rounded">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm">{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className={cn(
                          "flex items-center gap-1 text-xs text-muted-foreground",
                          isOwnMessage && "justify-end"
                        )}>
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isOwnMessage && (
                            <div className="flex items-center">
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[40px] max-h-32 resize-none pr-12"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  // Handle file upload
                  console.log('Files selected:', e.target.files);
                }}
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to Messages</h3>
                <p className="text-muted-foreground max-w-sm">
                  Select a conversation to start chatting with event planners and creative professionals
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div> {/* Close chat area div (flex-1 flex flex-col) */}
          </div> {/* Close flex h-[calc(100vh-2rem)] div */}
        </div> {/* Close flex flex-1 flex-col div */}
      </SidebarInset>
    </SidebarProvider>
  );
}
