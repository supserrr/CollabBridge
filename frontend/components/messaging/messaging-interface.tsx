'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRealTimeUpdates, Message } from '@/hooks/use-real-time-updates';
import { useAuth } from '@/hooks/use-auth-firebase';
import { cn } from '@/lib/utils';

interface MessagingInterfaceProps {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onlineStatus?: boolean;
}

export function MessagingInterface({
  conversationId,
  recipientId,
  recipientName,
  recipientAvatar,
  onlineStatus = false
}: MessagingInterfaceProps) {
  const { user } = useAuth();
  const {
    messages,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
    isUserOnline
  } = useRealTimeUpdates();

  const [newMessage, setNewMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter messages for this conversation
  useEffect(() => {
    const filtered = messages.filter(msg => msg.conversationId === conversationId);
    setConversationMessages(filtered);
  }, [messages, conversationId]);

  // Join conversation on mount
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, joinConversation, leaveConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = conversationMessages.filter(
      msg => !msg.isRead && msg.receiverId === user?.id
    );

    unreadMessages.forEach(msg => {
      markMessageAsRead(msg.id, conversationId);
    });
  }, [conversationMessages, user?.id, markMessageAsRead, conversationId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessage(conversationId, newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOnline = isUserOnline(recipientId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>
                {recipientName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <p className="text-xs text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversationMessages.map((message, index) => {
            const isCurrentUser = message.senderId === user?.id;
            const showAvatar = !isCurrentUser && (
              index === 0 || 
              conversationMessages[index - 1]?.senderId !== message.senderId
            );

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={recipientAvatar} />
                        <AvatarFallback>
                          {recipientName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>
                )}

                <div className={cn(
                  "max-w-[70%] rounded-lg px-3 py-2",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}>
                  <p className="text-sm">{message.content}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}>
                    <span className={cn(
                      "text-xs",
                      isCurrentUser 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    )}>
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {isCurrentUser && message.isRead && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        Read
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
