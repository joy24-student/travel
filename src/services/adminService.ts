/**
 * Admin Services - Database Integration with Supabase
 * All CRUD operations for 450+ admin features
 */

import { supabase } from "@/utils/supabase";
import {
  AdminUser,
  AdminActivityLog,
  DashboardMetrics,
  UserAdminDetails,
  AgencyAdminDetails,
  DestinationCMS,
  PackageAdminDetails,
  RefundRequest,
  PromoCode,
  MarketingCampaign,
  Advertisement,
  FinancialReport,
  AdminRole,
} from "@/types/admin";

// ============================================================================
// DASHBOARD SERVICES
// ============================================================================

export const dashboardService = {
  // Get today's metrics
  async getTodayMetrics(): Promise<DashboardMetrics | null> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("dashboard_metrics")
        .select("*")
        .eq("metric_date", today)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return null;
    }
  },

  // Get metrics for a date range
  async getMetricsDateRange(
    startDate: string,
    endDate: string,
  ): Promise<DashboardMetrics[]> {
    try {
      const { data, error } = await supabase
        .from("dashboard_metrics")
        .select("*")
        .gte("metric_date", startDate)
        .lte("metric_date", endDate)
        .order("metric_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching metrics date range:", error);
      return [];
    }
  },

  // Update dashboard metrics
  async updateMetrics(
    metricsData: Partial<DashboardMetrics>,
  ): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("dashboard_metrics").upsert({
        metric_date: today,
        ...metricsData,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating dashboard metrics:", error);
      return false;
    }
  },

  // Get real-time analytics
  async getRealTimeAnalytics(metric: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("real_time_analytics")
        .select("metric_value")
        .eq("metric_name", metric)
        .order("metric_timestamp", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data?.metric_value || 0;
    } catch (error) {
      console.error("Error fetching real-time analytics:", error);
      return 0;
    }
  },
};

// ============================================================================
// ADMIN USERS & RBAC SERVICES
// ============================================================================

export const adminService = {
  // Get current admin user
  async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error fetching current admin:", error);
      return null;
    }
  },

  // Get all admin users
  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching admin users:", error);
      return [];
    }
  },

  // Create admin user
  async createAdmin(
    userId: string,
    role: AdminRole,
    permissions: Record<string, boolean>,
  ): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .insert({
          user_id: userId,
          role,
          permissions,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating admin user:", error);
      return null;
    }
  },

  // Update admin role
  async updateAdminRole(adminId: string, newRole: AdminRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", adminId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating admin role:", error);
      return false;
    }
  },

  // Log admin activity
  async logActivity(log: Partial<AdminActivityLog>): Promise<boolean> {
    try {
      const { error } = await supabase.from("admin_activity_logs").insert({
        ...log,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error logging activity:", error);
      return false;
    }
  },

  // Get admin activity logs
  async getActivityLogs(
    adminId: string,
    limit: number = 50,
  ): Promise<AdminActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .eq("admin_id", adminId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      return [];
    }
  },
};

// ============================================================================
// USER MANAGEMENT SERVICES
// ============================================================================

export const userManagementService = {
  // Get user admin details
  async getUserDetails(userId: string): Promise<UserAdminDetails | null> {
    try {
      const { data, error } = await supabase
        .from("user_admin_details")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  },

  // Get all users for management
  async getAllUsers(
    limit: number = 100,
    offset: number = 0,
  ): Promise<UserAdminDetails[]> {
    try {
      const { data, error } = await supabase
        .from("user_admin_details")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  // Suspend user
  async suspendUser(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("user_admin_details").update({
        is_suspended: true,
        suspension_reason: reason,
        suspension_date: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await adminService.logActivity({
        admin_id: adminId,
        action: "suspend_user",
        module: "users",
        entity_type: "user",
        entity_id: userId,
        details: { reason },
      });

      return true;
    } catch (error) {
      console.error("Error suspending user:", error);
      return false;
    }
  },

  // Ban user
  async banUser(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("user_admin_details").update({
        is_banned: true,
        ban_reason: reason,
        ban_date: new Date().toISOString(),
      });

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "ban_user",
        module: "users",
        entity_type: "user",
        entity_id: userId,
        details: { reason },
      });

      return true;
    } catch (error) {
      console.error("Error banning user:", error);
      return false;
    }
  },

  // Get user login history
  async getUserLoginHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("user_login_history")
        .select("*")
        .eq("user_id", userId)
        .order("login_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching login history:", error);
      return [];
    }
  },

  // Get KYC documents
  async getUserKYCDocuments(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      return [];
    }
  },

  // Verify KYC document
  async verifyKYCDocument(
    docId: string,
    adminId: string,
    notes: string = "",
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("kyc_documents")
        .update({
          is_verified: true,
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          verification_notes: notes,
        })
        .eq("id", docId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error verifying KYC document:", error);
      return false;
    }
  },
};

// ============================================================================
// AGENCY MANAGEMENT SERVICES
// ============================================================================

