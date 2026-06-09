/**
 * Admin Dashboard - Executive Dashboard Component
 * Professional, Modern UI with Gradient Colors and Animations
 */

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { dashboardService, adminService } from "@/services/adminService";
import { DashboardMetrics, AdminUser } from "@/types/admin";

const { width, height } = Dimensions.get("window");

/**
 * Dashboard Header with Admin Info and Gradient
 */
const DashboardHeader: React.FC<{ admin: AdminUser | null }> = ({ admin }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#667eea", "#764ba2"],
  });

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back!</Text>
          <Text style={styles.headerTitle}>
            {admin?.role.replace("_", " ").toUpperCase() || "Admin"}
          </Text>
        </View>
        <View style={styles.headerIconContainer}>
          <LinearGradient
            colors={["#f093fb", "#f5576c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <MaterialCommunityIcons
              name="shield-admin"
              size={32}
              color="#fff"
            />
          </LinearGradient>
        </View>
      </View>
    </LinearGradient>
  );
};

/**
 * Animated Statistical Card Component
 */
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: string;
  gradient: [string, string];
  trend?: "up" | "down";
  trendValue?: number;
  onPress?: () => void;
}> = ({ title, value, icon, gradient, trend, trendValue, onPress }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <View style={styles.statCardContent}>
            <View style={styles.statCardLeft}>
              <Text style={styles.statCardTitle}>{title}</Text>
              <Text style={styles.statCardValue}>{value}</Text>
              {trend && trendValue !== undefined && (
                <View style={styles.trendContainer}>
                  <Ionicons
                    name={trend === "up" ? "arrow-up" : "arrow-down"}
                    size={16}
                    color={trend === "up" ? "#10b981" : "#ef4444"}
                  />
                  <Text
                    style={[
                      styles.trendText,
                      { color: trend === "up" ? "#10b981" : "#ef4444" },
                    ]}
                  >
                    {trendValue}%
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.statCardIcon}>
              <MaterialCommunityIcons name={icon} size={40} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Revenue Chart Component with SVG
 */
const RevenueChart: React.FC<{ metrics: DashboardMetrics | null }> = ({
  metrics,
}) => {
  const data = [
    { month: "Jan", value: 40 },
    { month: "Feb", value: 65 },
    { month: "Mar", value: 50 },
    { month: "Apr", value: 75 },
    { month: "May", value: 85 },
    { month: "Jun", value: 100 },
  ];

  const chartWidth = width - 40;
  const chartHeight = 250;
  const padding = 30;
  const graphWidth = chartWidth - 2 * padding;
  const graphHeight = chartHeight - 2 * padding;
  const maxValue = Math.max(...data.map((d) => d.value));

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * graphWidth,
    y: chartHeight - padding - (d.value / maxValue) * graphHeight,
  }));

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <LinearGradient
      colors={["#f5f7fa", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.chartContainer}
    >
      <Text style={styles.chartTitle}>Revenue Growth</Text>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <React.Fragment key={`grid-${i}`}>
            <Path
              d={`M ${padding} ${padding + (i / 4) * graphHeight} L ${
                chartWidth - padding
              } ${padding + (i / 4) * graphHeight}`}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          </React.Fragment>
        ))}

        {/* Chart line */}
        <Path
          d={pathData}
          stroke="url(#chartGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Fill under chart */}
        <Path
          d={`${pathData} L ${points[points.length - 1].x} ${
            chartHeight - padding
          } L ${padding} ${chartHeight - padding} Z`}
          fill="url(#chartFill)"
          opacity="0.2"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="5"
            fill="#667eea"
            opacity="1"
          />
        ))}

        {/* Axes */}
        <Path
          d={`M ${padding} ${chartHeight - padding} L ${
            chartWidth - padding
          } ${chartHeight - padding}`}
          stroke="#d1d5db"
          strokeWidth="2"
        />
        <Path
          d={`M ${padding} ${padding} L ${padding} ${chartHeight - padding}`}
          stroke="#d1d5db"
          strokeWidth="2"
        />

        {/* Labels */}
        {data.map((d, i) => (
          <SvgText
            key={`label-${i}`}
            x={points[i].x}
            y={chartHeight - padding + 20}
            fontSize="12"
            fill="#6b7280"
            textAnchor="middle"
          >
            {d.month}
          </SvgText>
        ))}
      </Svg>
    </LinearGradient>
  );
};

/**
 * Performance Gauge Component
 */
const PerformanceGauge: React.FC<{ value: number; title: string }> = ({
  value,
  title,
}) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <LinearGradient
      colors={["#ffffff", "#f9fafb"]}
      style={styles.gaugeContainer}
    >
      <Text style={styles.gaugeTitle}>{title}</Text>
      <View style={styles.gaugeContent}>
        <Svg width={200} height={180} style={styles.gaugeSvg}>
          <Circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <Circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#667eea"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transform: [{ rotate: "-90deg" }] }}
          />
          <SvgText
            x="100"
            y="110"
            fontSize="28"
            fontWeight="bold"
            fill="#667eea"
            textAnchor="middle"
          >
            {value}%
          </SvgText>
        </Svg>
      </View>
    </LinearGradient>
  );
};

