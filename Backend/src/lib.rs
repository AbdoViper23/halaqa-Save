use ic_cdk::api::time;
use ic_cdk::{query, update, caller};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::{Bound, Storable},
    DefaultMemoryImpl, StableBTreeMap, StableCell,
};
use std::borrow::Cow;
use std::cell::RefCell;
use candid::{CandidType, Decode, Encode};
use serde::{Deserialize, Serialize};

// Memory management for stable storage
type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdCell = StableCell<u64, Memory>;

// Global storage using thread-local static variables
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static ID_COUNTER: RefCell<IdCell> = RefCell::new(
        IdCell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), 0)
    );

    static USERS: RefCell<StableBTreeMap<String, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static GROUPS: RefCell<StableBTreeMap<String, Group, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static MEMBERSHIPS: RefCell<StableBTreeMap<String, GroupMembership, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static PAYMENTS: RefCell<StableBTreeMap<String, CyclePayment, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
        )
    );
}

// Simple ID generation using timestamp
fn generate_id() -> String {
    let current_time = time();
    ID_COUNTER.with(|counter| {
        let mut id = counter.borrow_mut();
        let current = id.get();
        let new_id = current + 1;
        let _ = id.set(new_id);
        format!("{}{}", current_time, new_id)
    })
}

// Status enums for different entities
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum GroupStatus {
    Pending,    // Group created but not full yet
    Active,     // Group is active and running
    Full,       // Group has all members
    Completed,  // Group cycle finished
    Cancelled,  // Group was cancelled
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum PaymentStatus {
    Pending,    // Payment is due
    Paid,       // Payment completed
    Overdue,    // Payment is late
    Failed,     // Payment failed
}



#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum MembershipStatus {
    Active,      // Member is active
    Inactive,    // Member is inactive
    Expelled,    // Member was removed
    Left,        // Member left voluntarily
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum PayoutOrder {
    Auto,        // Automatic slot assignment
    Manual,      // Manual slot selection
}

// Basic user data structure
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub id: String, // Principal from Internet Identity
    pub name: String,
    pub created_at: u64,
    pub is_active: bool,
    pub joined_groups: Vec<String>, // List of group IDs user joined
}

// Savings group data structure  
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Group {
    pub id: String,
    pub name: String,
    pub description: String,
    pub monthly_amount: f64,        // Monthly contribution amount
    pub duration_months: u32,       // Duration in months
    pub total_members: u32,         // Total members needed
    pub current_members: u32,       // Current member count
    pub status: GroupStatus,
    pub created_by: String,         // Creator user ID
    pub current_cycle: u32,         // Current month/cycle
    pub payout_order: PayoutOrder,
    pub created_at: u64,
    pub available_slots: Vec<u32>,  // Available slot numbers
}

// User membership in a specific group
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GroupMembership {
    pub id: String,
    pub user_id: String,
    pub group_id: String,
    pub slot_number: u32,           // Slot/turn number
    pub payout_month: u32,          // Month when user gets payout
    pub status: MembershipStatus,
    pub joined_at: u64,
    pub total_paid: f64,            // Total amount paid by member
    pub has_received_payout: bool,  // Whether received the big payout
}

// Monthly payment by a member
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CyclePayment {
    pub id: String,
    pub group_id: String,
    pub user_id: String,
    pub cycle_number: u32,          // Cycle/month number
    pub amount: f64,
    pub status: PaymentStatus,
    pub paid_at: Option<u64>,       // When payment was made
    pub created_at: u64,
}

