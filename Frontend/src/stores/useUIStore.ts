import { create } from 'zustand';

interface UIStore {
  isLoading: boolean;
  selectedSlot: number | null;
  showGroupDetails: boolean;
  selectedGroupForDetails: string | null;
  notifications: Notification[];
  setLoading: (loading: boolean) => void;
  setSelectedSlot: (slot: number | null) => void;
  showGroupDetailsModal: (groupId: string) => void;
  hideGroupDetailsModal: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export const useUIStore = create<UIStore>((set, get) => ({
  isLoading: false,
  selectedSlot: null,
  showGroupDetails: false,
  selectedGroupForDetails: null,
  notifications: [],

  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),

  showGroupDetailsModal: (groupId) => 
    set({ 
      showGroupDetails: true, 
      selectedGroupForDetails: groupId 
    }),

  hideGroupDetailsModal: () => 
    set({ 
      showGroupDetails: false, 
      selectedGroupForDetails: null,
      selectedSlot: null 
    }),

  addNotification: (notification) => {
    const id = `notification-${Date.now()}`;
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id) => 
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
}));