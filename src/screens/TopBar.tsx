import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import type { UIScreen } from "../data/screens";

const themeMap = {
  trip: {
    bg: "#f5f7fa",
    primary: "#287dfa",
    text: "#333333",
  },
  luxe: {
    bg: "#f8f9fa",
    primary: "#000666",
    text: "#191c1d",
  },
};

export function TopBar({ screen }: { screen: UIScreen }) {
  const theme = themeMap[screen.theme];

  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
        style={styles.iconButton}
      >
        <Ionicons color={theme.text} name="chevron-back" size={22} />
      </Pressable>
      <View style={styles.topTitleWrap}>
        <Text numberOfLines={1} style={styles.sourceText}>
          {screen.source}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.topTitle, { color: theme.text }]}
        >
          {screen.title}
        </Text>
      </View>
      <View
        style={[styles.profileDot, { backgroundColor: `${theme.primary}18` }]}
      >
        <Ionicons color={theme.primary} name="ellipsis-horizontal" size={21} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomColor: "rgba(0,0,0,0.05)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#f2f4f7",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  topTitleWrap: {
    flex: 1,
  },
  sourceText: {
    color: "#98a2b3",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  profileDot: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
});
