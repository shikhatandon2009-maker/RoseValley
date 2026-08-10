import { create } from 'zustand';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: InAppNotification[];
  unreadCount: number;
  setNotifications: (items: InAppNotification[]) => void;
  addNotification: (item: InAppNotification) => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'Welcome to Maison De L\'Essence',
      message: 'Explore our latest artisanal Rose Royale Eau de Parfum.',
      type: 'welcome',
      read: false,
      created_at: new Date().toISOString(),
    },
  ],
  unreadCount: 1,
  setNotifications: (items) =>
    set({
      notifications: items,
      unreadCount: items.filter((n) => !n.read).length,
    }),
  addNotification: (item) =>
    set((state) => ({
      notifications: [item, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
}));
