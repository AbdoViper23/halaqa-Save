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
  
  console.log(`🔄 Converting group "${backendGroup.name}":`, {
    backendStatus: backendGroup.status,
    frontendStatus: status,
    currentMembers: backendGroup.current_members,
    totalMembers: backendGroup.total_members,
    availableSlots: backendGroup.available_slots.length,
    needsMoreMembers: status === 'pending'
  });

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

export const useGroupsStore = create<GroupsStore>((set, get) => ({
  // Initial state
  groups: [],
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
    
    console.log('🔍 getAvailableGroups filter:', {
      totalGroups: state.groups.length,
      pendingGroups: state.groups.filter(g => g.status === 'pending').length,
      availableGroups: availableGroups.length,
      groupNames: availableGroups.map(g => g.name)
    });
    
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
      console.log('❌ No actor available for fetchAvailableGroups');
      return;
    }

    try {
      set({ isLoading: true, error: null });
      console.log('🔍 Fetching available groups from backend...');
      
      const backendGroups = await actor.get_available_groups();
      console.log('📦 Backend groups received:', backendGroups);
      
      get().setBackendGroups(backendGroups);
      console.log('✅ Groups converted and stored:', backendGroups.length, 'groups');
      
      set({ isLoading: false });
    } catch (error) {
      console.error('❌ Fetch available groups error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch available groups',
        isLoading: false 
      });
    }
  },

  createGroup: async (data: CreateGroupData): Promise<boolean> => {
    const { actor } = get();
    if (!actor) {
      console.log('❌ No actor available for createGroup');
      set({ error: 'Not connected to backend' });
      return false;
    }

    try {
      set({ isLoading: true, error: null });
      console.log('🏗️ Creating group with data:', data);

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

      console.log('📤 Sending create group request:', request);
      const result = await actor.create_group(request);
      console.log('📥 Create group result:', result);

      if ('Ok' in result) {
        const createdGroup = result.Ok;
        console.log('✅ Group created successfully:', createdGroup);
        
        const newFrontendGroup = convertBackendToFrontendGroup(createdGroup);
        get().addGroup(newFrontendGroup);
        
        // Refresh groups to get updated data
        console.log('🔄 Refreshing available groups...');
        await get().fetchAvailableGroups();
        
        set({ isLoading: false });
        return true;
      } else {
        console.log('❌ Create group failed:', result.Err);
        set({ 
          error: result.Err,
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Create group error:', error);
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