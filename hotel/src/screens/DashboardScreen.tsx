import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const overviewCards = [
  {
    id: "revenue",
    label: "Revenue",
    value: "$24,850",
    indicator: "+24.5%",
    color: "#A78BFA",
  },
  {
    id: "occupancy",
    label: "Occupancy",
    value: "72%",
    indicator: "+8.2%",
    color: "#34D399",
  },
  {
    id: "adr",
    label: "ADR",
    value: "$120",
    indicator: "+12.5%",
    color: "#FBBF24",
  },
];

const stats = [
  { id: "totalRooms", label: "Total Rooms", value: "70", accent: "#6366F1" },
  { id: "available", label: "Available", value: "18", accent: "#10B981" },
  { id: "occupied", label: "Occupied", value: "35", accent: "#F59E0B" },
  { id: "maintenance", label: "Maintenance", value: "5", accent: "#8B5CF6" },
];

export function DashboardScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Premium Dashboard</Text>
            <Text style={styles.screenSubtitle}>
              Hotel performance insights at a glance
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="notifications" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Total Earnings</Text>
            <Text style={styles.heroValue}>$24,850</Text>
            <Text style={styles.heroMeta}>24.5% higher than last month</Text>
          </View>
          <View style={styles.heroBadge}>
            <MaterialIcons name="trending-up" size={18} color="#fff" />
          </View>
        </View>

        <View style={styles.overviewGrid}>
          {overviewCards.map((card) => (
            <View
              key={card.id}
              style={[styles.statCard, { borderColor: card.color + "26" }]}
            >
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={[styles.statIndicator, { color: card.color }]}>
                {card.indicator}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room Availability</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryRow}>
          {stats.map((item) => (
            <View key={item.id} style={styles.categoryCard}>
              <View
                style={[
                  styles.categoryAccent,
                  { backgroundColor: item.accent + "22" },
                ]}
              />
              <Text style={styles.categoryLabel}>{item.label}</Text>
              <Text style={[styles.categoryValue, { color: item.accent }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.sectionAction}>Full Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.analyticsRow}>
            <View>
              <Text style={styles.analyticsLabel}>RevPAR</Text>
              <Text style={styles.analyticsValue}>$86</Text>
            </View>
            <View style={styles.analyticsTrend}>
              <MaterialIcons name="arrow-upward" size={18} color="#22C55E" />
              <Text style={styles.analyticsTrendText}>15.3%</Text>
            </View>
          </View>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartLine} />
            <View style={[styles.chartDot, { right: "12%" }]} />
            <View style={[styles.chartDot, { right: "28%" }]} />
            <View style={[styles.chartDot, { right: "45%" }]} />
            <View style={[styles.chartDot, { right: "65%" }]} />
          </View>
        </View>

        <View style={styles.bottomNavFake}>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="dashboard" size={22} color="#94A3B8" />
            <Text style={styles.navText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="calendar-today" size={22} color="#94A3B8" />
            <Text style={styles.navText}>Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="bar-chart" size={22} color="#94A3B8" />
            <Text style={styles.navText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="settings" size={22} color="#94A3B8" />
            <Text style={styles.navText}>More</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0b1326",
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  screenTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  screenSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    backgroundColor: "#121827",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroMeta: {
    color: "#94A3B8",
    fontSize: 13,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  overviewGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  statIndicator: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionAction: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
  },
  categoryAccent: {
    width: 36,
    height: 6,
    borderRadius: 4,
    marginBottom: 14,
  },
  categoryLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  categoryValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  analyticsCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 20,
    marginBottom: 30,
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  analyticsLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 6,
  },
  analyticsValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  analyticsTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  analyticsTrendText: {
    color: "#22C55E",
    fontWeight: "700",
  },
  chartPlaceholder: {
    height: 140,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    padding: 16,
    justifyContent: "flex-end",
  },
  chartLine: {
    height: 4,
    backgroundColor: "#7C3AED",
    borderRadius: 4,
    marginBottom: 12,
  },
  chartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#A78BFA",
    position: "absolute",
    bottom: 24,
  },
  bottomNavFake: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingVertical: 18,
    paddingHorizontal: 4,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 26,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "23%",
  },
  navText: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 4,
  },
});
