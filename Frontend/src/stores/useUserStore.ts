import { create } from 'zustand';
import { UserProfile, Transaction } from '@/types';
import { createActor, User, CyclePayment, CreateUserRequest } from '@/services/backend';
import type { _SERVICE } from '@/declarations/Backend/Backend.did';

interface UserStore {
  // State
  profile: UserProfile | null;
  user: User | null;
  transactions: Transaction[];
  userGroups: string[];
  actor: _SERVICE | null;
  isLoading: boolean;
  error: string | null;
  connecting: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  setUser: (user: User | null) => void;
  setActor: (actor: _SERVICE | null) => void;
  addTransaction: (transaction: Transaction) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  updateStats: (stats: Partial<UserProfile>) => void;
  
  // API actions
  initializeActor: () => Promise<void>;
  createUser: (name: string) => Promise<boolean>;
  fetchCurrentUser: () => Promise<void>;
  fetchUserPayments: (groupId: string) => Promise<void>;
  
  // Utils
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnecting: (connecting: boolean) => void;
}

// Helper function to convert backend User to UserProfile
const convertUserToProfile = (user: User): UserProfile => ({
  id: user.id,
  name: user.name,
  avatar: '', // Will be set from external source or default
  totalSaved: 0, // Will be calculated from groups/payments
  activeGroups: user.joined_groups.length,
  completedGroups: 0, // Will be calculated
  successRate: 100, // Will be calculated
  joinedDate: new Date(Number(user.created_at) / 1000000).toISOString().split('T')[0],
});

// Helper function to convert CyclePayment to Transaction
const convertPaymentToTransaction = (payment: CyclePayment, groupName: string): Transaction => ({
  id: payment.id,
  groupId: payment.group_id,
  groupName,
  amount: payment.amount,
  date: new Date(Number(payment.created_at) / 1000000).toISOString().split('T')[0],
  status: 'status' in payment.status ? 
    (payment.status as any).Paid ? 'completed' : 
    (payment.status as any).Pending ? 'pending' : 
    (payment.status as any).Failed ? 'failed' : 'pending'
    : 'pending',
  type: 'payment' as const,
  paymentProof: payment.paid_at ? 'blockchain-proof' : undefined,
});

// Mock data for development
const mockProfile: UserProfile = {
  id: 'mock-user-1',
  name: 'Ahmed Mohamed',
  avatar: '',
  totalSaved: 15000,
  activeGroups: 3,
  completedGroups: 2,
  successRate: 95,
  joinedDate: '2024-01-15',
};

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    groupId: 'group-1',
    groupName: 'First Savings Group',
    amount: 500,
    date: '2024-01-15',
    status: 'completed',
    type: 'payment',
    paymentProof: 'blockchain-proof'
  },
  {
    id: 'tx-2',
    groupId: 'group-2', 
    groupName: 'Second Savings Group',
    amount: 1000,
    date: '2024-01-10',
    status: 'pending',
    type: 'payment'
  },
  {
    id: 'tx-3',
    groupId: 'group-1',
    groupName: 'First Savings Group',
    amount: 5000,
    date: '2024-01-05',
    status: 'completed',
    type: 'payout',
    paymentProof: 'blockchain-proof'
  }
];

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state with mock data
  profile: mockProfile,
  user: null,
  transactions: mockTransactions,
  userGroups: ['group-1', 'group-2', 'group-3'],
  actor: null,
  isLoading: false,
  error: null,
  connecting: false,

  // Basic setters
  setProfile: (profile) => set({ profile }),
  setUser: (user) => {
    set({ user });
    if (user) {
      set({ profile: convertUserToProfile(user) });
    }
  },
  setActor: (actor) => set({ actor }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setConnecting: (connecting) => set({ connecting }),

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

  // Initialize ICP actor
  initializeActor: async () => {
    try {
      set({ connecting: true, error: null });
      const icpActor = await createActor();
      set({ actor: icpActor, connecting: false });
      
      // Try to fetch current user after connecting
      await get().fetchCurrentUser();
    } catch (error) {
      console.error('Failed to initialize actor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ 
        error: 'Failed to connect to ICP canister. Please check your configuration.',
        connecting: false 
      });
    }
  },

  // API actions
  createUser: async (name: string) => {
    const { actor } = get();
    if (!actor) {
      set({ error: 'Not connected to backend' });
      return false;
    }

    try {
      set({ isLoading: true, error: null });
      const request: CreateUserRequest = { name };
      const result = await actor.create_user(request);
      
      if ('Ok' in result) {
        get().setUser(result.Ok);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: result.Err,
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      console.error('Create user error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create user',
        isLoading: false 
      });
      return false;
    }
  },

  fetchCurrentUser: async () => {
    const { actor } = get();
    if (!actor) return;

    try {
      set({ isLoading: true, error: null });
      const result = await actor.get_current_user();
      const user = result[0] || null;
      
      if (user) {
        get().setUser(user);
        set({ userGroups: user.joined_groups });
      }
      set({ isLoading: false });
    } catch (error) {
      console.error('Fetch user error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false 
      });
    }
  },

  fetchUserPayments: async (groupId: string) => {
    const { actor } = get();
    if (!actor) return;

    try {
      set({ isLoading: true, error: null });
      const payments = await actor.get_current_user_payments(groupId);
      
      // Convert payments to transactions
      const transactions = payments.map(payment => 
        convertPaymentToTransaction(payment, `Group ${groupId}`)
      );
      
      set((state) => ({
        transactions: [...transactions, ...state.transactions.filter(t => t.groupId !== groupId)],
        isLoading: false
      }));
    } catch (error) {
      console.error('Fetch payments error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
        isLoading: false 
      });
    }
  },
}));