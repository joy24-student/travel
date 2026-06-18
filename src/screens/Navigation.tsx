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
    label: "Explore",
    icon: "map-outline" as const,
    route: "/screens/explore",
  },
  {
    label: "Messages",
    icon: "chatbubble-ellipses-outline" as const,
    route: "/(tabs)/messages",
  },
  { label: "Post", icon: "add-circle-outline" as const, route: "/(tabs)/post" },
  {
    label: "Account",
    icon: "person-outline" as const,
    route: "/(tabs)/account",
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
    [insets.bottom],
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
  isScrolled,
  onScrollToTop,
}: {
  active: string;
  color: string;
  isScrolled?: boolean;
  onScrollToTop?: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabWidth = (width - 40) / TABS.length;
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
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 4 }]}>
        <View style={styles.tabWrapper}>
          {/* Animated Indicator (Simplified for full-width) */}
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
                { backgroundColor: color + "12", borderColor: color + "20" },
              ]}
            >
            {/* The sliding yellow active indicator dot */}
            <View style={styles.notificationDot} />
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
              isScrolled={isScrolled}
              onScrollToTop={onScrollToTop}
            />
          );
        })}
        </View>
        {/* Home Indicator Simulator extracted from code.html */}
        <View style={styles.homeIndicator} />
      </View>
    </Animated.View>
  );
}

// ─── Tab Item Component ─────────────────────────────────────────────────────────
interface TabItemProps {
  tab: (typeof TABS)[number];
  selected: boolean;
  color: string;
  isScrolled?: boolean;
  onScrollToTop?: () => void;
}

function TabItem({ tab, selected, color, isScrolled, onScrollToTop }: TabItemProps) {
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

  // Morph logic for Home -> Top button
  const isHomeTab = tab.label === "Home";
  const displayLabel = (isHomeTab && isScrolled) ? "Top" : tab.label;
  const displayIcon = (isHomeTab && isScrolled) ? "arrow-up-circle-outline" : tab.icon;

  const handlePress = () => {
    if (isHomeTab && isScrolled && onScrollToTop) {
      onScrollToTop();
    } else {
      if (tab.route.startsWith("/screens")) {
         router.push(tab.route as any);
      } else {
         router.replace(tab.route as any);
      }
    }
  };

  return (
    <Pressable
      style={styles.bottomItem}
      onPress={handlePress}
      hitSlop={12}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
          gap: 2,
        }}
      >
        <View style={{ position: 'relative' }}>
          <Animated.Text style={{ color: animatedColor }}>
            <Ionicons
              name={displayIcon as any}
              size={22}
              color={selected ? color : "#9ca3af"}
            />
          </Animated.Text>
        </View>
        <Text
          style={[
            styles.bottomLabel,
            {
              color: selected ? color : "#6b7280",
              fontWeight: selected ? "700" : "600",
              fontSize: selected || (isHomeTab && isScrolled) ? 11 : 10,
            },
          ]}
        >
          {displayLabel}
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
    left: 0,
    right: 0,
    bottom: 0,
    position: "absolute",
    zIndex: 999,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  bottomNav: {
    flex: 1,
    backgroundColor: "#ffffff",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
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
  tabWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 64,
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
    paddingHorizontal: 4,
    left: 8,
  },
  indicatorInner: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(40, 125, 250, 0.2)",
  },
  activeBar: {
    height: 3,
    width: 22,
    borderRadius: 999,
    position: 'absolute',
    bottom: 6,
    shadowColor: "#287dfa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    left: "50%",
    marginLeft: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FACC15", // Stylish Yellow-400
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  homeIndicator: {
    height: 4,
    backgroundColor: "#E5E7EB",
    width: "33%",
    alignSelf: "center",
    marginBottom: 8,
    borderRadius: 2,
  },
});
