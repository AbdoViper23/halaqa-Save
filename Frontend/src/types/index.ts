export interface Slot {
  slotNumber: number;
  payoutMonth: number;
  isAvailable: boolean;
  memberId?: string;
  memberAvatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  image?: string;
  monthlyAmount: number;
  duration: number; // months
  totalMembers: number;
  slots: Slot[];
  status: 'active' | 'full' | 'completed' | 'pending';
  startDate: string;
  createdBy: string;
  currentCycle: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  totalSaved: number;
  activeGroups: number;
  completedGroups: number;
  successRate: number;
  joinedDate: string;
}

export interface Transaction {
  id: string;
  groupId: string;
  groupName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'payment' | 'payout';
  paymentProof?: string;
}

export interface CreateGroupData {
  name: string;
  description: string;
  image?: string;
  monthlyAmount: number;
  duration: number;
  totalMembers: number;
  payoutOrder: 'auto' | 'manual';
  selectedSlots?: number[];
}