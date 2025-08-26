import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/Backend';
import type { _SERVICE } from '../declarations/Backend/Backend.did';

// Types based on our Candid interface
export interface User {
  id: string;
  name: string;
  created_at: bigint;
  is_active: boolean;
  joined_groups: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  monthly_amount: number;
  duration_months: number;
  total_members: number;
  current_members: number;
  status: { Pending: null } | { Active: null } | { Full: null } | { Completed: null } | { Cancelled: null };
  created_by: string;
  current_cycle: number;
  payout_order: { Auto: null } | { Manual: null };
  created_at: bigint;
  available_slots: number[];
}

export interface GroupMembership {
  id: string;
  user_id: string;
  group_id: string;
  slot_number: number;
  payout_month: number;
  status: { Active: null } | { Inactive: null } | { Expelled: null } | { Left: null };
  joined_at: bigint;
  total_paid: number;
  has_received_payout: boolean;
}

export interface CyclePayment {
  id: string;
  group_id: string;
  user_id: string;
  cycle_number: number;
  amount: number;
  status: { Pending: null } | { Paid: null } | { Overdue: null } | { Failed: null };
  paid_at: bigint[] | null;
  created_at: bigint;
}

export interface CreateUserRequest {
  name: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  monthly_amount: number;
  duration_months: number;
  total_members: number;
  payout_order: { Auto: null } | { Manual: null };
}

export interface JoinGroupRequest {
  group_id: string;
  preferred_slot: number[] | null;
}

export interface PaymentRequest {
  group_id: string;
  cycle_number: number;
}

// Configuration
const BACKEND_CANISTER_ID = import.meta.env.VITE_BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';

interface NetworkConfig {
  network: string;
  host: string;
  isDevelopment: boolean;
}

const getNetworkConfig = (): NetworkConfig => {
  const network = import.meta.env.VITE_DFX_NETWORK || 'local';
  const isDevelopment = network === 'local';
  const host = import.meta.env.VITE_LOCAL_HOST || (isDevelopment ? 'http://localhost:4943' : 'https://ic0.app');
  
  return { network, host, isDevelopment };
};

export const createActor = async (): Promise<_SERVICE> => {
  try {
    const { network, host, isDevelopment } = getNetworkConfig();
    
    // Validate canister ID
    if (!BACKEND_CANISTER_ID || BACKEND_CANISTER_ID === 'your-canister-id-here') {
      throw new Error(`Canister ID not configured properly: ${BACKEND_CANISTER_ID}. Please check your .env file.`);
    }
    
    // Create an agent
    const agent = new HttpAgent({ host });

    // In development/local, fetch the root key
    if (network === 'local' || isDevelopment) {
      try {
        await agent.fetchRootKey();
      } catch (err) {
        console.warn('Could not fetch root key:', err);
        // Continue without throwing error - sometimes this works anyway
      }
    }

    // Create the actor
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: BACKEND_CANISTER_ID,
    }) as _SERVICE;

    // Test the connection with a simple query
    try {
      await actor.greet('Connection Test');
      await actor.get_available_groups();
    } catch (testError) {
      console.error('Connection test failed:', testError);
      throw new Error(`Connection test failed: ${testError.message}`);
    }

    return actor;
  } catch (error) {
    console.error('Failed to create actor:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide specific error messages
    if (errorMessage.includes('canister_not_found')) {
      throw new Error(`Canister not found: ${BACKEND_CANISTER_ID}. Please check your canister ID and ensure it's deployed.`);
    } else if (errorMessage.includes('fetch root key')) {
      throw new Error('Failed to connect to local network. Please ensure dfx is running with: dfx start');
    } else if (errorMessage.includes('Connection refused')) {
      throw new Error('Cannot connect to local dfx. Please start dfx with: dfx start');
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// Export the canister ID for use in other components
export { BACKEND_CANISTER_ID };