export const agencyManagementService = {
  // Get all agencies for management
  async getAllAgencies(
    limit: number = 100,
    offset: number = 0,
  ): Promise<AgencyAdminDetails[]> {
    try {
      const { data, error } = await supabase
        .from("agency_admin_details")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching agencies:", error);
      return [];
    }
  },

  // Get agency details
  async getAgencyDetails(agencyId: string): Promise<AgencyAdminDetails | null> {
    try {
      const { data, error } = await supabase
        .from("agency_admin_details")
        .select("*")
        .eq("agency_id", agencyId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error fetching agency details:", error);
      return null;
    }
  },

  // Get agency performance metrics
  async getAgencyPerformance(agencyId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("agency_performance_metrics")
        .select("*")
        .eq("agency_id", agencyId)
        .order("metric_date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error fetching agency performance:", error);
      return null;
    }
  },

  // Verify agency
  async verifyAgency(agencyId: string, adminId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("agency_admin_details")
        .update({
          verification_status: "verified",
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq("agency_id", agencyId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "verify_agency",
        module: "agencies",
        entity_type: "agency",
        entity_id: agencyId,
      });

      return true;
    } catch (error) {
      console.error("Error verifying agency:", error);
      return false;
    }
  },

  // Suspend agency
  async suspendAgency(
    agencyId: string,
    reason: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("agency_admin_details")
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspension_date: new Date().toISOString(),
        })
        .eq("agency_id", agencyId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "suspend_agency",
        module: "agencies",
        entity_type: "agency",
        entity_id: agencyId,
        details: { reason },
      });

      return true;
    } catch (error) {
      console.error("Error suspending agency:", error);
      return false;
    }
  },

  // Reject agency
  async rejectAgency(
    agencyId: string,
    reason: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("agency_admin_details")
        .update({
          verification_status: "rejected",
          rejection_reason: reason,
          rejected_by: adminId,
          rejected_at: new Date().toISOString(),
        })
        .eq("agency_id", agencyId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "reject_agency",
        module: "agencies",
        entity_type: "agency",
        entity_id: agencyId,
        details: { reason },
      });

      return true;
    } catch (error) {
      console.error("Error rejecting agency:", error);
      return false;
    }
  },
};

// ============================================================================
// DESTINATION MANAGEMENT SERVICES
// ============================================================================

export const destinationService = {
  // Get all destinations
  async getAllDestinations(
    limit: number = 50,
    offset: number = 0,
  ): Promise<DestinationCMS[]> {
    try {
      const { data, error } = await supabase
        .from("destination_cms")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return [];
    }
  },

  // Create destination
  async createDestination(
    destination: Partial<DestinationCMS>,
    adminId: string,
  ): Promise<DestinationCMS | null> {
    try {
      const { data, error } = await supabase
        .from("destination_cms")
        .insert({
          ...destination,
          created_by: adminId,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "create_destination",
        module: "destinations",
        entity_type: "destination",
        entity_id: data?.id,
      });

      return data;
    } catch (error) {
      console.error("Error creating destination:", error);
      return null;
    }
  },

  // Update destination
  async updateDestination(
    destinationId: string,
    updates: Partial<DestinationCMS>,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("destination_cms")
        .update({
          ...updates,
          updated_by: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", destinationId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "update_destination",
        module: "destinations",
        entity_type: "destination",
        entity_id: destinationId,
      });

      return true;
    } catch (error) {
      console.error("Error updating destination:", error);
      return false;
    }
  },

  // Publish destination
  async publishDestination(
    destinationId: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("destination_cms")
        .update({
          is_published: true,
          published_by: adminId,
          published_at: new Date().toISOString(),
        })
        .eq("id", destinationId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "publish_destination",
        module: "destinations",
        entity_type: "destination",
        entity_id: destinationId,
      });

      return true;
    } catch (error) {
      console.error("Error publishing destination:", error);
      return false;
    }
  },

  // Unpublish destination
  async unpublishDestination(
    destinationId: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("destination_cms")
        .update({
          is_published: false,
          unpublished_at: new Date().toISOString(),
        })
        .eq("id", destinationId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "unpublish_destination",
        module: "destinations",
        entity_type: "destination",
        entity_id: destinationId,
      });

      return true;
    } catch (error) {
      console.error("Error unpublishing destination:", error);
      return false;
    }
  },

  // Feature destination
  async featureDestination(
    destinationId: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("destination_cms")
        .update({
          is_featured: true,
          featured_by: adminId,
          featured_at: new Date().toISOString(),
        })
        .eq("id", destinationId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "feature_destination",
        module: "destinations",
        entity_type: "destination",
        entity_id: destinationId,
      });

      return true;
    } catch (error) {
      console.error("Error featuring destination:", error);
      return false;
    }
  },
};

// ============================================================================
// REFUND MANAGEMENT SERVICES
// ============================================================================

