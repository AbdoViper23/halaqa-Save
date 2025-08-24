import { create } from 'zustand';
import { UserProfile, Transaction } from '@/types';

interface UserStore {
  profile: UserProfile | null;
  transactions: Transaction[];
  userGroups: string[]; // Group IDs user is part of
  setProfile: (profile: UserProfile) => void;
  addTransaction: (transaction: Transaction) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  updateStats: (stats: Partial<UserProfile>) => void;
}

// Mock user data
const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Sarah Johnson',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
  totalSaved: 15500,
  activeGroups: 3,
  completedGroups: 5,
  successRate: 95,
  joinedDate: '2023-06-15',
};

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    groupId: 'group-1',
    groupName: 'Young Professionals',
    amount: 500,
    date: '2024-01-15',
    status: 'completed',
    type: 'payment',
    paymentProof: 'receipt-1.png'
  },
  {
    id: 'tx-2',
    groupId: 'group-2',
    groupName: 'Family Circle',
    amount: 2500,
    date: '2024-01-10',
    status: 'completed',
    type: 'payout',
  },
  {
    id: 'tx-3',
    groupId: 'group-1',
    groupName: 'Young Professionals',
    amount: 500,
    date: '2024-02-15',
    status: 'pending',
    type: 'payment',
  },
];

export const useUserStore = create<UserStore>((set, get) => ({
  profile: mockProfile,
  transactions: mockTransactions,
  userGroups: ['group-1', 'group-2', 'group-3'],

  setProfile: (profile) => set({ profile }),

  addTransaction: (transaction) => 
    set((state) => ({ 
      transactions: [transaction, ...state.transactions] 
    })),

  joinGroup: (groupId) => 
    set((state) => ({ 
      userGroups: [...state.userGroups, groupId],
      profile: state.profile ? {
        ...state.profile,
        activeGroups: state.profile.activeGroups + 1
      } : null
    })),

  leaveGroup: (groupId) => 
    set((state) => ({ 
      userGroups: state.userGroups.filter(id => id !== groupId),
      profile: state.profile ? {
        ...state.profile,
        activeGroups: Math.max(0, state.profile.activeGroups - 1)
      } : null
    })),

  updateStats: (stats) => 
    set((state) => ({ 
      profile: state.profile ? { ...state.profile, ...stats } : null 
    })),
}));