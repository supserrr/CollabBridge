import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from './use-auth-firebase';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  conversationId: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  senderName?: string;
  senderAvatar?: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'booking' | 'application' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export function useRealTimeUpdates() {
  const { user } = useAuth();
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const connectSocket = useCallback(() => {
    if (!user || socketRef.current?.connected) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://collabbridge.onrender.com';
    
    socketRef.current = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Message events
    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Add notification for new message
      if (message.senderId !== user.id) {
        const notification: Notification = {
          id: `msg_${message.id}`,
          type: 'message',
          title: 'New Message',
          message: `${message.senderName || 'Someone'} sent you a message`,
          timestamp: new Date(),
          isRead: false,
          actionUrl: `/messages/${message.conversationId}`,
          data: message
        };
        setNotifications(prev => [notification, ...prev]);
      }
    });

    socket.on('message_read', ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    // Notification events
    socket.on('new_notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Online users
    socket.on('users_online', (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on('user_online', (userId: string) => {
      setOnlineUsers(prev => Array.from(new Set([...prev, userId])));
    });

    socket.on('user_offline', (userId: string) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    // Conversation updates
    socket.on('conversation_updated', (conversation: Conversation) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === conversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = conversation;
          return updated;
        }
        return [conversation, ...prev];
      });
    });

  }, [user]);

  useEffect(() => {
    if (user) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, connectSocket]);

  const sendMessage = useCallback((conversationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    if (socketRef.current?.connected && user) {
      socketRef.current.emit('send_message', {
        conversationId,
        content,
        messageType,
        senderId: user.id
      });
    }
  }, [user]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  }, []);

  const markMessageAsRead = useCallback((messageId: string, conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_message_read', { messageId, conversationId });
    }
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_notification_read', notificationId);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadNotificationCount = useCallback(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  return {
    isConnected,
    notifications,
    messages,
    conversations,
    onlineUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
    markNotificationAsRead,
    clearNotifications,
    getUnreadNotificationCount,
    isUserOnline,
    socket: socketRef.current
  };
}

