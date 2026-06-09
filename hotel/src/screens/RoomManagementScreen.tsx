import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const categories = [
  { id: "standard", label: "Standard", rooms: "32", color: "#818CF8" },
  { id: "deluxe", label: "Deluxe", rooms: "18", color: "#38BDF8" },
  { id: "suite", label: "Suite", rooms: "12", color: "#F97316" },
  { id: "executive", label: "Executive", rooms: "8", color: "#22C55E" },
];

const statuses = [
  {
    id: "available",
    label: "Available",
    value: "18",
    progress: 26,
    color: "#22C55E",
  },
  {
    id: "occupied",
    label: "Occupied",
    value: "35",
    progress: 50,
    color: "#F97316",
  },
  {
    id: "reserved",
    label: "Reserved",
    value: "10",
    progress: 14,
    color: "#FBBF24",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    value: "5",
    progress: 7,
    color: "#8B5CF6",
  },
];

const floors = [
  {
    id: "1st",
    label: "1st Floor",
    value: "12 / 16",
    percent: 75,
    color: "#22C55E",
  },
  {
    id: "2nd",
    label: "2nd Floor",
    value: "8 / 16",
    percent: 50,
    color: "#A855F7",
  },
  {
    id: "3rd",
    label: "3rd Floor",
    value: "14 / 16",
    percent: 88,
    color: "#F97316",
  },
];

export function RoomManagementScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <MaterialIcons name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Rooms</Text>
          </View>
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.smallButton} activeOpacity={0.8}>
              <MaterialIcons name="search" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} activeOpacity={0.8}>
              <MaterialIcons name="add" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {categories.map((item) => (
            <View
              key={item.id}
              style={[styles.categoryCard, { borderColor: item.color + "26" }]}
            >
              <Text style={styles.categoryLabel}>{item.label}</Text>
              <Text style={styles.categoryRooms}>{item.rooms}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room Status</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusList}>
          {statuses.map((status) => (
            <View key={status.id} style={styles.statusCard}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: status.color + "20" },
                  ]}
                >
                  <Text
                    style={[styles.statusPillText, { color: status.color }]}
                  >
                    {status.label}
                  </Text>
                </View>
                <Text style={styles.statusValue}>{status.value}</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${status.progress}%`,
                      backgroundColor: status.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Floor Overview</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.sectionAction}>Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.floorList}>
          {floors.map((floor) => (
            <View key={floor.id} style={styles.floorRow}>
              <View
                style={[
                  styles.floorBadge,
                  { backgroundColor: floor.color + "15" },
                ]}
              >
                <Text style={[styles.floorBadgeText, { color: floor.color }]}>
                  {floor.id}
                </Text>
              </View>
              <View style={styles.floorInfo}>
                <Text style={styles.floorLabel}>{floor.label}</Text>
                <Text style={styles.floorMeta}>{floor.value}</Text>
              </View>
              <Text style={[styles.floorPercent, { color: floor.color }]}>
                {floor.percent}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  actionGroup: {
    flexDirection: "row",
    gap: 10,
  },
  smallButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  categoryCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    backgroundColor: "#111827",
  },
  categoryLabel: {
    color: "#94A3B8",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  categoryRooms: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
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
  statusList: {
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  statusLeft: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "#0b1121",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 99,
  },
  floorList: {
    marginBottom: 20,
  },
  floorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  floorBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  floorBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  floorInfo: {
    flex: 1,
  },
  floorLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  floorMeta: {
    color: "#94A3B8",
    fontSize: 12,
  },
  floorPercent: {
    fontSize: 14,
    fontWeight: "700",
  },
});
