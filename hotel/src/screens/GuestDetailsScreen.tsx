import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const guestStats = [
  { id: "bookings", label: "Total Bookings", value: "12" },
  { id: "spent", label: "Total Spent", value: "$4,850" },
  { id: "points", label: "Loyalty Points", value: "2,450" },
];

const actionCards = [
  {
    id: "message",
    label: "Message Guest",
    icon: "message-text-outline",
    color: "#6366F1",
  },
  {
    id: "edit",
    label: "Modify Booking",
    icon: "pencil-outline",
    color: "#34D399",
  },
  {
    id: "cancel",
    label: "Cancel Booking",
    icon: "close-circle-outline",
    color: "#F87171",
  },
];

export function GuestDetailsScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="share-outline"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Guest Details</Text>

        <View style={styles.profileCard}>
          <Image
            style={styles.avatar}
            source={{
              uri: "https://images.unsplash.com/photo-1502767089025-6572583495b3?auto=format&fit=crop&w=100&q=80",
            }}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <Text style={styles.profileName}>Robert Fox</Text>
              <View style={styles.vipTag}>
                <Text style={styles.vipText}>VIP Guest</Text>
              </View>
            </View>
            <View style={styles.profileMeta}>
              <MaterialIcons name="phone" size={16} color="#6366F1" />
              <Text style={styles.profileMetaText}>+1 202 555 0175</Text>
            </View>
            <View style={styles.profileMeta}>
              <MaterialCommunityIcons
                name="email-outline"
                size={16}
                color="#6366F1"
              />
              <Text style={styles.profileMetaText}>robertfox@email.com</Text>
            </View>
            <View style={styles.profileMeta}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={16}
                color="#6366F1"
              />
              <Text style={styles.profileMetaText}>United States</Text>
            </View>
          </View>
        </View>

        <View style={styles.statRow}>
          {guestStats.map((item) => (
            <View key={item.id} style={styles.statCard}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tabRow}>
          {["Booking Details", "Profile", "History", "Notes"].map(
            (tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  index === 0 && styles.tabButtonActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, index === 0 && styles.tabTextActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <Text style={styles.detailValue}>#R-88211</Text>
          </View>
          <View style={styles.detailSplit}>
            <View>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>26 May 2024</Text>
              <Text style={styles.detailMeta}>10:00 AM</Text>
            </View>
            <View style={styles.textRight}>
              <Text style={styles.detailLabel}>Check-out</Text>
              <Text style={styles.detailValue}>28 May 2024</Text>
              <Text style={styles.detailMeta}>12:00 PM</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Room Type</Text>
            <Text style={styles.detailValue}>Deluxe Room</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Guests</Text>
            <Text style={styles.detailValue}>2 Adults • 1 Child</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status</Text>
            <Text style={[styles.detailValue, { color: "#22C55E" }]}>Paid</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>$240.00</Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          {actionCards.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.actionCard, { borderColor: item.color + "26" }]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={item.color}
                />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
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
    paddingBottom: 100,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: "#1f2937",
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  vipTag: {
    backgroundColor: "rgba(248, 209, 139, 0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  vipText: {
    fontSize: 10,
    color: "#FBBF24",
    fontWeight: "700",
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  profileMetaText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 22,
  },
  statCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    width: "32%",
    minWidth: 90,
    marginBottom: 12,
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tabButton: {
    borderRadius: 999,
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabButtonActive: {
    backgroundColor: "#4F46E5",
  },
  tabText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#fff",
  },
  detailCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  detailMeta: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 4,
  },
  detailSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  textRight: {
    alignItems: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: "#1F2937",
    marginVertical: 10,
  },
  totalAmount: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "800",
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "32%",
    minWidth: 100,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});
