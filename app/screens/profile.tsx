import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/hooks/useAuth";
import { BottomNav, AiPill } from "../../src/screens/Navigation";
import type { UIScreen } from "../../src/data/screens";

const PRIMARY = "#287dfa";

export default function ProfileScreen() {
  const { user } = useAuth();

  const profileScreen: UIScreen = {
    slug: "profile",
    source: "profile/main",
    title: "Profile",
    subtitle: "Manage your personal information and preferences",
    kind: "account",
    theme: "trip",
    activeTab: "Account",
  };

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={PRIMARY} />
          </View>
          <Text style={styles.userName}>{user?.email?.split("@")[0] || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {[
            { icon: "person-outline", label: "Full Name", value: user?.email?.split("@")[0] || "Not set" },
            { icon: "mail-outline", label: "Email", value: user?.email || "Not set" },
            { icon: "call-outline", label: "Phone", value: "Not set" },
            { icon: "location-outline", label: "Location", value: "Not set" },
          ].map((item) => (
            <Pressable key={item.label} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color={PRIMARY} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuValue}>{item.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          ))}
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
  avatarSection: { alignItems: "center", paddingVertical: 24, gap: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${PRIMARY}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: { fontSize: 22, fontWeight: "700", color: "#111827" },
  userEmail: { fontSize: 14, color: "#6b7280" },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${PRIMARY}12`, alignItems: "center", justifyContent: "center", marginRight: 12 },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  menuValue: { fontSize: 13, color: "#6b7280", marginTop: 2 },
});