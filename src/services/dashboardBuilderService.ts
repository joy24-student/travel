// Custom Dashboard Builder Service
import { supabase } from "@/utils/supabase";

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  widget_type:
    | "metric"
    | "chart"
    | "gauge"
    | "table"
    | "list"
    | "heatmap"
    | "forecast";
  title: string;
  config: Record<string, any>;
  size: "small" | "medium" | "large" | "full";
  position: { row: number; col: number };
  refresh_interval?: number;
  is_visible: boolean;
  custom_colors?: Record<string, string>;
  filters?: any[];
}

export interface DashboardLayout {
  id: string;
  admin_id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  grid_size: { rows: number; cols: number };
  theme?: "light" | "dark";
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  category: string;
  widget_type: string;
  default_config: Record<string, any>;
  preview_image?: string;
  description: string;
}

// Custom Dashboard Service
export const customDashboardService = {
  async createDashboard(
    adminId: string,
    name: string,
    gridSize?: { rows: number; cols: number },
  ) {
    try {
      const { data, error } = await supabase
        .from("custom_dashboards")
        .insert({
          admin_id: adminId,
          name,
          grid_size: gridSize || { rows: 4, cols: 4 },
          widgets: [],
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating dashboard:", err);
      return null;
    }
  },

  async getDashboards(adminId: string) {
    try {
      const { data, error } = await supabase
        .from("custom_dashboards")
        .select("*")
        .eq("admin_id", adminId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching dashboards:", err);
      return [];
    }
  },

  async getDefaultDashboard(adminId: string) {
    try {
      const { data, error } = await supabase
        .from("custom_dashboards")
        .select("*")
        .eq("admin_id", adminId)
        .eq("is_default", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (err) {
      console.error("Error fetching default dashboard:", err);
      return null;
    }
  },

  async setDefaultDashboard(dashboardId: string, adminId: string) {
    try {
      // Unset current default
      await supabase
        .from("custom_dashboards")
        .update({ is_default: false })
        .eq("admin_id", adminId)
        .eq("is_default", true);

      // Set new default
      const { data, error } = await supabase
        .from("custom_dashboards")
        .update({ is_default: true })
        .eq("id", dashboardId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error setting default dashboard:", err);
      return null;
    }
  },

  async deleteDashboard(dashboardId: string) {
    try {
      const { error } = await supabase
        .from("custom_dashboards")
        .delete()
        .eq("id", dashboardId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error deleting dashboard:", err);
      return false;
    }
  },

  async updateDashboardLayout(
    dashboardId: string,
    gridSize: { rows: number; cols: number },
  ) {
    try {
      const { data, error } = await supabase
        .from("custom_dashboards")
        .update({
          grid_size: gridSize,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dashboardId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error updating dashboard layout:", err);
      return null;
    }
  },

  // Duplicate dashboard for quick setup
  async duplicateDashboard(
    sourceDashboardId: string,
    newName: string,
    adminId: string,
  ) {
    try {
      const sourceDb = await supabase
        .from("custom_dashboards")
        .select("*")
        .eq("id", sourceDashboardId)
        .single();

      if (sourceDb.error) throw sourceDb.error;

      const { widgets, grid_size } = sourceDb.data;

      const { data, error } = await supabase
        .from("custom_dashboards")
        .insert({
          admin_id: adminId,
          name: newName,
          widgets,
          grid_size,
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error duplicating dashboard:", err);
      return null;
    }
  },

  // Export dashboard config
  async exportDashboard(dashboardId: string) {
    try {
      const { data, error } = await supabase
        .from("custom_dashboards")
        .select("*")
        .eq("id", dashboardId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error exporting dashboard:", err);
      return null;
    }
  },

  // Import dashboard config
  async importDashboard(adminId: string, dashboardConfig: any) {
    try {
      const { data, error } = await supabase
        .from("custom_dashboards")
        .insert({
          admin_id: adminId,
          ...dashboardConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error importing dashboard:", err);
      return null;
    }
  },
};

// Widget Management Service
export const widgetService = {
  async addWidget(
    dashboardId: string,
    widget: Omit<DashboardWidget, "id" | "dashboard_id">,
  ) {
    try {
      const { data, error } = await supabase
        .from("dashboard_widgets")
        .insert({
          ...widget,
          dashboard_id: dashboardId,
        })
        .select();

      if (error) throw error;

      // Update dashboard modified timestamp
      await supabase
        .from("custom_dashboards")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", dashboardId);

      return data?.[0] || null;
    } catch (err) {
      console.error("Error adding widget:", err);
      return null;
    }
  },

  async getWidgets(dashboardId: string) {
    try {
      const { data, error } = await supabase
        .from("dashboard_widgets")
        .select("*")
        .eq("dashboard_id", dashboardId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching widgets:", err);
      return [];
    }
  },

  async updateWidget(widgetId: string, updates: Partial<DashboardWidget>) {
    try {
      const { data, error } = await supabase
        .from("dashboard_widgets")
        .update(updates)
        .eq("id", widgetId)
        .select();

      if (error) throw error;

      // Update dashboard modified timestamp
      if (data?.[0]) {
        await supabase
          .from("custom_dashboards")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", data[0].dashboard_id);
      }

      return data?.[0] || null;
    } catch (err) {
      console.error("Error updating widget:", err);
      return null;
    }
  },

  async removeWidget(widgetId: string) {
    try {
      const { error } = await supabase
        .from("dashboard_widgets")
        .delete()
        .eq("id", widgetId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error removing widget:", err);
      return false;
    }
  },

  async reorderWidgets(
    dashboardId: string,
    positions: Array<{ id: string; position: any }>,
  ) {
    try {
      const updates = positions.map(({ id, position }) => ({
        id,
        position,
      }));

      for (const update of updates) {
        await supabase
          .from("dashboard_widgets")
          .update({ position: update.position })
          .eq("id", update.id);
      }

      // Update dashboard modified timestamp
      await supabase
        .from("custom_dashboards")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", dashboardId);

      return true;
    } catch (err) {
      console.error("Error reordering widgets:", err);
      return false;
    }
  },

  async toggleWidgetVisibility(widgetId: string) {
    try {
      const { data: widget, error: fetchError } = await supabase
        .from("dashboard_widgets")
        .select("is_visible")
        .eq("id", widgetId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from("dashboard_widgets")
        .update({ is_visible: !widget.is_visible })
        .eq("id", widgetId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error toggling widget visibility:", err);
      return null;
    }
  },

  async applyTheme(dashboardId: string, theme: "light" | "dark") {
    try {
      const { data, error } = await supabase
        .from("custom_dashboards")
        .update({ theme })
        .eq("id", dashboardId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error applying theme:", err);
      return null;
    }
  },

  async customizeWidgetColors(
    widgetId: string,
    colors: Record<string, string>,
  ) {
    try {
      const { data, error } = await supabase
        .from("dashboard_widgets")
        .update({ custom_colors: colors })
        .eq("id", widgetId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error customizing widget colors:", err);
      return null;
    }
  },

  async addWidgetFilter(widgetId: string, filter: any) {
    try {
      const { data: widget, error: fetchError } = await supabase
        .from("dashboard_widgets")
        .select("filters")
        .eq("id", widgetId)
        .single();

      if (fetchError) throw fetchError;

      const filters = widget.filters || [];
      filters.push(filter);

      const { data, error } = await supabase
        .from("dashboard_widgets")
        .update({ filters })
        .eq("id", widgetId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error adding widget filter:", err);
      return null;
    }
  },

  async setAutoRefresh(widgetId: string, intervalSeconds: number) {
    try {
      const { data, error } = await supabase
        .from("dashboard_widgets")
        .update({ refresh_interval: intervalSeconds })
        .eq("id", widgetId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error setting auto-refresh:", err);
      return null;
    }
  },
};

// Widget Templates Service
export const widgetTemplateService = {
  async getTemplates(category?: string) {
    try {
      let query = supabase.from("widget_templates").select("*");

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching widget templates:", err);
      return [];
    }
  },

  async getTemplatesByType(widgetType: string) {
    try {
      const { data, error } = await supabase
        .from("widget_templates")
        .select("*")
        .eq("widget_type", widgetType);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching templates by type:", err);
      return [];
    }
  },

  // Predefined templates
  async getDefaultTemplates() {
    return [
      {
        name: "Total Revenue",
        category: "Metrics",
        widget_type: "metric",
        description: "Display total revenue metric",
        default_config: {
          metric: "total_revenue",
          format: "currency",
          showTrend: true,
        },
      },
      {
        name: "Active Users",
        category: "Metrics",
        widget_type: "metric",
        description: "Display active users count",
        default_config: {
          metric: "active_users",
          format: "number",
          showTrend: true,
        },
      },
      {
        name: "Revenue Trend",
        category: "Charts",
        widget_type: "chart",
        description: "Show revenue over time",
        default_config: {
          chartType: "line",
          metric: "total_revenue",
          timeRange: "30d",
        },
      },
      {
        name: "Conversion Rate",
        category: "Metrics",
        widget_type: "gauge",
        description: "Display conversion rate gauge",
        default_config: {
          metric: "conversion_rate",
          min: 0,
          max: 100,
        },
      },
      {
        name: "Top Agencies",
        category: "Tables",
        widget_type: "table",
        description: "Show top performing agencies",
        default_config: {
          table: "agencies",
          sortBy: "total_bookings",
          limit: 10,
        },
      },
    ];
  },

  async createTemplate(template: Omit<WidgetTemplate, "id">) {
    try {
      const { data, error } = await supabase
        .from("widget_templates")
        .insert(template)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error("Error creating widget template:", err);
      return null;
    }
  },
};