// Implement Storable trait for all structs (for ic-stable-structures 0.7.0)
impl Storable for User {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        Encode!(&self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Group {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        Encode!(&self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for GroupMembership {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        Encode!(&self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for CyclePayment {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        Encode!(&self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Request structures for API calls
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateUserRequest {
    pub name: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateGroupRequest {
    pub name: String,
    pub description: String,
    pub monthly_amount: f64,
    pub duration_months: u32,
    pub total_members: u32,
    pub payout_order: PayoutOrder,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct JoinGroupRequest {
    pub group_id: String,
    pub preferred_slot: Option<u32>, // For manual slot selection
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PaymentRequest {
    pub group_id: String,
    pub cycle_number: u32,
}

// Simple helper functions
fn get_current_time() -> u64 {
    time()
}

// Basic API Functions - Simple implementations without complex logic

// Create a new user
#[update]
fn create_user(request: CreateUserRequest) -> Result<User, String> {
    let caller_principal = caller();
    let user_id = caller_principal.to_text();
    
    // Check if user already exists
    if USERS.with(|users| users.borrow().contains_key(&user_id)) {
        return Err("User already exists".to_string());
    }
    
    let now = get_current_time();
    let user = User {
        id: user_id.clone(),
        name: request.name,
        created_at: now,
        is_active: true,
        joined_groups: Vec::new(),
    };

    USERS.with(|users| {
        users.borrow_mut().insert(user_id, user.clone());
    });

    Ok(user)
}

// Create a new savings group
#[update]
fn create_group(request: CreateGroupRequest) -> Result<Group, String> {
    let caller_principal = caller();
    let creator_id = caller_principal.to_text();
    let group_id = generate_id();
    let now = get_current_time();
    
    // Create list of available slots
    let available_slots: Vec<u32> = (1..=request.total_members).collect();
    
    let group = Group {
        id: group_id.clone(),
        name: request.name,
        description: request.description,
        monthly_amount: request.monthly_amount,
        duration_months: request.duration_months,
        total_members: request.total_members,
        current_members: 0,
        status: GroupStatus::Pending,
        created_by: creator_id,
        current_cycle: 0,
        payout_order: request.payout_order,
        created_at: now,
        available_slots,
    };

    GROUPS.with(|groups| {
        groups.borrow_mut().insert(group_id, group.clone());
    });

    Ok(group)
}

// Join a savings group
#[update]
fn join_group(request: JoinGroupRequest) -> Result<GroupMembership, String> {
    let caller_principal = caller();
    let user_id = caller_principal.to_text();
    
    // Get group data
    let mut group = GROUPS.with(|groups| {
        groups.borrow().get(&request.group_id)
            .ok_or("Group not found".to_string())
    })?;

    // Check if group can accept members
    if group.current_members >= group.total_members {
        return Err("Group is full".to_string());
    }

    // Assign slot number
    let slot_number = match request.preferred_slot {
        Some(slot) if group.available_slots.contains(&slot) => slot,
        Some(_) => return Err("Preferred slot not available".to_string()),
        None => {
            if group.available_slots.is_empty() {
                return Err("No available slots".to_string());
            }
            group.available_slots[0] // Take first available slot
        }
    };

    // Calculate payout month
    let payout_month = match group.payout_order {
        PayoutOrder::Auto => ((slot_number - 1) % group.duration_months) + 1,
        PayoutOrder::Manual => slot_number,
    };

    let membership_id = generate_id();
    let now = get_current_time();
    
    let membership = GroupMembership {
        id: membership_id.clone(),
        user_id: user_id.clone(),
        group_id: request.group_id.clone(),
        slot_number,
        payout_month,
        status: MembershipStatus::Active,
        joined_at: now,
        total_paid: 0.0,
        has_received_payout: false,
    };

    // Update group
    group.current_members += 1;
    group.available_slots.retain(|&x| x != slot_number);

    // Mark group as active if full
    if group.current_members == group.total_members {
        group.status = GroupStatus::Active;
    }

    // Save updates
    GROUPS.with(|groups| {
        groups.borrow_mut().insert(request.group_id.clone(), group);
    });

    MEMBERSHIPS.with(|memberships| {
        memberships.borrow_mut().insert(membership_id, membership.clone());
    });

    // Update user's group list
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(mut user) = users_map.get(&user_id) {
            user.joined_groups.push(request.group_id);
            users_map.insert(user_id, user);
        }
    });

    Ok(membership)
}

// Make monthly payment
#[update]
fn make_payment(request: PaymentRequest) -> Result<CyclePayment, String> {
    let caller_principal = caller();
    let user_id = caller_principal.to_text();
    
    // Get group data
    let group = GROUPS.with(|groups| {
        groups.borrow().get(&request.group_id)
            .ok_or("Group not found".to_string())
    })?;

    let payment_id = generate_id();
    let now = get_current_time();
    
    let payment = CyclePayment {
        id: payment_id.clone(),
        group_id: request.group_id,
        user_id,
        cycle_number: request.cycle_number,
        amount: group.monthly_amount,
        status: PaymentStatus::Paid,
        paid_at: Some(now),
        created_at: now,
    };

    PAYMENTS.with(|payments| {
        payments.borrow_mut().insert(payment_id, payment.clone());
    });

    Ok(payment)
}

// Query functions - Read data

#[query]
fn get_user(user_id: String) -> Option<User> {
    USERS.with(|users| users.borrow().get(&user_id))
}

#[query]
fn get_current_user() -> Option<User> {
    let caller_principal = caller();
    let user_id = caller_principal.to_text();
    USERS.with(|users| users.borrow().get(&user_id))
}

#[query]
fn get_group(group_id: String) -> Option<Group> {
    GROUPS.with(|groups| groups.borrow().get(&group_id))
}

#[query]
fn get_available_groups() -> Vec<Group> {
    GROUPS.with(|groups| {
        let mut result = Vec::new();
        for entry in groups.borrow().iter() {
            let group = entry.value();
            if group.status == GroupStatus::Pending && group.current_members < group.total_members {
                result.push(group);
            }
        }
        result
    })
}

#[query]
fn get_user_groups(user_id: String) -> Vec<Group> {
    let user = USERS.with(|users| users.borrow().get(&user_id));
    
    match user {
        Some(user) => {
            let mut result = Vec::new();
            GROUPS.with(|groups| {
                let groups_map = groups.borrow();
                for group_id in user.joined_groups.iter() {
                    if let Some(group) = groups_map.get(group_id) {
                        result.push(group);
                    }
                }
            });
            result
        },
        None => Vec::new(),
    }
}

#[query]
fn get_current_user_groups() -> Vec<Group> {
    let caller_principal = caller();
    let user_id = caller_principal.to_text();
    get_user_groups(user_id)
}

#[query]
fn get_group_memberships(group_id: String) -> Vec<GroupMembership> {
    MEMBERSHIPS.with(|memberships| {
        let mut result = Vec::new();
        for entry in memberships.borrow().iter() {
            let membership = entry.value();
            if membership.group_id == group_id {
                result.push(membership);
            }
        }
        result
    })
}

#[query]
fn get_user_payments(user_id: String, group_id: String) -> Vec<CyclePayment> {
    PAYMENTS.with(|payments| {
        let mut result = Vec::new();
        for entry in payments.borrow().iter() {
            let payment = entry.value();
            if payment.user_id == user_id && payment.group_id == group_id {
                result.push(payment);
            }
        }
        result
    })
}

#[query]
fn get_current_user_payments(group_id: String) -> Vec<CyclePayment> {
    let caller_principal = caller();
    let user_id = caller_principal.to_text();
    get_user_payments(user_id, group_id)
}

// Simple greeting function for testing
#[query]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to Halaqa Savings System!", name)
}

// Export the candid interface
ic_cdk::export_candid!();

