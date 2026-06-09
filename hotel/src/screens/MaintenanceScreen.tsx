import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const issues = [
  {
    id: "1",
    title: "Leaking Faucet",
    room: "202",
    status: "In Progress",
    time: "08:30 AM",
    color: "#F97316",
  },
  {
    id: "2",
    title: "Broken AC",
    room: "310",
    status: "Pending",
    time: "09:15 AM",
    color: "#A855F7",
  },
  {
    id: "3",
    title: "TV Not Working",
    room: "111",
    status: "Scheduled",
    time: "10:00 AM",
    color: "#38BDF8",
  },
  {
    id: "4",
    title: "Light Fixture Fault",
    room: "405",
    status: "Completed",
    time: "Yesterday",
    color: "#22C55E",
  },
];

export function MaintenanceScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Maintenance</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="build" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.overviewCard}>
          <View>
            <Text style={styles.overviewLabel}>Open Requests</Text>
            <Text style={styles.overviewValue}>12</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionText}>Add Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.issueList}>
          {issues.map((issue) => (
            <View key={issue.id} style={styles.issueCard}>
              <View
                style={[
                  styles.issueIcon,
                  { backgroundColor: issue.color + "20" },
                ]}
              >
                <MaterialIcons
                  name="report-problem"
                  size={20}
                  color={issue.color}
                />
              </View>
              <View style={styles.issueContent}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueMeta}>
                  {issue.room} • {issue.time}
                </Text>
              </View>
              <View
                style={[
                  styles.issueStatus,
                  { backgroundColor: issue.color + "16" },
                ]}
              >
                <Text style={[styles.issueStatusText, { color: issue.color }]}>
                  {issue.status}
                </Text>
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
    backgroundColor: "#050816",
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
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
  overviewCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  overviewLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  overviewValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },
  actionButton: {
    backgroundColor: "#6366F1",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
  issueList: {
    gap: 12,
  },
  issueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 16,
  },
  issueIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  issueMeta: {
    color: "#94A3B8",
    fontSize: 11,
  },
  issueStatus: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  issueStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
