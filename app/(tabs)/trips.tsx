import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/hooks/useAuth";
import { useUserBookings } from "../../src/hooks/useBooking";
import { AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";
const STATUS_TABS = [
  "All",
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_MAP: Record<StatusTab, string | undefined> = {
  All: undefined,
  Upcoming: "confirmed",
  Ongoing: "confirmed",
  Completed: "completed",
  Cancelled: "cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#10b981",
  completed: "#287dfa",
  cancelled: "#ef4444",
  draft: "#9ca3af",
  payment_pending: "#f59e0b",
  refunded: "#8b5cf6",
};

export default function TripsTab() {
  const { user } = useAuth();
  const [activeStatus, setActiveStatus] = useState<StatusTab>("All");
  const { bookings, loading, refetch } = useUserBookings(
    user?.id,
    STATUS_MAP[activeStatus],
  );

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <Text style={s.title}>My Trips</Text>
        <Pressable
          onPress={() => router.push("/screens/booking-system" as any)}
          style={s.newBookingBtn}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.newBookingText}>New Booking</Text>
        </Pressable>
      </View>

      {/* Status tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.statusTabs}
      >
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveStatus(tab)}
            style={[s.statusTab, activeStatus === tab && s.statusTabActive]}
          >
            <Text
              style={[
                s.statusTabText,
                activeStatus === tab && s.statusTabTextActive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 40 }} />
        )}

        {!loading && bookings.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="airplane-outline" size={56} color="#d1d5db" />
            <Text style={s.emptyTitle}>
              No {activeStatus.toLowerCase()} trips
            </Text>
            <Text style={s.emptySubtitle}>
              Start planning your next adventure
            </Text>
            <Pressable
              style={s.exploreBtn}
              onPress={() => router.push("/(tabs)/" as any)}
            >
              <Text style={s.exploreBtnText}>Explore Packages</Text>
            </Pressable>
          </View>
        )}

        {!loading &&
          bookings.map((booking: any) => (
            <Pressable
              key={booking.id}
              style={s.bookingCard}
              onPress={() =>
                router.push({
                  pathname: "/screens/[slug]",
                  params: { slug: "booking-system" },
                } as any)
              }
            >
              <View style={s.bookingTop}>
                <View style={s.bookingIconWrap}>
                  <Ionicons
                    name={productIcon(booking.product_type)}
                    size={22}
                    color={PRIMARY}
                  />
                </View>
                <View style={s.bookingInfo}>
                  <Text style={s.bookingRef}>{booking.booking_reference}</Text>
                  <Text style={s.bookingDest}>
                    {booking.destination_city}
                    {booking.destination_country
                      ? `, ${booking.destination_country}`
                      : ""}
                  </Text>
                </View>
                <View
                  style={[
                    s.statusBadge,
                    {
                      backgroundColor: `${STATUS_COLORS[booking.status] ?? "#9ca3af"}18`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.statusBadgeText,
                      { color: STATUS_COLORS[booking.status] ?? "#9ca3af" },
                    ]}
                  >
                    {booking.status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              <View style={s.bookingMeta}>
                <MetaChip
                  icon="calendar-outline"
                  label={booking.start_date ?? "TBD"}
                />
                <MetaChip
                  icon="people-outline"
                  label={`${booking.number_of_guests} guest${booking.number_of_guests > 1 ? "s" : ""}`}
                />
                <MetaChip
                  icon="cash-outline"
                  label={`${booking.currency} ${booking.final_price}`}
                />
              </View>

              <View style={s.bookingActions}>
                {booking.status === "confirmed" && (
                  <ActionBtn
                    icon="qr-code-outline"
                    label="View Voucher"
                    color={PRIMARY}
                    onPress={() => {}}
                  />
                )}
                {booking.status === "confirmed" && (
                  <ActionBtn
                    icon="document-text-outline"
                    label="Invoice"
                    color="#10b981"
                    onPress={() => {}}
                  />
                )}
                {["confirmed", "payment_pending"].includes(booking.status) && (
                  <ActionBtn
                    icon="close-circle-outline"
                    label="Cancel"
                    color="#ef4444"
                    onPress={() => {}}
                  />
                )}
                {booking.status === "completed" && (
                  <ActionBtn
                    icon="refresh-circle-outline"
                    label="Refund"
                    color="#8b5cf6"
                    onPress={() => {}}
                  />
                )}
              </View>
            </Pressable>
          ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <AiPill color={PRIMARY} />
    </SafeAreaView>
  );
}

function MetaChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.metaChip}>
      <Ionicons name={icon as any} size={12} color="#667085" />
      <Text style={s.metaChipText}>{label}</Text>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.actionBtn,
        { borderColor: `${color}40`, backgroundColor: `${color}08` },
      ]}
    >
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={[s.actionBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function productIcon(type: string): any {
  const map: Record<string, string> = {
    hotel: "bed-outline",
    flight: "airplane-outline",
    train: "train-outline",
    tour: "map-outline",
    package: "gift-outline",
    car: "car-outline",
  };
  return map[type] ?? "compass-outline";
}

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f5f7fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f4f7",
  },
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },
  newBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  newBookingText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  statusTabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  statusTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  statusTabActive: { backgroundColor: PRIMARY },
  statusTabText: { fontSize: 12, fontWeight: "700", color: "#667085" },
  statusTabTextActive: { color: "#fff" },
  scroll: { padding: 16 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#374151" },
  emptySubtitle: { fontSize: 14, color: "#9ca3af" },
  exploreBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  exploreBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  bookingTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  bookingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${PRIMARY}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingInfo: { flex: 1 },
  bookingRef: { fontSize: 12, color: "#9ca3af", fontWeight: "700" },
  bookingDest: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginTop: 2,
  },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  bookingMeta: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f5f7fa",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipText: { fontSize: 11, color: "#667085", fontWeight: "700" },
  bookingActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: "#f2f4f7",
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnText: { fontSize: 12, fontWeight: "700" },
});
