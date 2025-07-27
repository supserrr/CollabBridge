'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRealTimeUpdates, Conversation } from '@/hooks/use-real-time-updates';
import { useAuth } from '@/hooks/use-auth-firebase';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  selectedConversationId?: string;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export function ConversationsList({
  selectedConversationId,
  onConversationSelect,
  onNewConversation
}: ConversationsListProps) {
  const { user } = useAuth();
  const { conversations, isUserOnline } = useRealTimeUpdates();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  // Filter conversations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
    } else {
      // This would typically involve fetching participant names
      // For now, we'll just filter by conversation ID
      const filtered = conversations.filter(conv =>
        conv.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchTerm]);

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    // Find the participant who is not the current user
    return conversation.participants.find(p => p !== user?.id);
  };

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button onClick={onNewConversation} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <Button 
                variant="outline" 
                onClick={onNewConversation}
                className="mt-2"
              >
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = conversation.id === selectedConversationId;
              const isOnline = otherParticipant ? isUserOnline(otherParticipant) : false;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted",
                    conversation.unreadCount > 0 && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/api/avatars/${otherParticipant}`} />
                      <AvatarFallback>
                        {otherParticipant?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-medium truncate",
                        conversation.unreadCount > 0 && "font-semibold"
                      )}>
                        {/* This would typically be fetched participant name */}
                        Participant {otherParticipant?.substring(0, 8)}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatLastMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {conversation.lastMessage && (
                      <p className={cn(
                        "text-sm text-muted-foreground truncate mt-1",
                        conversation.unreadCount > 0 && "font-medium text-foreground"
                      )}>
                        {conversation.lastMessage.senderId === user?.id && 'You: '}
                        {truncateMessage(conversation.lastMessage.content)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
