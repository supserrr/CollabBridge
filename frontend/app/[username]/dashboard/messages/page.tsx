"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ConversationsList } from "@/components/messaging/conversations-list";
import { MessagingInterface } from "@/components/messaging/messaging-interface";
import { Conversation } from "@/hooks/use-real-time-updates";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function MessagesPage({ params }: PageProps) {
  const { username } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.username !== username) {
      router.push(`/${user.username}/dashboard/messages`);
      return;
    }
  }, [user, authLoading, username, router]);

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

  if (!user) return null;

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    // This would open a dialog to start a new conversation
    console.log('Start new conversation');
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p !== user.id);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          
          <div className="flex-1 flex">
            {/* Conversations List */}
            <div className="w-80 border-r">
              <ConversationsList
                selectedConversationId={selectedConversation?.id}
                onConversationSelect={handleConversationSelect}
                onNewConversation={handleNewConversation}
              />
            </div>

            {/* Message Interface */}
            <div className="flex-1">
              {selectedConversation ? (
                <MessagingInterface
                  conversationId={selectedConversation.id}
                  recipientId={getOtherParticipant(selectedConversation) || ''}
                  recipientName={`Participant ${getOtherParticipant(selectedConversation)?.substring(0, 8)}`}
                  recipientAvatar={`/api/avatars/${getOtherParticipant(selectedConversation)}`}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Card className="w-96">
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a conversation from the sidebar to start messaging
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
