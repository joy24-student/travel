import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  {
    label: "Agencies",
    icon: "business-outline" as const,
    route: "/(tabs)/agency",
  },
] as const;

// ─── AiPill ────────────────────────────────────────────────────────────────────
export function AiPill({ color }: { color: string }) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const aiPillBottom = useMemo(
    () => insets.bottom + 80 + 6,
    [insets.bottom]
  );

  return (
    <Animated.View
      style={[
        styles.aiWrap,
        { bottom: aiPillBottom, transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        style={({ pressed }) => [
          styles.aiPill,
          pressed && styles.aiPillPressed,
        ]}
        onPress={() => router.push("/(screens)/ai-assistant" as any)}
      >
        <View style={[styles.aiDot, { backgroundColor: color }]} />
        <Text style={styles.aiText}>Ask AI or hold to speak</Text>
        <Ionicons name="mic-outline" size={16} color={color} />
      </Pressable>
    </Animated.View>
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
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabWidth = (width - 60) / TABS.length;
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
        delay: 100,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 100,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const index = TABS.findIndex((tab) => tab.label === active);
    if (index !== -1) {
      Animated.spring(translateX, {
        toValue: index * tabWidth,
        useNativeDriver: true,
        friction: 10,
        tension: 60,
      }).start();
    }
  }, [active, tabWidth]);

  return (
    <Animated.View
      style={[
        styles.navContainer,
        {
          bottom: insets.bottom + 16,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <BlurView intensity={95} tint="light" style={styles.bottomNav}>
        <LinearGradient
          colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0.4)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        >
          <View
            style={[
              styles.indicatorInner,
              { backgroundColor: color + "15", borderColor: color + "30" },
            ]}
          >
            <View style={[styles.activeBar, { backgroundColor: color }]} />
          </View>
        </Animated.View>

        {/* Tab Items */}
        {TABS.map((tab) => {
          const selected = tab.label === active;
          return (
            <TabItem
              key={tab.label}
              tab={tab}
              selected={selected}
              color={color}
            />
          );
        })}
      </BlurView>
    </Animated.View>
  );
}

// ─── Tab Item Component ─────────────────────────────────────────────────────────
interface TabItemProps {
  tab: (typeof TABS)[number];
  selected: boolean;
  color: string;
}

function TabItem({ tab, selected, color }: TabItemProps) {
  const scaleAnim = useRef(new Animated.Value(selected ? 1.1 : 1)).current;
  const colorAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: selected ? 1.1 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }),
      Animated.timing(colorAnim, {
        toValue: selected ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [selected]);

  const animatedColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#9ca3af", color],
  });

  return (
    <Pressable
      style={styles.bottomItem}
      onPress={() => router.push(tab.route as any)}
      hitSlop={12}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
          gap: 2,
        }}
      >
        <Animated.Text style={{ color: animatedColor }}>
          <Ionicons
            name={tab.icon}
            size={22}
            color={selected ? color : "#9ca3af"}
          />
        </Animated.Text>
        <Text
          style={[
            styles.bottomLabel,
            {
              color: selected ? color : "#6b7280",
              fontWeight: selected ? "700" : "600",
              fontSize: selected ? 11 : 10,
            },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  aiWrap: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 1000,
  },
  aiPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderColor: "rgba(40, 125, 250, 0.2)",
    borderRadius: 999,
    borderWidth: 1.5,
    elevation: 8,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 22,
    paddingVertical: 13,
    shadowColor: "#287dfa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  aiPillPressed: {
    backgroundColor: "rgba(255,255,255,0.95)",
    elevation: 6,
  },
  aiDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
    shadowColor: "#287dfa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  aiText: {
    color: "#1f2937",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  navContainer: {
    left: 20,
    right: 20,
    height: 68,
    borderRadius: 36,
    position: "absolute",
    zIndex: 999,
    elevation: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  bottomNav: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  bottomItem: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    position: "relative",
    paddingVertical: 8,
    justifyContent: "center",
  },
  bottomLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  indicator: {
    position: "absolute",
    height: "100%",
    paddingVertical: 10,
    paddingHorizontal: 6,
    left: 12,
  },
  indicatorInner: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "flex-end",
    borderWidth: 0.5,
    borderColor: "rgba(40, 125, 250, 0.2)",
  },
  activeBar: {
    height: 3,
    width: 22,
    borderRadius: 999,
    marginBottom: 6,
    shadowColor: "#287dfa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
});
