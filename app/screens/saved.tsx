import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav, AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";

const SAVED_ITEMS = [
  { id: "1", type: "hotel", name: "Ocean View Resort", location: "Cox's Bazar", icon: "bed" },
  { id: "2", type: "flight", name: "Dhaka → Bangkok", date: "Dec 15, 2025", icon: "airplane" },
  { id: "3", type: "destination", name: "Bangkok Tour Package", price: "$480", icon: "map" },
];

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Saved Items</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SAVED_ITEMS.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No saved items</Text>
            <Text style={styles.emptySubtitle}>Items you save will appear here</Text>
          </View>
        ) : (
          SAVED_ITEMS.map((item) => (
            <Pressable key={item.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name={item.icon as any} size={24} color={PRIMARY} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.location || item.date || item.price}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${PRIMARY}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
});