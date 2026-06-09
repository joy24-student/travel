import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const overview = [
  { id: "total", label: "Total Rooms", value: "70", accent: "#6366F1" },
  { id: "cleaned", label: "Cleaned", value: "32", accent: "#22C55E" },
  { id: "progress", label: "In Progress", value: "18", accent: "#F97316" },
  { id: "pending", label: "pending", value: "20", accent: "#A855F7" },
];

const tasks = [
  {
    id: "101",
    label: "101 Deluxe Room",
    type: "Stayover",
    state: "Cleaned",
    time: "09:30 AM",
    color: "#22C55E",
  },
  {
    id: "102",
    label: "102 Standard Room",
    type: "Check-out",
    state: "In Progress",
    time: "10:15 AM",
    color: "#F97316",
  },
  {
    id: "103",
    label: "103 Suite Room",
    type: "Stayover",
    state: "Pending",
    time: "11:00 AM",
    color: "#A855F7",
  },
  {
    id: "104",
    label: "104 Family Room",
    type: "Check-out",
    state: "Pending",
    time: "11:30 AM",
    color: "#A855F7",
  },
  {
    id: "105",
    label: "105 Executive Room",
    type: "Stayover",
    state: "Cleaned",
    time: "09:45 AM",
    color: "#22C55E",
  },
];

export function HousekeepingScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Housekeeping</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="menu" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.overviewGrid}>
          {overview.map((item) => (
            <View
              key={item.id}
              style={[styles.overviewCard, { borderColor: item.accent + "26" }]}
            >
              <Text style={styles.overviewLabel}>{item.label}</Text>
              <Text style={[styles.overviewValue, { color: item.accent }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.tasksHeader}>
          <Text style={styles.sectionTitle}>Cleaning Tasks</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View
                style={[
                  styles.taskAccent,
                  { backgroundColor: task.color + "20" },
                ]}
              >
                <MaterialIcons name="bed" size={20} color={task.color} />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskLabel}>{task.label}</Text>
                <Text style={styles.taskMeta}>{task.type}</Text>
              </View>
              <View style={styles.taskStatus}>
                <Text style={[styles.statusText, { color: task.color }]}>
                  {task.state}
                </Text>
                <Text style={styles.taskTime}>{task.time}</Text>
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
    backgroundColor: "#020617",
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
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  overviewCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 22,
    backgroundColor: "#0e1324",
    padding: 18,
    marginBottom: 14,
  },
  overviewLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  overviewValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionAction: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
  },
  tasksList: {
    marginBottom: 20,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  taskAccent: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  taskContent: {
    flex: 1,
  },
  taskLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  taskMeta: {
    color: "#94A3B8",
    fontSize: 12,
  },
  taskStatus: {
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  taskTime: {
    color: "#6B7280",
    fontSize: 11,
  },
});
