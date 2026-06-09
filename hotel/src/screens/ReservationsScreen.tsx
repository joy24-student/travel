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

const filters = ["All", "Upcoming", "Checked In", "Checked Out", "Cancelled"];

const reservations = [
  {
    id: "robert",
    name: "Robert Fox",
    badge: "VIP",
    bookingId: "#R-88211",
    status: "Confirmed",
    statusColor: "#10B981",
    dates: "26 May – 28 May, 2 Nights",
    roomType: "Deluxe Room",
    guests: "2 Adults • 1 Child",
    price: "$240",
    paymentText: "Paid",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "jane",
    name: "Jane Cooper",
    bookingId: "#R-88212",
    status: "Upcoming",
    statusColor: "#6366F1",
    dates: "30 May – 02 Jun, 3 Nights",
    roomType: "Family Suite",
    guests: "4 Adults • 2 Children",
    price: "$560",
    paymentText: "Pay at Hotel",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "wade",
    name: "Wade Warren",
    bookingId: "#R-88213",
    status: "Pending",
    statusColor: "#F59E0B",
    dates: "30 May – 31 May, 1 Night",
    roomType: "Executive Room",
    guests: "1 Adult • 0 Child",
    price: "$160",
    paymentText: "Pay at Hotel",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: "esther",
    name: "Esther Howard",
    bookingId: "#R-88214",
    status: "Confirmed",
    statusColor: "#10B981",
    dates: "31 May – 02 Jun, 2 Nights",
    roomType: "Standard Room",
    guests: "2 Adults",
    price: "$220",
    paymentText: "Paid",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80",
  },
];

export function ReservationsScreen() {
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
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.8}>
              <MaterialIcons name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reservations</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <MaterialIcons name="search" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <MaterialIcons name="bookmark-border" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
            style={styles.filterWrapper}
          >
            {filters.map((filter, index) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  index === 1 ? styles.filterPillActive : null,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    index === 1 ? styles.filterTextActive : null,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today, 30 May 2024</Text>
          </View>
          <View style={styles.cardList}>
            {reservations.slice(0, 3).map((reservation) => (
              <View key={reservation.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <Image
                      source={{ uri: reservation.image }}
                      style={styles.avatar}
                    />
                    <View>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>{reservation.name}</Text>
                        {reservation.badge ? (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {reservation.badge}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.cardSubtitle}>
                        {reservation.bookingId}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { borderColor: `${reservation.statusColor}33` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: reservation.statusColor },
                      ]}
                    >
                      {reservation.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardMeta}>{reservation.dates}</Text>
                    <Text style={styles.cardRoom}>{reservation.roomType}</Text>
                    <Text style={styles.cardMeta}>{reservation.guests}</Text>
                  </View>
                  <View style={styles.cardPriceBlock}>
                    <Text style={styles.cardPrice}>{reservation.price}</Text>
                    <Text
                      style={[
                        styles.paymentText,
                        { color: reservation.statusColor },
                      ]}
                    >
                      {reservation.paymentText}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tomorrow, 31 May 2024</Text>
          </View>
          <View style={styles.cardList}>
            {reservations.slice(3).map((reservation) => (
              <View key={reservation.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <Image
                      source={{ uri: reservation.image }}
                      style={styles.avatar}
                    />
                    <View>
                      <Text style={styles.cardTitle}>{reservation.name}</Text>
                      <Text style={styles.cardSubtitle}>
                        {reservation.bookingId}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { borderColor: `${reservation.statusColor}33` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: reservation.statusColor },
                      ]}
                    >
                      {reservation.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardMeta}>{reservation.dates}</Text>
                    <Text style={styles.cardRoom}>{reservation.roomType}</Text>
                    <Text style={styles.cardMeta}>{reservation.guests}</Text>
                  </View>
                  <View style={styles.cardPriceBlock}>
                    <Text style={styles.cardPrice}>{reservation.price}</Text>
                    <Text
                      style={[
                        styles.paymentText,
                        { color: reservation.statusColor },
                      ]}
                    >
                      {reservation.paymentText}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="home" size={20} color="#94A3B8" />
            <Text style={styles.navLabel}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, styles.navItemActive]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="event-note" size={20} color="#6366F1" />
            <Text style={[styles.navLabel, styles.navLabelActive]}>
              Reservations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons name="bed" size={20} color="#94A3B8" />
            <Text style={styles.navLabel}>Rooms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={20}
              color="#94A3B8"
            />
            <Text style={styles.navLabel}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={20}
              color="#94A3B8"
            />
            <Text style={styles.navLabel}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0e14",
  },
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    borderRadius: 30,
    margin: 12,
    overflow: "hidden",
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: 22,
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
    paddingHorizontal: 22,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#151A23",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  filterWrapper: {
    marginTop: 6,
  },
  filterScroll: {
    paddingLeft: 22,
    paddingRight: 18,
  },
  filterPill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#11151E",
    marginRight: 12,
  },
  filterPillActive: {
    backgroundColor: "#4F46E5",
  },
  filterText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    paddingHorizontal: 22,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#94A3B8",
    letterSpacing: 1,
    fontWeight: "700",
  },
  cardList: {
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 8,
  },
  badge: {
    backgroundColor: "rgba(234,179,8,0.15)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 9,
    color: "#FBBF24",
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardMeta: {
    color: "#94A3B8",
    fontSize: 11,
  },
  cardRoom: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 4,
  },
  cardPriceBlock: {
    alignItems: "flex-end",
  },
  cardPrice: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  paymentText: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 6,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    paddingHorizontal: 24,
    backgroundColor: "#0d1117",
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
  },
  navItemActive: {
    alignItems: "center",
  },
  navLabel: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 4,
  },
  navLabelActive: {
    color: "#6366F1",
  },
});
