// Bulk Operations & Automation Service
import { supabase } from "@/utils/supabase";

export interface BulkOperation {
  id: string;
  operation_type:
    | "suspend"
    | "ban"
    | "verify"
    | "update_role"
    | "delete"
    | "email"
    | "export";
  status: "pending" | "processing" | "completed" | "failed";
  total_records: number;
  processed_records: number;
  failed_records: number;
  started_at: string;
  completed_at?: string;
  admin_id: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: Record<string, any>;
  action: string;
  action_config: Record<string, any>;
  is_active: boolean;
  created_by: string;
  execution_logs?: any[];
}

export interface ScheduledTask {
  id: string;
  name: string;
  task_type: string;
  schedule: string; // cron format
  last_run?: string;
  next_run: string;
  is_active: boolean;
}

// Bulk Operations Service
export const bulkOperationService = {
  async createBulkOperation(
    operationType: string,
    userIds: string[],
    config: Record<string, any>,
    adminId: string,
  ) {
    try {
      const { data, error } = await supabase
        .from("bulk_operations")
        .insert({
          operation_type: operationType,
          user_ids: userIds,
          config: config,
          admin_id: adminId,
          status: "pending",
          total_records: userIds.length,
          processed_records: 0,
          failed_records: 0,
          started_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      // Queue the operation for processing
      await this.queueBulkOperation(data?.[0]);

      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating bulk operation:", err);
      return null;
    }
  },

  async queueBulkOperation(operation: BulkOperation) {
    try {
      // Add to job queue for processing
      await supabase.from("job_queue").insert({
        job_type: "bulk_operation",
        job_id: operation.id,
        status: "queued",
        priority: 1,
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error("Error queuing bulk operation:", err);
      return false;
    }
  },

  async bulkSuspendUsers(userIds: string[], reason: string, adminId: string) {
    return this.createBulkOperation("suspend", userIds, { reason }, adminId);
  },

  async bulkBanUsers(userIds: string[], reason: string, adminId: string) {
    return this.createBulkOperation("ban", userIds, { reason }, adminId);
  },

  async bulkVerifyUsers(userIds: string[], adminId: string) {
    return this.createBulkOperation("verify", userIds, {}, adminId);
  },

  async bulkUpdateRoles(userIds: string[], newRole: string, adminId: string) {
    return this.createBulkOperation(
      "update_role",
      userIds,
      { new_role: newRole },
      adminId,
    );
  },

  async bulkSendEmail(
    userIds: string[],
    emailTemplate: string,
    adminId: string,
  ) {
    return this.createBulkOperation(
      "email",
      userIds,
      { template: emailTemplate },
      adminId,
    );
  },

  async getBulkOperationStatus(operationId: string) {
    try {
      const { data, error } = await supabase
        .from("bulk_operations")
        .select("*")
        .eq("id", operationId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching bulk operation status:", err);
      return null;
    }
  },

  async getAdminBulkOperations(adminId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("bulk_operations")
        .select("*")
        .eq("admin_id", adminId)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching bulk operations:", err);
      return [];
    }
  },

  async cancelBulkOperation(operationId: string) {
    try {
      const { error } = await supabase
        .from("bulk_operations")
        .update({ status: "cancelled" })
        .eq("id", operationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error cancelling bulk operation:", err);
      return false;
    }
  },

  async retryFailedRecords(operationId: string) {
    try {
      await supabase.from("job_queue").insert({
        job_type: "bulk_operation_retry",
        job_id: operationId,
        status: "queued",
        priority: 2,
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error("Error retrying failed records:", err);
      return false;
    }
  },
};

// Automation Rules Service
export const automationService = {
  async createRule(rule: Omit<AutomationRule, "id">, adminId: string) {
    try {
      const { data, error } = await supabase
        .from("automation_rules")
        .insert({
          ...rule,
          created_by: adminId,
        })
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating automation rule:", err);
      return null;
    }
  },

  async updateRule(ruleId: string, updates: Partial<AutomationRule>) {
    try {
      const { data, error } = await supabase
        .from("automation_rules")
        .update(updates)
        .eq("id", ruleId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error updating automation rule:", err);
      return null;
    }
  },

  async getActiveRules() {
    try {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching active rules:", err);
      return [];
    }
  },

  async getRuleExecutionLogs(ruleId: string, limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from("automation_execution_logs")
        .select("*")
        .eq("rule_id", ruleId)
        .order("executed_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching execution logs:", err);
      return [];
    }
  },

  // Example rules
  async createSuspendInactiveUsersRule(adminId: string) {
    return this.createRule(
      {
        name: "Auto-Suspend Inactive Users",
        trigger: "daily_at_midnight",
        condition: {
          last_login_days: 90,
          verification_status: "verified",
        },
        action: "suspend_users",
        action_config: {
          reason: "Inactivity for 90+ days",
          notify_user: true,
        },
        is_active: true,
        created_by: adminId,
      },
      adminId,
    );
  },

  async createFraudDetectionRule(adminId: string) {
    return this.createRule(
      {
        name: "Fraud Detection Alert",
        trigger: "real_time",
        condition: {
          suspicious_pattern: true,
          detection_type: "multiple_failed_logins",
          threshold: 5,
          time_window_minutes: 10,
        },
        action: "notify_security_team",
        action_config: {
          notification_channels: ["email", "slack"],
          severity: "high",
        },
        is_active: true,
        created_by: adminId,
      },
      adminId,
    );
  },

  async createCleanupRule(adminId: string) {
    return this.createRule(
      {
        name: "Auto-Cleanup Old Data",
        trigger: "weekly_sunday",
        condition: {
          data_age_days: 180,
          tables: ["temp_uploads", "expired_sessions"],
        },
        action: "delete_old_records",
        action_config: {
          keep_backup: true,
          notify_admin: true,
        },
        is_active: true,
        created_by: adminId,
      },
      adminId,
    );
  },

  async toggleRule(ruleId: string, isActive: boolean) {
    return this.updateRule(ruleId, { is_active: isActive });
  },

  async deleteRule(ruleId: string) {
    try {
      const { error } = await supabase
        .from("automation_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error deleting automation rule:", err);
      return false;
    }
  },
};

// Scheduled Tasks Service
export const scheduledTaskService = {
  async createTask(task: Omit<ScheduledTask, "id">) {
    try {
      const { data, error } = await supabase
        .from("scheduled_tasks")
        .insert(task)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating scheduled task:", err);
      return null;
    }
  },

  async getActiveTasks() {
    try {
      const { data, error } = await supabase
        .from("scheduled_tasks")
        .select("*")
        .eq("is_active", true)
        .order("next_run");

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching active tasks:", err);
      return [];
    }
  },

  async updateTaskSchedule(taskId: string, schedule: string) {
    try {
      const { data, error } = await supabase
        .from("scheduled_tasks")
        .update({ schedule, next_run: new Date().toISOString() })
        .eq("id", taskId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error updating task schedule:", err);
      return null;
    }
  },

  async disableTask(taskId: string) {
    try {
      const { error } = await supabase
        .from("scheduled_tasks")
        .update({ is_active: false })
        .eq("id", taskId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error disabling task:", err);
      return false;
    }
  },

  // Common scheduled tasks
  async createDailyReportTask() {
    return this.createTask({
      name: "Daily Summary Report",
      task_type: "generate_report",
      schedule: "0 8 * * *", // 8 AM daily
      is_active: true,
      next_run: new Date().toISOString(),
    });
  },

  async createWeeklyCleanupTask() {
    return this.createTask({
      name: "Weekly Data Cleanup",
      task_type: "cleanup_old_data",
      schedule: "0 2 * * 0", // 2 AM Sunday
      is_active: true,
      next_run: new Date().toISOString(),
    });
  },

  async createMonthlyBillingTask() {
    return this.createTask({
      name: "Monthly Billing Run",
      task_type: "process_billing",
      schedule: "0 0 1 * *", // 1st of month
      is_active: true,
      next_run: new Date().toISOString(),
    });
  },
};
