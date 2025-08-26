import { create } from 'zustand';
import { Group as FrontendGroup, Slot, CreateGroupData } from '@/types';
import { 
  createActor, 
  Group as BackendGroup, 
  CreateGroupRequest, 
  JoinGroupRequest 
} from '@/services/backend';
import type { _SERVICE } from '@/declarations/Backend/Backend.did';

interface GroupsStore {
  // State
  groups: FrontendGroup[];
  backendGroups: BackendGroup[];
  selectedGroup: FrontendGroup | null;
  actor: _SERVICE | null;
  isLoading: boolean;
  error: string | null;
  connecting: boolean;

  // Setters
  setGroups: (groups: FrontendGroup[]) => void;
  setBackendGroups: (groups: BackendGroup[]) => void;
  setSelectedGroup: (group: FrontendGroup | null) => void;
  setActor: (actor: _SERVICE | null) => void;
  addGroup: (group: FrontendGroup) => void;
  updateGroup: (groupId: string, updates: Partial<FrontendGroup>) => void;
  joinGroupSlot: (groupId: string, slotNumber: number, memberId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnecting: (connecting: boolean) => void;

  // Getters
  getAvailableGroups: () => FrontendGroup[];
  getActiveGroups: () => FrontendGroup[];
  getUserGroups: (userGroupIds: string[]) => FrontendGroup[];

  // API actions
  initializeActor: () => Promise<void>;
  fetchAvailableGroups: () => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<boolean>;
  joinGroup: (groupId: string, preferredSlot?: number) => Promise<boolean>;
}

// Helper function to convert BackendGroup to FrontendGroup
const convertBackendToFrontendGroup = (backendGroup: BackendGroup): FrontendGroup => {
  // Generate slots based on available slots from backend
  const slots: Slot[] = [];
  const totalSlots = backendGroup.total_members;
  
  for (let i = 1; i <= totalSlots; i++) {
    const isAvailable = backendGroup.available_slots.includes(i);
    slots.push({
      slotNumber: i,
      payoutMonth: i <= backendGroup.duration_months ? i : Math.floor(Math.random() * backendGroup.duration_months) + 1,
      isAvailable,
      memberId: isAvailable ? undefined : `member-${i}`,
      memberAvatar: isAvailable ? undefined : `https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop&crop=face`,
    });
  }

  // Convert status
  let status: 'active' | 'full' | 'completed' | 'pending' | 'cancelled' = 'pending';
  if ('Active' in backendGroup.status) status = 'active';
  else if ('Full' in backendGroup.status) status = 'full';
  else if ('Completed' in backendGroup.status) status = 'completed';
  else if ('Cancelled' in backendGroup.status) status = 'cancelled';
  else if ('Pending' in backendGroup.status) status = 'pending';
  
  // Debug: Uncomment for debugging
  // console.log(`🔄 Converting group "${backendGroup.name}":`, {
  //   backendStatus: backendGroup.status,
  //   frontendStatus: status,
  //   currentMembers: backendGroup.current_members,
  //   totalMembers: backendGroup.total_members,
  //   availableSlots: backendGroup.available_slots.length,
  //   needsMoreMembers: status === 'pending'
  // });

  return {
    id: backendGroup.id,
    name: backendGroup.name,
    description: backendGroup.description,
    image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=400&h=200&fit=crop`,
    monthlyAmount: backendGroup.monthly_amount,
    duration: backendGroup.duration_months,
    totalMembers: backendGroup.total_members,
    slots,
    status,
    startDate: new Date(Number(backendGroup.created_at) / 1000000).toISOString().split('T')[0],
    createdBy: backendGroup.created_by,
    currentCycle: backendGroup.current_cycle,
  };
};

// Mock data for development
const mockGroups: FrontendGroup[] = [
  {
    id: 'group-1',
    name: 'First Savings Group',
    description: 'Monthly savings group for short-term goals',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
    monthlyAmount: 500,
    duration: 12,
    totalMembers: 12,
    slots: Array.from({ length: 12 }, (_, i) => ({
      slotNumber: i + 1,
      payoutMonth: i + 1,
      isAvailable: i >= 8, // First 8 slots are taken
      memberId: i >= 8 ? undefined : `member-${i + 1}`,
      memberAvatar: i >= 8 ? undefined : `https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop&crop=face`,
    })),
    status: 'active',
    startDate: '2024-01-01',
    createdBy: 'mock-user-1',
    currentCycle: 3,
  },
  {
    id: 'group-2',
    name: 'Second Savings Group',
    description: 'Monthly savings group for medium-term goals',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
    monthlyAmount: 1000,
    duration: 24,
    totalMembers: 20,
    slots: Array.from({ length: 20 }, (_, i) => ({
      slotNumber: i + 1,
      payoutMonth: i + 1,
      isAvailable: i >= 15, // First 15 slots are taken
      memberId: i >= 15 ? undefined : `member-${i + 1}`,
      memberAvatar: i >= 15 ? undefined : `https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop&crop=face`,
    })),
    status: 'pending',
    startDate: '2024-02-01',
    createdBy: 'mock-user-2',
    currentCycle: 1,
  },
  {
    id: 'group-3',
    name: 'Third Savings Group',
    description: 'Monthly savings group for long-term goals',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=200&fit=crop',
    monthlyAmount: 2000,
    duration: 36,
    totalMembers: 30,
    slots: Array.from({ length: 30 }, (_, i) => ({
      slotNumber: i + 1,
      payoutMonth: i + 1,
      isAvailable: false, // All slots are taken
      memberId: `member-${i + 1}`,
      memberAvatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop&crop=face`,
    })),
    status: 'full',
    startDate: '2024-03-01',
    createdBy: 'mock-user-3',
    currentCycle: 2,
  },
];

