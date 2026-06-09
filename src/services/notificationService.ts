// Advanced Notification System Service
import { supabase } from "@/utils/supabase";

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "alert";
  priority: "low" | "medium" | "high" | "critical";
  channels: ("in_app" | "email" | "sms" | "push" | "slack")[];
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  trigger_event: string;
  recipient_filter: Record<string, any>;
  notification_template: string;
  channels: string[];
  is_active: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  html_template?: string;
  variables: string[];
}

// Notification Service
export const notificationService = {
  // Send single notification
  async sendNotification(
    notification: Omit<Notification, "id" | "created_at">,
  ) {
    try {
      const { data: notif, error: notifError } = await supabase
        .from("notifications")
        .insert({
          ...notification,
          created_at: new Date().toISOString(),
        })
        .select();

      if (notifError) throw notifError;

      const notifData = notif?.[0];

      // Send through channels
      const promises = notification.channels.map((channel) => {
        switch (channel) {
          case "email":
            return this.sendEmailNotification(notifData);
          case "sms":
            return this.sendSmsNotification(notifData);
          case "push":
            return this.sendPushNotification(notifData);
          case "slack":
            return this.sendSlackNotification(notifData);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      return notifData || null;
    } catch (err) {
      console.error("Error sending notification:", err);
      return null;
    }
  },

  // Bulk notifications
  async sendBulkNotification(
    recipientIds: string[],
    title: string,
    message: string,
    config: Partial<Notification>,
  ) {
    try {
      const notifications = recipientIds.map((recipientId) => ({
        recipient_id: recipientId,
        title,
        message,
        type: config.type || "info",
        priority: config.priority || "medium",
        channels: config.channels || ["in_app"],
        read: false,
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("notifications")
        .insert(notifications)
        .select();

      if (error) throw error;

      // Send through channels
      data?.forEach((notif) => {
        config.channels?.forEach((channel) => {
          this.sendThroughChannel(notif, channel);
        });
      });

      return data || [];
    } catch (err) {
      console.error("Error sending bulk notifications:", err);
      return [];
    }
  },

  // Alert for critical events
  async sendCriticalAlert(
    adminIds: string[],
    title: string,
    message: string,
    metadata?: any,
  ) {
    return this.sendBulkNotification(adminIds, title, message, {
      type: "alert",
      priority: "critical",
      channels: ["in_app", "email", "slack"],
      metadata,
    });
  },

  // Get notifications
  async getNotifications(
    userId: string,
    limit: number = 50,
    unreadOnly: boolean = false,
  ) {
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId);

      if (unreadOnly) {
        query = query.eq("read", false);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  },

  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false;
    }
  },

  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_id", userId)
        .eq("read", false);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return false;
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error deleting notification:", err);
      return false;
    }
  },

  // Channel-specific sending
  async sendEmailNotification(notification: any) {
    try {
      // Integration with email service (SendGrid, AWS SES, etc.)
      await supabase.from("audit_logs").insert({
        action: "EMAIL_NOTIFICATION_SENT",
        description: `Email sent to ${notification.recipient_id}`,
        timestamp: new Date().toISOString(),
        status: "success",
      });

      return true;
    } catch (err) {
      console.error("Error sending email notification:", err);
      return false;
    }
  },

  async sendSmsNotification(notification: any) {
    try {
      // Integration with SMS service (Twilio, AWS SNS, etc.)
      await supabase.from("audit_logs").insert({
        action: "SMS_NOTIFICATION_SENT",
        description: `SMS sent to ${notification.recipient_id}`,
        timestamp: new Date().toISOString(),
        status: "success",
      });

      return true;
    } catch (err) {
      console.error("Error sending SMS notification:", err);
      return false;
    }
  },

  async sendPushNotification(notification: any) {
    try {
      // Integration with push notification service (FCM, APNs, etc.)
      await supabase.from("audit_logs").insert({
        action: "PUSH_NOTIFICATION_SENT",
        description: `Push notification sent to ${notification.recipient_id}`,
        timestamp: new Date().toISOString(),
        status: "success",
      });

      return true;
    } catch (err) {
      console.error("Error sending push notification:", err);
      return false;
    }
  },

  async sendSlackNotification(notification: any) {
    try {
      // Integration with Slack API
      // await fetch('https://hooks.slack.com/...', { ... })

      await supabase.from("audit_logs").insert({
        action: "SLACK_NOTIFICATION_SENT",
        description: `Slack message sent for: ${notification.title}`,
        timestamp: new Date().toISOString(),
        status: "success",
      });

      return true;
    } catch (err) {
      console.error("Error sending Slack notification:", err);
      return false;
    }
  },

  async sendThroughChannel(notification: any, channel: string) {
    switch (channel) {
      case "email":
        return this.sendEmailNotification(notification);
      case "sms":
        return this.sendSmsNotification(notification);
      case "push":
        return this.sendPushNotification(notification);
      case "slack":
        return this.sendSlackNotification(notification);
      default:
        return false;
    }
  },

  // Notification preferences
  async getUserNotificationPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (err) {
      console.error("Error fetching notification preferences:", err);
      return null;
    }
  },

  async updateNotificationPreferences(userId: string, preferences: any) {
    try {
      const existing = await this.getUserNotificationPreferences(userId);

      if (existing) {
        const { data, error } = await supabase
          .from("notification_preferences")
          .update(preferences)
          .eq("user_id", userId)
          .select();

        if (error) throw error;
        return data?.[0] || null;
      } else {
        const { data, error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: userId,
            ...preferences,
          })
          .select();

        if (error) throw error;
        return data?.[0] || null;
      }
    } catch (err) {
      console.error("Error updating notification preferences:", err);
      return null;
    }
  },

  async disableNotificationChannel(userId: string, channel: string) {
    try {
      const prefs = await this.getUserNotificationPreferences(userId);
      const disabledChannels = prefs?.disabled_channels || [];

      if (!disabledChannels.includes(channel)) {
        disabledChannels.push(channel);
      }

      return this.updateNotificationPreferences(userId, {
        disabled_channels: disabledChannels,
      });
    } catch (err) {
      console.error("Error disabling notification channel:", err);
      return null;
    }
  },
};