/**
 * Activity Feed Component
 */
const ActivityFeed: React.FC<{ activities: any[] }> = ({ activities = [] }) => {
  return (
    <LinearGradient
      colors={["#ffffff", "#f9fafb"]}
      style={styles.activityContainer}
    >
      <Text style={styles.activityTitle}>Live Activity Feed</Text>
      {activities.length === 0 ? (
        <Text style={styles.emptyText}>No recent activities</Text>
      ) : (
        <ScrollView
          style={styles.activityList}
          showsVerticalScrollIndicator={false}
        >
          {activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons
                  name="circle"
                  size={12}
                  color="#667eea"
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

/**
 * Main Admin Dashboard Component
 */
export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const adminData = await adminService.getCurrentAdmin();
      setAdmin(adminData);

      const metricsData = await dashboardService.getTodayMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader admin={admin} />

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Users"
            value={metrics?.total_users || 0}
            icon="account-multiple"
            gradient={["#667eea", "#764ba2"]}
            trend="up"
            trendValue={12}
          />
          <StatCard
            title="Total Agencies"
            value={metrics?.total_agencies || 0}
            icon="home-city"
            gradient={["#f093fb", "#f5576c"]}
            trend="down"
            trendValue={5}
          />
        </View>

        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Bookings"
            value={metrics?.total_bookings || 0}
            icon="calendar-check"
            gradient={["#4facfe", "#00f2fe"]}
            trend="up"
            trendValue={23}
          />
          <StatCard
            title="Total Revenue"
            value={`$${(metrics?.total_revenue || 0).toLocaleString()}`}
            icon="cash-multiple"
            gradient={["#43e97b", "#38f9d7"]}
            trend="up"
            trendValue={18}
          />
        </View>

        <View style={styles.metricsGrid}>
          <StatCard
            title="Today's Revenue"
            value={`$${(metrics?.today_revenue || 0).toLocaleString()}`}
            icon="cash-usd-outline"
            gradient={["#fa709a", "#fee140"]}
          />
          <StatCard
            title="Active Users"
            value={metrics?.active_users || 0}
            icon="account-check"
            gradient={["#30cfd0", "#330867"]}
            trend="up"
            trendValue={8}
          />
        </View>

        <View style={styles.metricsGrid}>
          <StatCard
            title="Active Trips"
            value={metrics?.active_trips || 0}
            icon="airplane"
            gradient={["#a8edea", "#fed6e3"]}
          />
          <StatCard
            title="Live Visitors"
            value={metrics?.live_visitors || 0}
            icon="eye-outline"
            gradient={["#ff9a56", "#ff6a88"]}
          />
        </View>

        <View style={styles.metricsGrid}>
          <StatCard
            title="Conversion Rate"
            value={`${metrics?.conversion_rate || 0}%`}
            icon="chart-line"
            gradient={["#667eea", "#764ba2"]}
          />
          <StatCard
            title="Cancellation Rate"
            value={`${metrics?.cancellation_rate || 0}%`}
            icon="alert-circle-outline"
            gradient={["#f5576c", "#f093fb"]}
          />
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.section}>
        <RevenueChart metrics={metrics} />
      </View>

      {/* Performance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.performanceGrid}>
          <PerformanceGauge
            value={metrics?.conversion_rate || 0}
            title="Conversion"
          />
          <PerformanceGauge
            value={Math.min(100, ((metrics?.total_bookings || 0) / 1000) * 100)}
            title="Bookings"
          />
        </View>
      </View>

      {/* Activity Feed */}
      <View style={styles.section}>
        <ActivityFeed activities={[]} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <MaterialCommunityIcons
                name="account-plus"
                size={24}
                color="#fff"
              />
              <Text style={styles.quickActionText}>Add User</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={["#f093fb", "#f5576c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <MaterialCommunityIcons
                name="home-city-outline"
                size={24}
                color="#fff"
              />
              <Text style={styles.quickActionText}>Manage Agency</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <MaterialCommunityIcons name="receipt" size={24} color="#fff" />
              <Text style={styles.quickActionText}>View Bookings</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={["#43e97b", "#38f9d7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <MaterialCommunityIcons
                name="cash-check"
                size={24}
                color="#fff"
              />
              <Text style={styles.quickActionText}>Refunds</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerGreeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerIconContainer: {
    marginLeft: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  // Stat Card Styles
  statCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  statCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statCardLeft: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 6,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  statCardIcon: {
    marginLeft: 12,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  trendText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  // Chart Styles
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },

  // Gauge Styles
  gaugeContainer: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    flex: 1,
    marginVertical: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  gaugeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  gaugeContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  gaugeSvg: {
    marginBottom: 8,
  },

  // Activity Styles
  activityContainer: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    minHeight: 200,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  activityList: {
    maxHeight: 250,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1f2937",
  },
  activityTime: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 20,
  },

  // Section Styles
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  performanceGrid: {
    flexDirection: "row",
    gap: 12,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionButton: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
});

export default AdminDashboard;
