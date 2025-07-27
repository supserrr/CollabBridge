'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRealTimeUpdates, Notification } from '@/hooks/use-real-time-updates';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  showToast: boolean;
  setShowToast: (show: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { 
    notifications, 
    getUnreadNotificationCount, 
    markNotificationAsRead, 
    clearNotifications 
  } = useRealTimeUpdates();
  
  const [showToast, setShowToast] = useState(true);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  // Show toast notifications for new notifications
  useEffect(() => {
    if (!showToast || notifications.length === 0) return;

    const latestNotification = notifications[0];
    
    // Only show toast for new notifications
    if (latestNotification.id !== lastNotificationId && !latestNotification.isRead) {
      toast(latestNotification.title, {
        description: latestNotification.message,
        action: latestNotification.actionUrl ? {
          label: 'View',
          onClick: () => window.location.href = latestNotification.actionUrl!
        } : undefined,
        duration: 5000,
      });
      
      setLastNotificationId(latestNotification.id);
    }
  }, [notifications, showToast, lastNotificationId]);

  const markAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const clearAll = () => {
    clearNotifications();
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount: getUnreadNotificationCount(),
    markAsRead,
    clearAll,
    showToast,
    setShowToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
