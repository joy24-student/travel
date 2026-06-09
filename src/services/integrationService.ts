// Integration & API Management Service
import { supabase } from "@/utils/supabase";
import crypto from "crypto";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret?: string;
  scopes: string[];
  rate_limit?: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  last_used?: string;
  expires_at?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  retry_policy: {
    max_retries: number;
    backoff_multiplier: number;
  };
  headers?: Record<string, string>;
  created_at: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string; // 'slack', 'stripe', 'sendgrid', 'twilio', etc.
  credentials: Record<string, any>;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

// API Key Management
export const apiKeyService = {
  async generateApiKey(name: string, scopes: string[], adminId: string) {
    try {
      const key = this.generateRandomKey(32);
      const secret = this.generateRandomKey(64);

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          name,
          key: this.hashKey(key),
          secret: this.hashKey(secret),
          scopes,
          is_active: true,
          created_by: adminId,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      return {
        ...data?.[0],
        key, // Return unhashed key only once
        secret, // Return unhashed secret only once
      };
    } catch (err) {
      console.error("Error generating API key:", err);
      return null;
    }
  },

  async validateApiKey(key: string, secret?: string) {
    try {
      const hashedKey = this.hashKey(key);

      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("key", hashedKey)
        .eq("is_active", true)
        .single();

      if (error || !data) return false;

      if (secret) {
        const hashedSecret = this.hashKey(secret);
        if (data.secret !== hashedSecret) return false;
      }

      // Update last used timestamp
      await supabase
        .from("api_keys")
        .update({ last_used: new Date().toISOString() })
        .eq("id", data.id);

      return data;
    } catch (err) {
      console.error("Error validating API key:", err);
      return false;
    }
  },

  async getApiKeys(adminId: string) {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select(
          "id, name, scopes, is_active, created_at, last_used, expires_at",
        )
        .eq("created_by", adminId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching API keys:", err);
      return [];
    }
  },

  async revokeApiKey(keyId: string) {
    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error revoking API key:", err);
      return false;
    }
  },

  async setKeyExpiry(keyId: string, expiresAt: string) {
    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ expires_at: expiresAt })
        .eq("id", keyId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error setting key expiry:", err);
      return false;
    }
  },

  async rotateApiKey(oldKeyId: string, adminId: string) {
    try {
      const oldKey = await supabase
        .from("api_keys")
        .select("name, scopes")
        .eq("id", oldKeyId)
        .single();

      if (oldKey.error) throw oldKey.error;

      // Generate new key
      const newKey = await this.generateApiKey(
        `${oldKey.data.name} (rotated)`,
        oldKey.data.scopes,
        adminId,
      );

      // Revoke old key
      await this.revokeApiKey(oldKeyId);

      return newKey;
    } catch (err) {
      console.error("Error rotating API key:", err);
      return null;
    }
  },

  generateRandomKey(length: number): string {
    return crypto.randomBytes(length).toString("hex");
  },

  hashKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
  },

  async checkRateLimit(keyId: string, limit: number = 1000) {
    try {
      const { data, error } = await supabase
        .from("api_usage")
        .select("request_count")
        .eq("api_key_id", keyId)
        .gte("timestamp", new Date(Date.now() - 3600000).toISOString());

      if (error) throw error;

      const totalRequests =
        data?.reduce((sum, d) => sum + d.request_count, 0) || 0;
      return totalRequests < limit;
    } catch (err) {
      console.error("Error checking rate limit:", err);
      return false;
    }
  },
};

