import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const cards = [
  {
    id: "adr",
    label: "ADR",
    value: "$120",
    detail: "Daily average rate",
    color: "#6366F1",
  },
  {
    id: "revpar",
    label: "RevPAR",
    value: "$86",
    detail: "Revenue per available room",
    color: "#34D399",
  },
  {
    id: "nps",
    label: "NPS",
    value: "87",
    detail: "Guest satisfaction",
    color: "#F59E0B",
  },
];

const stats = [
  { id: "rooms", label: "Occupancy", value: "72%", progress: 72 },
  { id: "revenue", label: "Revenue Growth", value: "24.5%", progress: 63 },
  { id: "bookings", label: "Bookings", value: "178", progress: 48 },
];

export function ReportsAnalyticsScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Reports & Analytics</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="download" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsRow}>
          {cards.map((card) => (
            <View
              key={card.id}
              style={[styles.infoCard, { borderColor: card.color + "26" }]}
            >
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardDetail}>{card.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Monthly Revenue</Text>
            <Text style={styles.chartSubtitle}>April 2024</Text>
          </View>
          <View style={styles.chartBars}>
            {[60, 90, 75, 110, 95, 130, 105].map((height, index) => (
              <View key={index} style={[styles.chartBar, { height }]} />
            ))}
          </View>
        </View>

        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Quick Insights</Text>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.metricRow}>
              <View>
                <Text style={styles.metricLabel}>{stat.label}</Text>
                <Text style={styles.metricValue}>{stat.value}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${stat.progress}%` }]}
                />
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
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 22,
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  cardValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardDetail: {
    color: "#94A3B8",
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chartTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  chartSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
  },
  chartBar: {
    width: "12%",
    backgroundColor: "#7C3AED",
    borderRadius: 12,
  },
  metricsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  metricRow: {
    marginBottom: 16,
  },
  metricLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#0f172a",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#6366F1",
  },
});
