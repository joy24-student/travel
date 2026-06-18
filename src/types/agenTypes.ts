/**
 * AGEN App Shared Types & Interfaces
 * Used for admin panel oversight and integration
 */

// ============================================================================
// AGEN AGENCY TYPES
// ============================================================================

export interface AgenAgency {
  id: string;
  owner_user_id: string;
  name: string;
  type: string;
  email?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  description?: string | null;
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  status: "active" | "inactive" | "suspended";
  rating: number;
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
}

export interface AgenAgencyMetrics {
  agency_id: string;
  total_bookings: number;
  total_revenue: number;
  active_customers: number;
  conversion_rate: number;
  avg_booking_value: number;
  completion_rate: number;
  cancellation_rate: number;
  average_rating: number;
}

// ============================================================================
// AGEN BOOKINGS TYPES
// ============================================================================

export interface AgenBooking {
  id: string;
  agency_id: string;
  booking_reference: string;
  user_id: string;
  product_type: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  destination_city: string;
  destination_country?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  number_of_guests: number;
  final_price: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AgenTravelerDetails {
  id: string;
  booking_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  nationality?: string;
  passport_number?: string;
}

// ============================================================================
// AGEN CUSTOMERS TYPES
// ============================================================================

export interface AgenCustomer {
  id: string;
  agency_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  total_bookings: number;
  total_spent: number;
  vip_status: boolean;
  last_booking_date?: string;
  created_at: string;
}

export interface AgenCustomerSegment {
  segment_id: string;
  name: string;
  criteria: string;
  customer_count: number;
  total_lifetime_value: number;
  avg_booking_value: number;
}

// ============================================================================
// AGEN TEAM & PERMISSIONS
// ============================================================================

export interface AgenTeamMember {
  id: string;
  agency_id: string;
  user_id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "staff" | "viewer";
  status: "active" | "inactive" | "pending";
  permissions?: string[];
  created_at: string;
  updated_at?: string;
}

export enum AgenTeamRole {
  OWNER = "owner",
  MANAGER = "manager",
  STAFF = "staff",
  VIEWER = "viewer",
}

// ============================================================================
// AGEN VERIFICATION & DOCUMENTS
// ============================================================================

export interface AgenDocument {
  id: string;
  agency_id: string;
  document_type:
    | "business_license"
    | "tax_id"
    | "owner_id"
    | "bank_statement"
    | "other";
  document_file_url: string;
  verification_status: "pending" | "verified" | "rejected";
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

export interface AgenVerificationStatus {
  agency_id: string;
  overall_status: "pending" | "verified" | "partial" | "rejected";
  kyc_status: "pending" | "verified" | "incomplete";
  document_statuses: {
    business_license?: "pending" | "verified" | "rejected";
    tax_id?: "pending" | "verified" | "rejected";
    owner_id?: "pending" | "verified" | "rejected";
  };
  last_reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
}

// ============================================================================
// AGEN ACTIVITY & AUDIT
// ============================================================================

export interface AgenActivityLog {
  id: string;
  agency_id: string;
  actor_user_id: string;
  action: string;
  details: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
}

export interface AgenAdminAlert {
  id: string;
  agency_id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "unread" | "read" | "resolved";
  action_required: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

// ============================================================================
// AGEN FINANCIAL TYPES
// ============================================================================

export interface AgenBankAccount {
  id: string;
  agency_id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  account_type: "checking" | "savings";
  currency: string;
  verified: boolean;
  is_default: boolean;
  created_at: string;
}

export interface AgenPaymentHistory {
  id: string;
  agency_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  booking_reference?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface AgenPayout {
  id: string;
  agency_id: string;
  amount: number;
  currency: string;
  status: "scheduled" | "processing" | "completed" | "failed";
  bank_account_id: string;
  period_start: string;
  period_end: string;
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// AGEN SUPPORT TYPES
// ============================================================================

export interface AgenSupportTicket {
  id: string;
  agency_id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
}

export interface AgenSupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

// ============================================================================
// AGEN NOTIFICATIONS & MESSAGING
// ============================================================================

export interface AgenMessage {
  id: string;
  agency_id: string;
  sender_user_id: string;
  recipient_user_id: string;
  subject?: string;
  content: string;
  message_type: "support" | "notification" | "alert" | "promotion";
  read: boolean;
  archived: boolean;
  created_at: string;
  read_at?: string;
}

export interface AgenNotificationPreference {
  id: string;
  agency_id: string;
  notification_type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  frequency: "instant" | "daily" | "weekly" | "never";
}

// ============================================================================
// ADMIN OVERSIGHT TYPES
// ============================================================================

export interface AgenAdminDashboardMetrics {
  total_agencies: number;
  active_agencies: number;
  verified_agencies: number;
  pending_verification: number;
  suspended_agencies: number;
  total_bookings: number;
  total_revenue: number;
  average_agency_rating: number;
  new_agencies_this_month: number;
  verification_completion_rate: number;
}

export interface AgenAdminAction {
  id: string;
  admin_user_id: string;
  target_agency_id: string;
  action_type:
    | "verify"
    | "reject"
    | "suspend"
    | "reactivate"
    | "update_notes"
    | "review_documents";
  details: string;
  reason?: string;
  created_at: string;
}

export interface AgenComplianceReport {
  report_id: string;
  agency_id: string;
  report_date: string;
  verification_status: string;
  document_compliance: {
    business_license: boolean;
    tax_id: boolean;
    owner_id: boolean;
  };
  financial_compliance: {
    bank_account_verified: boolean;
    payout_history_clean: boolean;
  };
  operational_compliance: {
    booking_completion_rate: number;
    customer_satisfaction_average: number;
    fraud_flags: number;
  };
  overall_compliance_score: number;
  recommendations: string[];
}

// ============================================================================
// ENUM TYPES
// ============================================================================

export enum AgenBookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum AgenVerificationState {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export enum AgenActivityAction {
  AGENCY_CREATED = "agency_created",
  AGENCY_UPDATED = "agency_updated",
  BOOKING_CREATED = "booking_created",
  BOOKING_UPDATED = "booking_updated",
  BOOKING_CANCELLED = "booking_cancelled",
  DOCUMENT_UPLOADED = "document_uploaded",
  VERIFICATION_SUBMITTED = "verification_submitted",
  TEAM_MEMBER_ADDED = "team_member_added",
  TEAM_MEMBER_REMOVED = "team_member_removed",
  PROFILE_UPDATED = "profile_updated",
  PAYOUT_REQUESTED = "payout_requested",
  MESSAGE_SENT = "message_sent",
}

export enum AdminAlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
