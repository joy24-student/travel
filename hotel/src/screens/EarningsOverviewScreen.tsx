import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const breakdown = [
  {
    id: "room",
    label: "Room Revenue",
    value: "$18,250",
    trend: "+18.6%",
    color: "#818CF8",
  },
  {
    id: "restaurant",
    label: "Restaurant Revenue",
    value: "$4,850",
    trend: "+12.4%",
    color: "#F97316",
  },
  {
    id: "services",
    label: "Other Services",
    value: "$1,750",
    trend: "+8.7%",
    color: "#14B8A6",
  },
];

const transactions = [
  {
    id: "booking",
    label: "Booking #R-88211",
    date: "26 May 2024, 10:30 AM",
    amount: "+ $240.00",
    status: "Completed",
  },
  {
    id: "restaurant",
    label: "Restaurant Bill",
    date: "26 May 2024, 01:15 PM",
    amount: "+ $85.00",
    status: "Completed",
  },
];

export function EarningsOverviewScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Text style={styles.iconButtonText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Earnings Overview</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Text style={styles.iconButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeframeButton}>
          <Text style={styles.timeframeText}>This Month</Text>
          <Text style={styles.timeframeIcon}>⌄</Text>
        </View>

        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <View>
              <Text style={styles.cardMeta}>Total Earnings</Text>
              <Text style={styles.earningsValue}>$24,850</Text>
              <Text style={styles.earningsDelta}>24.5% vs last month</Text>
            </View>
            <TouchableOpacity style={styles.detailsButton} activeOpacity={0.8}>
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartBlock}>
            <Svg width="100%" height="140" viewBox="0 0 400 140">
              <Rect x="0" y="0" width="400" height="140" fill="transparent" />
              <Path
                d="M0,120 C50,90 100,110 150,80 C200,50 250,70 300,40 C350,10 400,20"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="3"
              />
              <Circle cx="400" cy="20" r="5" fill="#7C3AED" />
            </Svg>
          </View>
        </View>

        <View style={styles.breakdownHeader}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.breakdownList}>
          {breakdown.map((item) => (
            <View key={item.id} style={styles.breakdownItem}>
              <View
                style={[
                  styles.breakdownBadge,
                  { backgroundColor: item.color + "22" },
                ]}
              />
              <View style={styles.breakdownContent}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
              </View>
              <View style={styles.breakdownMeta}>
                <Text style={styles.breakdownValue}>{item.value}</Text>
                <Text style={[styles.breakdownTrend, { color: item.color }]}>
                  {item.trend}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.breakdownHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionLabel}>{transaction.label}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>
                  {transaction.amount}
                </Text>
                <View style={styles.transactionStatus}>
                  <Text style={styles.transactionStatusText}>
                    {transaction.status}
                  </Text>
                </View>
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
    backgroundColor: "#0f111a",
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  timeframeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  timeframeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  timeframeIcon: {
    color: "#94A3B8",
    fontSize: 16,
  },
  earningsCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
  },
  earningsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  cardMeta: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 8,
  },
  earningsValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
  },
  earningsDelta: {
    color: "#22C55E",
    fontSize: 12,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  detailsButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  chartBlock: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0d1117",
    paddingVertical: 10,
  },
  breakdownHeader: {
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
  linkText: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
  },
  breakdownList: {
    marginBottom: 22,
  },
  breakdownItem: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  breakdownBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  breakdownMeta: {
    alignItems: "flex-end",
  },
  breakdownValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  breakdownTrend: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionsList: {
    marginBottom: 24,
  },
  transactionCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionLeft: {
    flex: 1,
    marginRight: 14,
  },
  transactionLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  transactionDate: {
    color: "#94A3B8",
    fontSize: 11,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  transactionStatus: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  transactionStatusText: {
    color: "#22C55E",
    fontSize: 10,
    fontWeight: "700",
  },
});