export const refundService = {
  // Get all refund requests
  async getAllRefunds(
    status?: string,
    limit: number = 50,
  ): Promise<RefundRequest[]> {
    try {
      let query = supabase.from("refund_requests").select("*");

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching refunds:", error);
      return [];
    }
  },

  // Approve refund
  async approveRefund(
    refundId: string,
    adminId: string,
    notes: string = "",
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "approved",
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          approval_notes: notes,
        })
        .eq("id", refundId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "approve_refund",
        module: "refunds",
        entity_type: "refund",
        entity_id: refundId,
      });

      return true;
    } catch (error) {
      console.error("Error approving refund:", error);
      return false;
    }
  },

  // Reject refund
  async rejectRefund(
    refundId: string,
    adminId: string,
    reason: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "rejected",
          rejected_by: adminId,
          rejected_at: new Date().toISOString(),
          rejection_notes: reason,
        })
        .eq("id", refundId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "reject_refund",
        module: "refunds",
        entity_type: "refund",
        entity_id: refundId,
        details: { reason },
      });

      return true;
    } catch (error) {
      console.error("Error rejecting refund:", error);
      return false;
    }
  },

  // Process refund
  async processRefund(
    refundId: string,
    adminId: string,
    notes: string = "",
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "processing",
          processed_by: adminId,
          processed_at: new Date().toISOString(),
          processing_notes: notes,
        })
        .eq("id", refundId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "process_refund",
        module: "refunds",
        entity_type: "refund",
        entity_id: refundId,
        details: { notes },
      });

      return true;
    } catch (error) {
      console.error("Error processing refund:", error);
      return false;
    }
  },

  // Hold refund
  async holdRefund(
    refundId: string,
    adminId: string,
    reason: string = "",
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "on_hold",
          held_by: adminId,
          held_at: new Date().toISOString(),
          hold_reason: reason,
        })
        .eq("id", refundId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "hold_refund",
        module: "refunds",
        entity_type: "refund",
        entity_id: refundId,
        details: { reason },
      });

      return true;
    } catch (error) {
      console.error("Error holding refund:", error);
      return false;
    }
  },
};

// ============================================================================
// MARKETING SERVICES
// ============================================================================

export const marketingService = {
  // Get all promo codes
  async getAllPromoCodes(): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      return [];
    }
  },

  // Create promo code
  async createPromoCode(
    code: PromoCode,
    adminId: string,
  ): Promise<PromoCode | null> {
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .insert({
          ...code,
          created_by: adminId,
        })
        .select()
        .single();

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "create_promo_code",
        module: "marketing",
        entity_type: "promo_code",
        entity_id: data?.id,
      });

      return data;
    } catch (error) {
      console.error("Error creating promo code:", error);
      return null;
    }
  },

  // Get marketing campaigns
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    try {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  },

  // Create marketing campaign
  async createCampaign(
    campaign: MarketingCampaign,
    adminId: string,
  ): Promise<MarketingCampaign | null> {
    try {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .insert({
          ...campaign,
          created_by: adminId,
        })
        .select()
        .single();

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "create_campaign",
        module: "marketing",
        entity_type: "campaign",
        entity_id: data?.id,
      });

      return data;
    } catch (error) {
      console.error("Error creating campaign:", error);
      return null;
    }
  },
};

// ============================================================================
// ADVERTISEMENT SERVICES
// ============================================================================

export const adService = {
  // Get all advertisements
  async getAllAds(status?: string): Promise<Advertisement[]> {
    try {
      let query = supabase.from("advertisements").select("*");

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching ads:", error);
      return [];
    }
  },

  // Create advertisement
  async createAd(
    ad: Advertisement,
    adminId: string,
  ): Promise<Advertisement | null> {
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .insert({
          ...ad,
          created_by: adminId,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "create_ad",
        module: "advertisements",
        entity_type: "advertisement",
        entity_id: data?.id,
      });

      return data;
    } catch (error) {
      console.error("Error creating ad:", error);
      return null;
    }
  },

  // Update ad status
  async updateAdStatus(
    adId: string,
    status: string,
    adminId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("advertisements")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adId);

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "update_ad_status",
        module: "advertisements",
        entity_type: "advertisement",
        entity_id: adId,
        details: { status },
      });

      return true;
    } catch (error) {
      console.error("Error updating ad status:", error);
      return false;
    }
  },
};

// ============================================================================
// REPORTS SERVICES
// ============================================================================

export const reportService = {
  // Get financial reports
  async getFinancialReports(
    type: string,
    startDate: string,
    endDate: string,
  ): Promise<FinancialReport[]> {
    try {
      const { data, error } = await supabase
        .from("financial_reports")
        .select("*")
        .eq("report_type", type)
        .gte("report_period_start", startDate)
        .lte("report_period_end", endDate)
        .order("report_period_start", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching financial reports:", error);
      return [];
    }
  },

  // Generate financial report
  async generateFinancialReport(
    report: FinancialReport,
    adminId: string,
  ): Promise<FinancialReport | null> {
    try {
      const { data, error } = await supabase
        .from("financial_reports")
        .insert({
          ...report,
          generated_by: adminId,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await adminService.logActivity({
        admin_id: adminId,
        action: "generate_report",
        module: "reports",
        entity_type: "financial_report",
        entity_id: data?.id,
      });

      return data;
    } catch (error) {
      console.error("Error generating report:", error);
      return null;
    }
  },
};