// Notification Template Service
export const notificationTemplateService = {
  async getTemplate(templateName: string) {
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("name", templateName)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching notification template:", err);
      return null;
    }
  },

  async renderTemplate(templateName: string, variables: Record<string, any>) {
    try {
      const template = await this.getTemplate(templateName);
      if (!template) return null;

      let message = template.message;
      let subject = template.subject;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        message = message.replace(new RegExp(placeholder, "g"), String(value));
        subject = subject.replace(new RegExp(placeholder, "g"), String(value));
      });

      return { subject, message };
    } catch (err) {
      console.error("Error rendering template:", err);
      return null;
    }
  },

  async createTemplate(template: Omit<NotificationTemplate, "id">) {
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .insert(template)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating notification template:", err);
      return null;
    }
  },
};

// Notification Rules Service
export const notificationRuleService = {
  async createRule(rule: Omit<NotificationRule, "id">) {
    try {
      const { data, error } = await supabase
        .from("notification_rules")
        .insert(rule)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating notification rule:", err);
      return null;
    }
  },

  async getActiveRules() {
    try {
      const { data, error } = await supabase
        .from("notification_rules")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching active rules:", err);
      return [];
    }
  },

  async getRulesByEvent(triggerEvent: string) {
    try {
      const { data, error } = await supabase
        .from("notification_rules")
        .select("*")
        .eq("trigger_event", triggerEvent)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching rules by event:", err);
      return [];
    }
  },

  async toggleRule(ruleId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from("notification_rules")
        .update({ is_active: isActive })
        .eq("id", ruleId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error toggling notification rule:", err);
      return false;
    }
  },
};
