import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav, AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";

const HELP_ITEMS = [
  { icon: "help-circle-outline", label: "FAQs", desc: "Frequently asked questions" },
  { icon: "chatbubble-outline", label: "Contact Support", desc: "Chat with our team" },
  { icon: "document-text-outline", label: "Terms & Conditions", desc: "Legal information" },
  { icon: "shield-outline", label: "Privacy Policy", desc: "How we protect your data" },
  { icon: "card-outline", label: "Payment Methods", desc: "Accepted payment types" },
  { icon: "refresh-outline", label: "Cancellation Policy", desc: "Booking changes & refunds" },
];

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {HELP_ITEMS.map((item) => (
          <Pressable key={item.label} style={styles.helpItem}>
            <View style={styles.helpIcon}>
              <Ionicons name={item.icon as any} size={22} color={PRIMARY} />
            </View>
            <View style={styles.helpContent}>
              <Text style={styles.helpLabel}>{item.label}</Text>
              <Text style={styles.helpDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Pressable style={styles.contactBtn}>
            <Ionicons name="call-outline" size={20} color={PRIMARY} />
            <Text style={styles.contactBtnText}>Call Support</Text>
          </Pressable>
          <Pressable style={styles.contactBtn}>
            <Ionicons name="mail-outline" size={20} color={PRIMARY} />
            <Text style={styles.contactBtnText}>Email Support</Text>
          </Pressable>
        </View>

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
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${PRIMARY}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  helpContent: { flex: 1 },
  helpLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  helpDesc: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  contactSection: { marginTop: 16 },
  contactTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  contactBtnText: { fontSize: 15, color: PRIMARY, fontWeight: "600" },
});