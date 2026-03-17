import { useState, useEffect } from 'react';
import type { Notification } from '../types/notification.types';

export const useNotifications = (initialNotifications: Notification[]) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsRead = (index: number) => {
    const updated = [...notifications];
    if (updated[index]) {
      updated[index] = { ...updated[index], read: true };
      setNotifications(updated);
    }
  };

  const clearAll = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll
  };
};