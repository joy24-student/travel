import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { label: "Home", icon: "home-outline" as const, route: "/(tabs)/" },
  {
    label: "Messages",
    icon: "chatbubble-ellipses-outline" as const,
    route: "/(tabs)/messages",
  },
  { label: "Post", icon: "add-circle-outline" as const, route: "/(tabs)/post" },
  {
    label: "My Trips",
    icon: "receipt-outline" as const,
    route: "/(tabs)/trips",
  },
  {
    label: "Account",
    icon: "person-outline" as const,
    route: "/(tabs)/account",
  },
] as const;

// ─── AiPill ────────────────────────────────────────────────────────────────────
export function AiPill({ color }: { color: string }) {
  return (
    <View style={styles.aiWrap} pointerEvents="box-none">
      <Pressable
        style={styles.aiPill}
        onPress={() => router.push("/screens/ai-assistant" as any)}
      >
        <View style={[styles.aiDot, { backgroundColor: color }]} />
        <Text style={styles.aiText}>Ask AI or hold to speak</Text>
        <Ionicons name="mic-outline" size={16} color={color} />
      </Pressable>
    </View>
  );
}

// ─── BottomNav ─────────────────────────────────────────────────────────────────
export function BottomNav({
  active,
  color,
}: {
  active: string;
  color: string;
}) {
  return (
    <View style={styles.bottomNav}>
      {TABS.map((tab) => {
        const selected = tab.label === active;
        return (
          <Pressable
            key={tab.label}
            style={styles.bottomItem}
            onPress={() => router.push(tab.route as any)}
            hitSlop={8}
          >
            <Ionicons
              name={tab.icon}
              size={selected ? 24 : 22}
              color={selected ? color : "#9ca3af"}
            />
            <Text
              style={[
                styles.bottomLabel,
                { color: selected ? color : "#6b7280" },
              ]}
            >
              {tab.label}
            </Text>
            {selected && (
              <View style={[styles.activeBar, { backgroundColor: color }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  aiWrap: {
    alignItems: "center",
    bottom: 78,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 10,
  },
  aiPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderColor: "#dbeafe",
    borderRadius: 999,
    borderWidth: 1,
    elevation: 6,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  aiDot: { borderRadius: 999, height: 8, width: 8 },
  aiText: { color: "#333", fontSize: 13, fontWeight: "800" },
  bottomNav: {
    backgroundColor: "#fff",
    borderTopColor: "#eef2f7",
    borderTopWidth: 1,
    bottom: 0,
    elevation: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    paddingBottom: 20,
    paddingTop: 8,
    position: "absolute",
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  bottomItem: {
    alignItems: "center",
    flex: 1,
    gap: 2,
    position: "relative",
    paddingTop: 4,
  },
  bottomLabel: { fontSize: 10, fontWeight: "700" },
  activeBar: {
    bottom: -8,
    borderRadius: 999,
    height: 3,
    position: "absolute",
    width: 20,
  },
});