// Webhook Management
export const webhookService = {
  async createWebhook(webhook: Omit<Webhook, "id" | "created_at">) {
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .insert({
          ...webhook,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating webhook:", err);
      return null;
    }
  },

  async getWebhooks(filterActive: boolean = true) {
    try {
      let query = supabase.from("webhooks").select("*");

      if (filterActive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching webhooks:", err);
      return [];
    }
  },

  async getWebhooksByEvent(event: string) {
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .contains("events", [event])
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching webhooks by event:", err);
      return [];
    }
  },

  async updateWebhook(webhookId: string, updates: Partial<Webhook>) {
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .update(updates)
        .eq("id", webhookId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error updating webhook:", err);
      return null;
    }
  },

  async deleteWebhook(webhookId: string) {
    try {
      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", webhookId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error deleting webhook:", err);
      return false;
    }
  },

  async testWebhook(webhookId: string) {
    try {
      const webhook = await supabase
        .from("webhooks")
        .select("url, headers")
        .eq("id", webhookId)
        .single();

      if (webhook.error) throw webhook.error;

      // Send test payload
      const response = await fetch(webhook.data.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...webhook.data.headers,
          "X-Webhook-Test": "true",
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });

      // Log test result
      await supabase.from("webhook_logs").insert({
        webhook_id: webhookId,
        event: "test",
        status_code: response.status,
        response_time: 0,
        success: response.status >= 200 && response.status < 300,
        timestamp: new Date().toISOString(),
      });

      return response.status >= 200 && response.status < 300;
    } catch (err) {
      console.error("Error testing webhook:", err);
      return false;
    }
  },

  async triggerWebhook(event: string, payload: any) {
    try {
      const webhooks = await this.getWebhooksByEvent(event);

      const promises = webhooks.map(async (webhook) => {
        try {
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...webhook.headers,
              "X-Webhook-Event": event,
              "X-Webhook-Signature": this.generateSignature(payload),
            },
            body: JSON.stringify(payload),
          });

          const startTime = Date.now();
          const responseTime = Date.now() - startTime;

          // Log webhook delivery
          await supabase.from("webhook_logs").insert({
            webhook_id: webhook.id,
            event,
            status_code: response.status,
            response_time: responseTime,
            success: response.status >= 200 && response.status < 300,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`Error triggering webhook ${webhook.id}:`, err);
        }
      });

      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error("Error triggering webhooks:", err);
      return false;
    }
  },

  generateSignature(payload: any): string {
    const secret = process.env.WEBHOOK_SECRET || "default-secret";
    return crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");
  },

  async getWebhookLogs(webhookId: string, limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .eq("webhook_id", webhookId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching webhook logs:", err);
      return [];
    }
  },
};

// Integration Management
export const integrationService = {
  async createIntegration(integration: Omit<Integration, "id" | "created_at">) {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .insert({
          ...integration,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating integration:", err);
      return null;
    }
  },

  async getIntegrations() {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("id, name, type, is_active, created_at");

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching integrations:", err);
      return [];
    }
  },

  async getIntegrationByType(type: string) {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("type", type)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (err) {
      console.error("Error fetching integration:", err);
      return null;
    }
  },

  async updateIntegration(
    integrationId: string,
    updates: Partial<Integration>,
  ) {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .update(updates)
        .eq("id", integrationId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error updating integration:", err);
      return null;
    }
  },

  async disableIntegration(integrationId: string) {
    return this.updateIntegration(integrationId, { is_active: false });
  },

  async testIntegration(integrationId: string) {
    try {
      const integration = await supabase
        .from("integrations")
        .select("*")
        .eq("id", integrationId)
        .single();

      if (integration.error) throw integration.error;

      // Test based on type
      let testResult = false;

      switch (integration.data.type) {
        case "slack":
          testResult = await this.testSlackIntegration(integration.data);
          break;
        case "stripe":
          testResult = await this.testStripeIntegration(integration.data);
          break;
        case "sendgrid":
          testResult = await this.testSendgridIntegration(integration.data);
          break;
      }

      return testResult;
    } catch (err) {
      console.error("Error testing integration:", err);
      return false;
    }
  },

  async testSlackIntegration(integration: Integration) {
    try {
      const response = await fetch("https://slack.com/api/auth.test", {
        headers: { Authorization: `Bearer ${integration.credentials.token}` },
      });

      return response.ok;
    } catch (err) {
      return false;
    }
  },

  async testStripeIntegration(integration: Integration) {
    try {
      const response = await fetch("https://api.stripe.com/v1/account", {
        headers: { Authorization: `Bearer ${integration.credentials.api_key}` },
      });

      return response.ok;
    } catch (err) {
      return false;
    }
  },

  async testSendgridIntegration(integration: Integration) {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/user/account", {
        headers: { Authorization: `Bearer ${integration.credentials.api_key}` },
      });

      return response.ok;
    } catch (err) {
      return false;
    }
  },
};
