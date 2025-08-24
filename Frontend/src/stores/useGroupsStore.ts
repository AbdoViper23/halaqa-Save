import { create } from 'zustand';
import { Group, Slot, CreateGroupData } from '@/types';

interface GroupsStore {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  setGroups: (groups: Group[]) => void;
  setSelectedGroup: (group: Group | null) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  joinGroupSlot: (groupId: string, slotNumber: number, memberId: string) => void;
  getAvailableGroups: () => Group[];
  getUserGroups: (userGroupIds: string[]) => Group[];
  setLoading: (loading: boolean) => void;
  createGroup: (data: CreateGroupData) => Promise<Group>;
}

// Helper function to generate slots
const generateSlots = (totalMembers: number, duration: number): Slot[] => {
  const slots: Slot[] = [];
  for (let i = 1; i <= totalMembers; i++) {
    slots.push({
      slotNumber: i,
      payoutMonth: i <= duration ? i : Math.floor(Math.random() * duration) + 1,
      isAvailable: Math.random() > 0.3, // Random availability
      memberId: Math.random() > 0.5 ? `member-${i}` : undefined,
      memberAvatar: Math.random() > 0.5 ? `https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop&crop=face` : undefined,
    });
  }
  return slots;
};

// Mock groups data
const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Young Professionals Savings',
    description: 'A group for young professionals looking to save for their future goals.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
    monthlyAmount: 500,
    duration: 12,
    totalMembers: 12,
    slots: generateSlots(12, 12),
    status: 'active',
    startDate: '2024-01-01',
    createdBy: 'user-1',
    currentCycle: 3,
  },
  {
    id: 'group-2',
    name: 'Family Circle Fund',
    description: 'Helping families save together for emergency funds and big purchases.',
    monthlyAmount: 1000,
    duration: 8,
    totalMembers: 8,
    slots: generateSlots(8, 8),
    status: 'active',
    startDate: '2024-02-01',
    createdBy: 'user-2',
    currentCycle: 2,
  },
  {
    id: 'group-3',
    name: 'Student Budget Savers',
    description: 'Perfect for students who want to build healthy saving habits.',
    monthlyAmount: 200,
    duration: 6,
    totalMembers: 10,
    slots: generateSlots(10, 6),
    status: 'active',
    startDate: '2024-03-01',
    createdBy: 'user-3',
    currentCycle: 1,
  },
  {
    id: 'group-4',
    name: 'Vacation Dreamers',
    description: 'Save together for that dream vacation you\'ve been planning.',
    monthlyAmount: 750,
    duration: 10,
    totalMembers: 15,
    slots: generateSlots(15, 10),
    status: 'active',
    startDate: '2024-01-15',
    createdBy: 'user-4',
    currentCycle: 3,
  },
  {
    id: 'group-5',
    name: 'Tech Gadget Fund',
    description: 'For tech enthusiasts saving up for the latest gadgets and equipment.',
    monthlyAmount: 300,
    duration: 12,
    totalMembers: 12,
    slots: generateSlots(12, 12),
    status: 'active',
    startDate: '2024-02-15',
    createdBy: 'user-5',
    currentCycle: 2,
  },
];

export const useGroupsStore = create<GroupsStore>((set, get) => ({
  groups: mockGroups,
  selectedGroup: null,
  isLoading: false,

  setGroups: (groups) => set({ groups }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setLoading: (loading) => set({ isLoading: loading }),

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

  getAvailableGroups: () => {
    const state = get();
    return state.groups.filter(group => 
      group.status === 'active' && 
      group.slots.some(slot => slot.isAvailable)
    );
  },

  getUserGroups: (userGroupIds) => {
    const state = get();
    return state.groups.filter(group => userGroupIds.includes(group.id));
  },

  createGroup: async (data: CreateGroupData): Promise<Group> => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: data.name,
      description: data.description,
      image: data.image,
      monthlyAmount: data.monthlyAmount,
      duration: data.duration,
      totalMembers: data.totalMembers,
      slots: generateSlots(data.totalMembers, data.duration),
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      createdBy: 'user-1', // Current user
      currentCycle: 0,
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set((state) => ({ 
      groups: [newGroup, ...state.groups] 
    }));

    return newGroup;
  },
}));