import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const devices = [
  {
    id: "1",
    name: "iPhone 14",
    location: "Front Desk",
    status: "Active",
    updated: "2 min ago",
  },
  {
    id: "2",
    name: "iPad Pro",
    location: "Housekeeping",
    status: "Active",
    updated: "10 min ago",
  },
  {
    id: "3",
    name: "MacBook Air",
    location: "Manager Office",
    status: "Inactive",
    updated: "2 hours ago",
  },
];

export function LoginDevicesScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Login Devices</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="refresh" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          All devices currently connected to your account.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statValue}>2</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Inactive</Text>
            <Text style={styles.statValue}>1</Text>
          </View>
        </View>

        <View style={styles.deviceList}>
          {devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceIcon}>
                <MaterialIcons name="devices" size={24} color="#fff" />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceLocation}>{device.location}</Text>
              </View>
              <View style={styles.deviceStatusGroup}>
                <Text
                  style={[
                    styles.deviceStatus,
                    device.status === "Active"
                      ? styles.activeStatus
                      : styles.inactiveStatus,
                  ]}
                >
                  {device.status}
                </Text>
                <Text style={styles.deviceUpdated}>{device.updated}</Text>
              </View>
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
    backgroundColor: "#0b1326",
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  statValue: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  deviceList: {
    gap: 12,
  },
  deviceCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  deviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  deviceLocation: {
    color: "#94A3B8",
    fontSize: 12,
  },
  deviceStatusGroup: {
    alignItems: "flex-end",
  },
  deviceStatus: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  activeStatus: {
    color: "#22C55E",
  },
  inactiveStatus: {
    color: "#94A3B8",
  },
  deviceUpdated: {
    color: "#6B7280",
    fontSize: 11,
  },
});
