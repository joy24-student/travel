import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav, AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";

const REVIEWS = [
  { id: "1", location: "Cox's Bazar", rating: 5, review: "Amazing beach view and great service!", date: "2 weeks ago" },
  { id: "2", location: "Ocean View Resort", rating: 4, review: "Clean rooms, friendly staff", date: "1 month ago" },
  { id: "3", location: "Bangkok Trip", rating: 5, review: "Perfect itinerary and guides", date: "2 months ago" },
];

export default function ReviewsScreen() {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Reviews</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {REVIEWS.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySubtitle}>Your reviews will appear here after your trips</Text>
          </View>
        ) : (
          REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewLocation}>{review.location}</Text>
                <View style={styles.ratingRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons key={i} name={i < review.rating ? "star" : "star-outline"} size={14} color="#f59e0b" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.review}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <AiPill color={PRIMARY} />
      <BottomNav active="Account" color={PRIMARY} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827", flex: 1, textAlign: "center" },
  spacer: { width: 32 },
  scroll: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 14, color: "#9ca3af" },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewLocation: { fontSize: 15, fontWeight: "700", color: "#111827" },
  ratingRow: { flexDirection: "row", gap: 2 },
  reviewText: { fontSize: 14, color: "#374151", lineHeight: 20, marginBottom: 6 },
  reviewDate: { fontSize: 12, color: "#9ca3af" },
});