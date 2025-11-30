import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'xp' | 'points';

export interface Notification {
    id: string;
    type: NotificationType;
    amount: number;
    message?: string;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = uuidv4();
        set((state) => ({
            notifications: [...state.notifications, { ...notification, id }]
        }));

        // Auto-remove after 3 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            }));
        }, 3000);
    },
    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        }));
    }
}));
