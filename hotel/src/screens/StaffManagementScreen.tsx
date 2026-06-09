import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

const departments = [
  {
    id: "frontdesk",
    label: "Front Desk",
    value: "12",
    icon: "account-group",
    iconColor: "#A78BFA",
    bg: "rgba(109, 40, 217, 0.18)",
  },
  {
    id: "housekeeping",
    label: "Housekeep",
    value: "15",
    icon: "broom",
    iconColor: "#34D399",
    bg: "rgba(16, 185, 129, 0.18)",
  },
  {
    id: "maintenance",
    label: "Mainten...",
    value: "6",
    icon: "cog",
    iconColor: "#38BDF8",
    bg: "rgba(59, 130, 246, 0.18)",
  },
  {
    id: "fnb",
    label: "F&B Svc",
    value: "8",
    icon: "silverware-fork-knife",
    iconColor: "#FB923C",
    bg: "rgba(251, 146, 60, 0.18)",
  },
  {
    id: "security",
    label: "Security",
    value: "4",
    icon: "shield-check",
    iconColor: "#22D3EE",
    bg: "rgba(14, 165, 233, 0.18)",
  },
];

const staffMembers = [
  {
    id: "john",
    name: "John Doe",
    role: "Front Desk Manager",
    phone: "+880 1723 456789",
    status: "Active",
    statusColor: "#10B981",
    image:
      "https://images.unsplash.com/photo-1502767089025-6572583495b3?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "sarah",
    name: "Sarah Wilson",
    role: "Housekeeping Staff",
    phone: "+880 1823 456789",
    status: "Active",
    statusColor: "#10B981",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "michael",
    name: "Michael Brown",
    role: "Maintenance Staff",
    phone: "+880 1912 456789",
    status: "On Duty",
    statusColor: "#F59E0B",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "david",
    name: "David Lee",
    role: "F&B Manager",
    phone: "+880 1634 567890",
    status: "Active",
    statusColor: "#10B981",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
  },
];

export function StaffManagementScreen() {
  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.timeText}>9:41</Text>
          <View style={styles.statusIcons}>
            <MaterialIcons name="battery-std" size={18} color="#fff" />
            <MaterialIcons
              name="wifi"
              size={18}
              color="#fff"
              style={styles.statusIcon}
            />
          </View>
        </View>

        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Staff Management</Text>
          </View>
          <View style={styles.notificationWrapper}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color="#94A3B8"
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.overviewCard}>
            <View style={styles.overviewText}>
              <Text style={styles.metaLabel}>Total Staff</Text>
              <Text style={styles.totalStaff}>45</Text>
              <View style={styles.staffSummaryRow}>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>Active Staff</Text>
                  <Text style={styles.summaryValue}>38</Text>
                </View>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>On Leave</Text>
                  <Text style={styles.summaryValue}>7</Text>
                </View>
              </View>
            </View>
            <View style={styles.progressChartWrapper}>
              <Svg width={96} height={96} viewBox="0 0 96 96">
                <Circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#1E293B"
                  strokeWidth="8"
                  fill="transparent"
                />
                <Circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#06B6D4"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset="40.2"
                  transform="rotate(-90 48 48)"
                />
              </Svg>
              <View style={styles.chartLabelWrapper}>
                <Text style={styles.chartValue}>84%</Text>
                <Text style={styles.chartLabel}>Active</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Departments</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.departmentsGrid}>
            {departments.map((department) => (
              <View key={department.id} style={styles.departmentTile}>
                <View
                  style={[
                    styles.departmentIcon,
                    { backgroundColor: department.bg },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={department.icon as any}
                    size={24}
                    color={department.iconColor}
                  />
                </View>
                <Text style={styles.departmentLabel}>{department.label}</Text>
                <Text style={styles.departmentValue}>{department.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Staff</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                <MaterialIcons name="search" size={18} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.staffList}>
            {staffMembers.map((staff) => (
              <View key={staff.id} style={styles.staffRow}>
                <View style={styles.staffInfo}>
                  <Image
                    source={{ uri: staff.image }}
                    style={styles.staffAvatar}
                  />
                  <View>
                    <Text style={styles.staffName}>{staff.name}</Text>
                    <Text style={styles.staffRole}>{staff.role}</Text>
                    <Text style={styles.staffPhone}>{staff.phone}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: `${staff.statusColor}20` },
                  ]}
                >
                  <Text
                    style={[styles.statusLabel, { color: staff.statusColor }]}
                  >
                    {staff.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="home-filled" size={20} color="#94A3B8" />
            <Text style={styles.navLabel}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="event-note" size={20} color="#94A3B8" />
            <Text style={styles.navLabel}>Reservations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="bed" size={20} color="#94A3B8" />
            <Text style={styles.navLabel}>Rooms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color="#94A3B8"
            />
            <Text style={styles.navLabel}>Teams</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#01040D",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0F1D",
    borderRadius: 40,
    margin: 12,
    overflow: "hidden",
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginLeft: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  notificationWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0A0F1D",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 180,
  },
  overviewCard: {
    backgroundColor: "#141B2D",
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  overviewText: {
    flex: 1,
    paddingRight: 10,
  },
  metaLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 10,
  },
  totalStaff: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 18,
  },
  staffSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryBlock: {
    flex: 1,
  },
  summaryLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 6,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  progressChartWrapper: {
    width: 96,
    height: 96,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chartLabelWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  chartValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  chartLabel: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  viewAll: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
  },
  departmentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  departmentTile: {
    width: "18%",
    minWidth: 58,
    alignItems: "center",
    marginBottom: 16,
  },
  departmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  departmentLabel: {
    color: "#94A3B8",
    fontSize: 10,
    textAlign: "center",
  },
  departmentValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  staffList: {
    marginBottom: 16,
  },
  staffRow: {
    backgroundColor: "#141B2D",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0A0F1D",
    marginRight: 12,
  },
  staffName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  staffRole: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 2,
  },
  staffPhone: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 28,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    paddingHorizontal: 24,
    backgroundColor: "#0A0F1D",
    borderTopWidth: 1,
    borderTopColor: "#17233A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
  },
  navLabel: {
    color: "#94A3B8",
    fontSize: 10,
  },
});