export const useGroupsStore = create<GroupsStore>((set, get) => ({
  // Initial state with mock data
  groups: mockGroups,
  backendGroups: [],
  selectedGroup: null,
  actor: null,
  isLoading: false,
  error: null,
  connecting: false,

  // Basic setters
  setGroups: (groups) => set({ groups }),
  setBackendGroups: (backendGroups) => {
    const groups = backendGroups.map(convertBackendToFrontendGroup);
    set({ backendGroups, groups });
  },
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setActor: (actor) => set({ actor }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setConnecting: (connecting) => set({ connecting }),

  addGroup: (group) => 
    set((state) => ({ 
      groups: [group, ...state.groups] 
    })),

  updateGroup: (groupId, updates) => 
    set((state) => ({
      groups: state.groups.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      )
    })),

  joinGroupSlot: (groupId, slotNumber, memberId) => 
    set((state) => ({
      groups: state.groups.map(group => {
        if (group.id === groupId) {
          const updatedSlots = group.slots.map(slot => 
            slot.slotNumber === slotNumber 
              ? { ...slot, isAvailable: false, memberId }
              : slot
          );
          const availableSlots = updatedSlots.filter(slot => slot.isAvailable).length;
          return {
            ...group,
            slots: updatedSlots,
            status: availableSlots === 0 ? 'full' as const : group.status
          };
        }
        return group;
      })
    })),

  // Getters
  getAvailableGroups: () => {
    const state = get();
    // Available groups are PENDING groups that still need members to join
    const availableGroups = state.groups.filter(group => 
      group.status === 'pending' && 
      group.slots.some(slot => slot.isAvailable)
    );
    
    // Debug: Uncomment for debugging
    // console.log('🔍 getAvailableGroups filter:', {
    //   totalGroups: state.groups.length,
    //   pendingGroups: state.groups.filter(g => g.status === 'pending').length,
    //   availableGroups: availableGroups.length,
    //   groupNames: availableGroups.map(g => g.name)
    // });
    
    return availableGroups;
  },

  getActiveGroups: () => {
    const state = get();
    // Active groups are groups that are currently running
    return state.groups.filter(group => group.status === 'active');
  },

  getUserGroups: (userGroupIds) => {
    const state = get();
    // User groups can be pending, active, or completed
    return state.groups.filter(group => userGroupIds.includes(group.id));
  },

  // Initialize ICP actor
  initializeActor: async () => {
    try {
      set({ connecting: true, error: null });
      const icpActor = await createActor();
      set({ actor: icpActor, connecting: false });
      
      // Load available groups after connecting
      await get().fetchAvailableGroups();
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
  fetchAvailableGroups: async () => {
    const { actor } = get();
    if (!actor) {
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const backendGroups = await actor.get_available_groups();
      get().setBackendGroups(backendGroups);
      set({ isLoading: false });
    } catch (error) {
      console.error('Fetch available groups error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch available groups',
        isLoading: false 
      });
    }
  },

  createGroup: async (data: CreateGroupData): Promise<boolean> => {
    const { actor } = get();
        if (!actor) {
      set({ error: 'Not connected to backend' });
      return false;
    }

    try {
      set({ isLoading: true, error: null });

      // Convert payout order
      const payoutOrder = data.payoutOrder === 'manual' ? { Manual: null } : { Auto: null };

      const request: CreateGroupRequest = {
        name: data.name,
        description: data.description,
        monthly_amount: data.monthlyAmount,
        duration_months: data.duration,
        total_members: data.totalMembers,
        payout_order: payoutOrder,
      };

      const result = await actor.create_group(request);

      if ('Ok' in result) {
        const createdGroup = result.Ok;
        const newFrontendGroup = convertBackendToFrontendGroup(createdGroup);
        get().addGroup(newFrontendGroup);
        
        // Refresh groups to get updated data
        await get().fetchAvailableGroups();
        
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
      console.error('Create group error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create group',
        isLoading: false 
      });
      return false;
    }
  },

  joinGroup: async (groupId: string, preferredSlot?: number): Promise<boolean> => {
    const { actor } = get();
    if (!actor) {
      set({ error: 'Not connected to backend' });
      return false;
    }

    try {
      set({ isLoading: true, error: null });

      const request: JoinGroupRequest = {
        group_id: groupId,
        preferred_slot: preferredSlot ? [preferredSlot] : null,
      };

      const result = await actor.join_group(request);

      if ('Ok' in result) {
        // Update the group in the store
        const membership = result.Ok;
        get().joinGroupSlot(groupId, membership.slot_number, membership.user_id);
        
        // Refresh groups to get updated data
        await get().fetchAvailableGroups();
        
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
      console.error('Join group error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join group',
        isLoading: false 
      });
      return false;
    }
  },
}));