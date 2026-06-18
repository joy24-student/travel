import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuth } from "../hooks/useAuth";
import { useLoyaltyAccount } from "../hooks/useLoyaltySupport";
import { destinationFinderService } from "../services/ai";
import { supabase } from "../utils/supabase";
import { AiPill, BottomNav } from "./Navigation";

const TRIP_BLUE = "#0055F2";
const TRIP_LIGHT_BLUE = "#EAF2FF";
const TRIP_PINK = "#FFF0F3";
const TRIP_TEXT_DARK = "#333333";
const ACCENT_YELLOW = "#facc15";
const PRIMARY = TRIP_BLUE;
const ACCENT = ACCENT_YELLOW;

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const REFRESH_THRESHOLD = 110;
const REFRESH_MAX_PULL = 170;
const REFRESH_LOCK_HEIGHT = 112;
const SEARCH_STICKY_TRIGGER = 20;

const elasticPullDistance = (distance: number) =>
  Math.min(REFRESH_MAX_PULL, distance / (1 + distance / 320));

const TRENDING_DEFAULT = [
  {
    name: "North\nAmerica",
    tag: "Explore",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1YgCqAM1GLl4LkclUwZanP81m-mBUnFyNdVYP8sCHCoJJZYfMRijq1jZGABa_cUTBf0axXLSu5Kic9daI9JoER0T87XxF8FVUDAfEsd3reSujt8C8kPGBSfViR1sd6rn09V4HEJb3kreVnwC1MFBS9cKJZgwnmbf5gCG9J3y3kIEnaWQyVUyq0oJgPHrlblXcr_wZHUXc9bT3GTwIduju8AVEPpH8xk-8-zMIQTVVi2DpSBkUm3av38YxeBjxFj2cuwnYeNxvkzE",
    deal: "Travel deals up to 50% OFF",
  },
];

const FLASH_DEALS_DEFAULT = [
  {
    id: "fd1",
    title: "Cox's Bazar 3N/4D",
    original: "৳8,000",
    discounted: "৳5,500",
    tag: "31% OFF",
    durationMinutes: 150,
  },
  {
    id: "fd2",
    title: "Bangkok Package 5D",
    original: "$650",
    discounted: "$420",
    tag: "35% OFF",
    durationMinutes: 255,
  },
  {
    id: "fd3",
    title: "Sylhet Weekend",
    original: "৳4,500",
    discounted: "৳2,800",
    tag: "38% OFF",
    durationMinutes: 105,
  },
];

const formatTimeLeft = (endTime: number, now: number) => {
  const diff = Math.max(0, endTime - now);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (diff <= 0) return "Expired";

  return `${hours}h ${minutes}m ${seconds}s`;
};

const AGENCIES_DEFAULT = [
  { name: "Shopno Tours", rating: 4.8, packages: 42, verified: true },
  { name: "Dhaka Travels", rating: 4.6, packages: 31, verified: true },
  { name: "BD Explorer", rating: 4.5, packages: 28, verified: false },
];

const WEEKEND_DEFAULT = [
  {
    title: "Tea Garden Escape",
    duration: "2D 1N",
    price: "৳2,500",
    img: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=300",
  },
  {
    title: "Lakeside Weekend",
    duration: "2D 1N",
    price: "৳3,000",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
  },
];

const TAGS_DEFAULT = ["Beijing", "Shanghai", "Kuala Lumpur", "Seoul"];

const QUICK_ACTIONS = [
  { label: "Deals", icon: "pricetag-outline" },
  { label: "Events", icon: "calendar-outline" },
  { label: "Trip.Planner", icon: "flash-outline" },
  { label: "Trending", icon: "trending-up-outline" },
];

export function HomeScreen() {
  const { user } = useAuth();
  const { account } = useLoyaltyAccount(user?.id);
  const [search, setSearch] = useState("");
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const [trending, setTrending] = useState(TRENDING_DEFAULT);
  const [flashDeals, setFlashDeals] = useState(FLASH_DEALS_DEFAULT);
  const [agencies, setAgencies] = useState(AGENCIES_DEFAULT);
  const [weekend, setWeekend] = useState(WEEKEND_DEFAULT);
  const [tags, setTags] = useState(TAGS_DEFAULT);
  const [loadingData, setLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll position to toggle Home/Top button
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 150) {
        if (!isScrolled) setIsScrolled(true);
      } else {
        if (isScrolled) setIsScrolled(false);
      }
    });
    return () => scrollY.removeListener(listenerId);
  }, [isScrolled]);
  const [isArmed, setIsArmed] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const pullDistance = useRef(new Animated.Value(0)).current;
  const spinnerRotate = useRef(new Animated.Value(0)).current;
  const gradientPulse = useRef(new Animated.Value(0)).current;
  const isAtTopRef = useRef(true);
  const isArmedRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const currentPullDistance = useRef(0); // To track pullDistance's actual value
  const triggerRefreshRef = useRef<() => Promise<void>>(async () => undefined);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const isWeb = Platform.OS === "web";

  // Header Scroll Transitions
  const headerBg = useMemo(() => scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [TRIP_BLUE, "#ffffff"],
    extrapolate: "clamp",
  }), [scrollY]);

  const headerContentColor = useMemo(() => scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: ["#ffffff", TRIP_BLUE],
    extrapolate: "clamp",
  }), [scrollY]);

  const pillBg = useMemo(() => scrollY.interpolate({
    inputRange: [0, 10],
    outputRange: ["rgba(255,255,255,0.2)", "rgba(0,85,242,0.06)"],
    extrapolate: "clamp",
  }), [scrollY]);

  const pillBorder = useMemo(() => scrollY.interpolate({
    inputRange: [0, 10],
    outputRange: ["rgba(255,255,255,0.3)", "rgba(0,85,242,0.12)"],
    extrapolate: "clamp",
  }), [scrollY]);

  const loadHomeData = useCallback(async () => {
    try {
      setLoadingData(true);

      // Fetch dynamic promotions
      const { data: deals } = await supabase
        .from("promotions")
        .select("*")
        .eq("status", "active")
        .order("discount_percentage", { ascending: false })
        .limit(3);

      if (deals && deals.length > 0) {
        setFlashDeals(deals.map((d: any) => ({
          id: d.id,
          title: d.title,
          original: d.original_price ? `$${d.original_price}` : d.title,
          discounted: d.discounted_price ? `$${d.discounted_price}` : d.title,
          tag: `${d.discount_percentage || 0}% OFF`,
          durationMinutes: d.duration_minutes || 150,
        })));
      }

      // Fetch trending destinations
      const { data: trendingDest } = await supabase
        .from("destinations")
        .select("*")
        .eq("is_trending", true)
        .limit(1);

      if (trendingDest && trendingDest.length > 0) {
        setTrending(trendingDest.map((d: any) => ({
          name: d.name,
          tag: "Trending",
          img: d.image_url || TRENDING_DEFAULT[0].img,
          deal: d.promotion_text || "Travel deals up to 50% OFF",
        })));
      }

      // Fetch popular tags
      const { data: destTags } = await supabase
        .from("destinations")
        .select("name")
        .eq("is_popular", true)
        .limit(6);

      if (destTags && destTags.length > 0) {
        setTags(destTags.map((d: any) => d.name));
      }

      // Fetch verified agencies
      const { data: agenciesData } = await supabase
        .from("agencies")
        .select("*")
        .eq("is_verified", true)
        .order("rating", { ascending: false })
        .limit(3);

      if (agenciesData && agenciesData.length > 0) {
        setAgencies(agenciesData.map((a: any) => ({
          name: a.name,
          rating: a.rating || 4.5,
          packages: a.packages_count || 0,
          verified: true,
        })));
      }
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setIsArmed(false);
    isArmedRef.current = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.spring(pullDistance, {
      toValue: REFRESH_LOCK_HEIGHT,
      useNativeDriver: false,
      tension: 180,
      friction: 12,
    }).start();

    await loadHomeData();
    await new Promise(resolve => setTimeout(resolve, 300));

    isRefreshingRef.current = false;
    setIsRefreshing(false);

    Animated.spring(pullDistance, {
      toValue: 0,
      useNativeDriver: false,
      tension: 140,
      friction: 10,
    }).start();
  }, [loadHomeData]);

  useEffect(() => {
    triggerRefreshRef.current = triggerRefresh;
  }, [triggerRefresh]);

  useEffect(() => {
    isArmedRef.current = isArmed;
  }, [isArmed]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    if (isWeb || !isRefreshing) {
      spinnerRotate.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(spinnerRotate, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [isRefreshing]);

  useEffect(() => {
    if (isWeb || (!isArmed && !isRefreshing)) {
      gradientPulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(gradientPulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(gradientPulse, {
          toValue: 0,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [isArmed, isRefreshing]);

  // Listener for pullDistance to update currentPullDistance ref
  useEffect(() => {
    const id = pullDistance.addListener(({ value }) => {
      currentPullDistance.current = value;
    });
    return () => pullDistance.removeListener(id);
  }, [pullDistance]);

  // PanResponder for custom pull-to-refresh gesture handling
  const panResponder = useRef(
    PanResponder.create({
      // We don't want to claim the responder on initial touch, only on move
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Enterprise-grade sensitivity: Capture only when at top, pulling down, and move is primarily vertical
        const shouldSet = !isRefreshingRef.current && isAtTopRef.current && dy > 8 && Math.abs(dy) > Math.abs(dx);
        if (shouldSet) console.log("[PullToRefresh] onMoveShouldSetPanResponder: Claiming gesture. dy:", dy, "dx:", dx);
        return shouldSet;
      },
      // Crucial: Capture move events to prevent ScrollView from stealing the responder
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const shouldCapture = !isRefreshingRef.current && isAtTopRef.current && dy > 8 && Math.abs(dy) > Math.abs(dx);
        if (shouldCapture) console.log("[PullToRefresh] onMoveShouldSetPanResponderCapture: Capturing gesture. dy:", dy, "dx:", dx);
        return shouldCapture;
      },
      onPanResponderGrant: () => {
        console.log("[PullToRefresh] Responder Granted");
        pullDistance.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isRefreshingRef.current || !isAtTopRef.current) return;

        // Apply elastic effect to the pull distance
        const nextDistance = elasticPullDistance(Math.max(0, gestureState.dy));
        pullDistance.setValue(nextDistance);

        // Trigger haptic feedback and arm the refresh state if threshold is met
        if (nextDistance >= REFRESH_THRESHOLD && !isArmedRef.current) {
          isArmedRef.current = true;
          setIsArmed(true);
          console.log("[PullToRefresh] Refresh Armed!");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // The "Buzz" threshold
        } else if (nextDistance < REFRESH_THRESHOLD && isArmedRef.current) {
          isArmedRef.current = false;
          setIsArmed(false);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        console.log("[PullToRefresh] Gesture Released. Final dy:", gestureState.dy);
        if (isRefreshingRef.current) return;
        
        // Calculate final pull distance after release
        const nextDistance = elasticPullDistance(Math.max(0, gestureState.dy));

        if (nextDistance >= REFRESH_THRESHOLD) {
          console.log("[PullToRefresh] Threshold Met: Triggering Refresh");
          // If threshold met, trigger the refresh
          triggerRefreshRef.current();
          return;
        }

        isArmedRef.current = false;
        setIsArmed(false);
        Animated.spring(pullDistance, {
          toValue: 0, // Bounce back to 0 if not refreshing
          useNativeDriver: false,
          tension: 260,
          friction: 9,
        }).start();
        console.log("[PullToRefresh] Bouncing back to 0.");
      },
      onPanResponderTerminate: () => {
        console.log("[PullToRefresh] Gesture Terminated unexpectedly.");
        // Handle cases where gesture is interrupted (e.g., app goes to background)
        if (!isRefreshingRef.current) {
          isArmedRef.current = false;
          setIsArmed(false);
          Animated.spring(pullDistance, {
            toValue: 0,
            useNativeDriver: false,
            tension: 150,
            friction: 10,
          }).start();
          console.log("[PullToRefresh] Terminated: Bouncing back to 0.");
        }
      },
    })
  ).current;

  const pullProgress = useMemo(() => pullDistance.interpolate({
    inputRange: [0, REFRESH_MAX_PULL],
    outputRange: [0, 1],
    extrapolate: "clamp",
  }), [pullDistance]);

  const refreshOpacity = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 0.65, 1],
    extrapolate: "clamp",
  }), [pullProgress]);

  const refreshScale = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 0.6, 0.9, 1],
    outputRange: [0.8, 1.1, 1.05, 1.1],
    extrapolate: "clamp",
  }), [pullProgress]);

  const earthRotate = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "540deg"],
  }), [pullProgress]);

  const busTranslateX = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-110, 110],
    extrapolate: "clamp",
  }), [pullProgress]);

  const planeTranslateY = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [55, -35, 20],
    extrapolate: "clamp",
  }), [pullProgress]);

  const scholarshipTranslateY = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [55, -22, -8],
    extrapolate: "clamp",
  }), [pullProgress]);

  const scholarshipScale = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 0.75, 1],
    outputRange: [0.75, 1.18, 1],
    extrapolate: "clamp",
  }), [pullProgress]);

  const scholarshipOpacity = useMemo(() => pullProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  }), [pullProgress]);

  const gradientPulseOpacity = useMemo(() => gradientPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.22],
    extrapolate: "clamp",
  }), [gradientPulse]);

  const spinnerRotateProgress = useMemo(() => spinnerRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  }), [spinnerRotate]);

  const spinnerTransform = useMemo(() => [
    { rotate: spinnerRotateProgress },
  ], [spinnerRotateProgress]);

  const searchStickyProgress = useMemo(() => scrollY.interpolate({
    inputRange: [0, SEARCH_STICKY_TRIGGER],
    outputRange: [0, 1],
    extrapolate: "clamp",
  }), [scrollY]);

  const searchBackground = useMemo(() => searchStickyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#FFFFFF"],
    extrapolate: "clamp",
  }), [searchStickyProgress]);

  const searchBorderColor = useMemo(() => searchStickyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#E5E7EB"],
    extrapolate: "clamp",
  }), [searchStickyProgress]);

  const searchIconColor = useMemo(() => searchStickyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [TRIP_BLUE, TRIP_BLUE],
    extrapolate: "clamp",
  }), [searchStickyProgress]);

  const searchPlaceholderColor = useMemo(() => searchStickyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#94A3B8", "#94A3B8"],
    extrapolate: "clamp",
  }), [searchStickyProgress]);

  const searchShadowOpacity = useMemo(() => searchStickyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
    extrapolate: "clamp",
  }), [searchStickyProgress]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Countdown Timer Logic
  const [now, setNow] = useState(Date.now());

  return (
    <SafeAreaView style={s.shell}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        pointerEvents="none"
        style={isWeb ? [s.refreshContainer, { height: 0, opacity: 0 }] : [s.refreshContainer, { height: pullDistance, opacity: refreshOpacity }]}
      >
        <LinearGradient
          colors={isRefreshing ? ["#0f172a", "#0055F2", "#00C6FF"] : isArmed ? ["#00C6FF", "#0072FF"] : ["#F0F7FF", "#FFFFFF"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: TRIP_BLUE, opacity: isWeb ? 0 : gradientPulseOpacity }]} />
        <Animated.View style={[s.refreshContent, { transform: isWeb ? undefined : [{ scale: refreshScale }] }]}>
          {isRefreshing ? (
            <>
              <Animated.View style={{ transform: spinnerTransform, marginBottom: 12 }}>
                <Ionicons name="earth-outline" size={34} color="#fff" />
              </Animated.View>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[s.refreshText, { color: "#fff", marginTop: 8 }]}>Syncing your world...</Text>
            </>
          ) : (
            <>
              <Animated.View style={{ transform: [{ rotate: earthRotate }] }}>
                <Ionicons name="earth-outline" size={34} color={isArmed ? "#fff" : TRIP_BLUE} />
              </Animated.View>

              <View style={s.animationTrack}>
                <Animated.View style={{ transform: [{ translateX: busTranslateX }] }}>
                  <Ionicons name="bus" size={20} color={isArmed ? "#fff" : "#6366f1"} />
                </Animated.View>
                <Animated.View style={{ transform: [{ translateY: planeTranslateY }, { rotate: "-45deg" }] }}>
                  <Ionicons name="airplane-outline" size={22} color={isArmed ? "#fff" : "#0ea5e9"} />
                </Animated.View>
                <Animated.View
                  style={[
                    s.scholarshipBubble,
                    {
                      opacity: scholarshipOpacity,
                      transform: [{ translateY: scholarshipTranslateY }, { scale: scholarshipScale }],
                    },
                  ]}
                >
                  <Ionicons name="school" size={18} color={isArmed ? "#fff" : "#f59e0b"} />
                  <Text style={[s.scholarshipText, { color: isArmed ? "#fff" : TRIP_TEXT_DARK }]}>Scholarship</Text>
                </Animated.View>
              </View>

              <Text style={[s.refreshText, { color: isArmed ? "#fff" : TRIP_BLUE }]}>
                {isArmed ? "Release to refresh" : "Pull for your next journey"}
              </Text>
            </>
          )}
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        {...panResponder.panHandlers} // Attach PanResponder to the ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isWeb ? s.scroll : [s.scroll, { paddingTop: pullDistance }]}
        onScroll={(event) => {
          scrollY.setValue(event.nativeEvent.contentOffset.y);
        }}
        scrollEnabled={!isRefreshing} // Lock scroll while refreshing
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        stickyHeaderHiddenOnScroll={false}
      >
        {/* Section 0: Header + Grids */}
        <View>
          <Animated.View style={isWeb ? s.header : [s.header, { backgroundColor: headerBg }]}>
            <Text style={s.headerSpacer} />
            <Animated.Text style={[s.headerLogo, { color: isWeb ? "#ffffff" : headerContentColor }]}>Trip.com</Animated.Text>
            <View style={s.headerRight}>
              <Pressable onPress={() => router.push("/screens/rewards")}>
                <Animated.View style={[s.tierPill, isWeb ? null : { backgroundColor: pillBg, borderColor: pillBorder }]}>
                  <View style={s.tierTIcon}><Text style={s.tierTText}>T</Text></View>
                  <Animated.Text style={[s.tierText, { color: isWeb ? "#ffffff" : headerContentColor }]}>Silver</Animated.Text>
                </Animated.View>
              </Pressable>
              <Pressable style={s.avatarCircle} onPress={() => router.push("/(tabs)/account")}>
                <Text style={s.avatarT}>T</Text>
              </Pressable>
            </View>
          </Animated.View>

          <View style={s.mainContainer}>
          {/* Primary Service Grid */}
          <View style={s.primaryGrid}>
            {[
              { label: "Hotels", icon: "bed-outline", route: "/screens/search-stays" },
              { label: "Flights", icon: "airplane-outline", route: "/screens/flights" },
              { label: "Flight + Hotel", icon: "business-outline", route: "/screens/packages" },
              { label: "Trains", icon: "train-outline", route: "/screens/trains" },
            ].map((item) => (
              <Pressable 
                key={item.label} 
                style={s.primaryItem} 
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View style={s.primaryIconCircle}>
                  <Ionicons name={item.icon as any} size={30} color={TRIP_BLUE} />
                </View>
                <Text style={s.primaryLabel} numberOfLines={2}>
                  {item.label}<Text style={{ color: ACCENT_YELLOW }}>.</Text>
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Secondary Small Grid */}
          <View style={s.secondaryGrid}>
            {[
              { label: "Vacation\nRentals", icon: "home", route: "/screens/search-stays" },
              { label: "Attractions\n& Tours", icon: "people", route: "/screens/recommended-tours" },
              { label: "Car Rentals", icon: "car", route: "/screens/search" },
              { label: "Package\nTours", icon: "earth", route: "/screens/packages" },
              { label: "+7 more", icon: "grid", isMore: true, route: "/screens/search" },
            ].map((item, i) => (
              <Pressable
                key={i}
                style={s.secondaryItem}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View style={s.secondaryIconWrapper}>
                  <View style={item.isMore ? s.moreIconBg : null}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={item.isMore ? 14 : 22} 
                      color={item.isMore ? "#fff" : TRIP_BLUE} 
                    />
                  </View>
                </View>
                <Text style={s.secondaryLabel} numberOfLines={2}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Section 1: Sticky SearchBar */}
        <Animated.View
          style={
            isWeb
              ? [s.stickySearchWrapper, { backgroundColor: '#fff' }]
              : [
                  s.stickySearchWrapper,
                  {
                    backgroundColor: searchBackground as any,
                    shadowOpacity: searchShadowOpacity,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  },
                ]
          }
        >
          <Animated.View style={[s.searchContainer, !isWeb && { borderColor: searchBorderColor as any }]}>
            <View style={s.searchInner}>
              <AnimatedIonicons name="location" size={18} color={searchIconColor as any} />
              <Animated.Text style={[s.searchPlaceholder, { color: searchPlaceholderColor as any }]}>Rome</Animated.Text>
            </View>
            <Pressable style={s.searchCircleBtn}>
              <Ionicons name="search" size={18} color="#fff" />
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Section 2: Rest of Content */}
        <View style={{ backgroundColor: '#fff' }}>
          {/* TagScroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tagContainer}>
            {tags.map(tag => (
              <View key={tag} style={s.tagPill}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
            <View style={s.mapAction}>
              <Ionicons name="map" size={16} color={TRIP_BLUE} />
              <Text style={s.mapText}>Map</Text>
            </View>
          </ScrollView>

          {/* QuickActions */}
          <View style={s.quickActionsRow}>
            {QUICK_ACTIONS.map(action => (
              <View key={action.label} style={s.actionItem}>
                <View style={s.actionIconBox}>
                  <Ionicons name={action.icon as any} size={22} color={TRIP_BLUE} />
                </View>
                <Text style={s.actionLabel}>{action.label}</Text>
              </View>
            ))}
          </View>

          {/* PromoBanner */}
          <View style={s.promoSection}>
            <View style={s.promoCardHeader}>
              <View style={s.promoHeaderLeft}>
                <Text style={s.giftIcon}>🎁</Text>
                <Text style={s.promoTitle}>New User Discounts Available</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.promoList}>
              <PromoCoupon discount="10% off" icon="bed" />
              <PromoCoupon discount="5% off" icon="airplane" />
            </ScrollView>
          </View>

          {/* Destination Grid */}
          <View style={s.destGrid}>
            {/* Card 1: Hero */}
            <View style={s.destHeroCard}>
              <Image source={{ uri: trending[0]?.img }} style={s.destHeroImg} />
              <View style={s.destHeroOverlay}>
                <Text style={s.destHeroTag}>{trending[0]?.tag}</Text>
                <Text style={s.destHeroTitle}>{trending[0]?.name}</Text>
              </View>
              <View style={s.destHeroFooter}>
                <View style={s.dealPill}>
                  <Text style={s.dealPillText}>{trending[0]?.deal} <Text style={{ color: ACCENT_YELLOW }}></Text></Text>
                </View>
                <Pressable style={s.viewDealsBtn}>
                  <Text style={s.viewDealsText}>View Deals</Text>
                </Pressable>
                <Text style={s.tncText}>*T&Cs apply. Subject to availability.</Text>
              </View>
              <View style={s.countBadge}><Text style={s.countText}>8/11</Text></View>
            </View>

            {/* Card 2: Dhaka AI */}
            <View style={s.destSmallCard}>
              <Image 
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqqF0klhUwsxJFYPz4bLHT8GPTOJiI8rohWPgTLM2SeWzL8PFImvY7udmRDs7JdI4AsuPDTfUqsKjVKcdZA0AwrSfJSqEML0Lky0ieFA2MDHYmVKnNMWwyatZkMY5XA0xExPf7z13aqb92X73UVPOU7xuSb1DYKMau9v8XunwKe7mURYdW0cqUvfMR3NKcpEFwgqysMlcIaJiCOcsnRqICiYvMEJTGsgOlUGaZPdGNsoFNCIYMqS2k37Guc-rmZu5ESOt-UQKjyxg" }} 
                style={s.destSmallImg} 
              />
              <View style={s.destSmallContent}>
                <Text style={s.destSmallTitle}>3-day classic trip in Dhaka</Text>
                <View style={s.plannerRow}>
                  <Ionicons name="flash" size={12} color={TRIP_BLUE} />
                  <Text style={s.plannerText}>Trip.Planner</Text>
                </View>
                <Pressable style={s.aiBtn}>
                  <Text style={s.aiBtnText}>Create itinerary with AI</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <AiPill color={TRIP_BLUE} />
      <BottomNav 
        active="Home" 
        color={TRIP_BLUE} 
        isScrolled={isScrolled}
        onScrollToTop={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </SafeAreaView>
  );
}

function PromoCoupon({ discount, icon }: { discount: string; icon: string }) {
  return (
    <View style={s.promoCard}>
      <Ionicons name={icon as any} size={24} color="#f43f5e" style={s.promoIcon} />
      <View>
        <Text style={s.promoDiscount}>{discount}</Text>
        <Text style={s.promoUse}>Use <Ionicons name="chevron-forward" size={10} /></Text>
      </View>
      <View style={s.perforated} />
    </View>
  );
}

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f9fafb" },
  scroll: { paddingBottom: 20, zIndex: 1 },
  header: { 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    zIndex: 3
  },
  headerLogo: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierPill: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  tierTIcon: { width: 16, height: 16, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tierTText: { color: TRIP_BLUE, fontSize: 10, fontWeight: '900' },
  tierText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  avatarCircle: { width: 24, height: 24, backgroundColor: ACCENT_YELLOW, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarT: { color: '#fff', fontSize: 12, fontWeight: '900' },

  refreshContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 2,
  },
  refreshContent: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20, gap: 4 }, // Push content to bottom
  refreshText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  animationTrack: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 28, overflow: 'hidden' },
  scholarshipBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.28)',
  },
  scholarshipText: { fontSize: 10, fontWeight: '900' },

  mainContainer: { 
    marginTop: -16, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28,
    paddingTop: 4
  },
  primaryGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  primaryItem: { width: '22%', alignItems: 'center' },
  primaryIconCircle: { 
    width: 52, 
    height: 52, 
    backgroundColor: '#E8F1FF', 
    borderRadius: 26, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  primaryLabel: { fontSize: 11, fontWeight: '800', color: TRIP_BLUE, textAlign: 'center', lineHeight: 13 },

  secondaryGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  secondaryItem: { width: '18%', alignItems: 'center' },
  secondaryIconWrapper: { height: 28, alignItems: 'center', justifyContent: 'center' },
  secondaryLabel: { fontSize: 10, textAlign: 'center', fontWeight: '600', color: '#4b5563', marginTop: 6, lineHeight: 12, height: 24 },
  moreIconBg: { backgroundColor: TRIP_BLUE, borderRadius: 8, padding: 4 },

  stickySearchWrapper: {
    height: 56,
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    zIndex: 4,
  },
  searchContainer: { 
    width: '100%',
    height: 48, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 4,
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  searchInner: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, gap: 8 },
  searchPlaceholder: { fontSize: 15, fontWeight: '600' },
  searchCircleBtn: { backgroundColor: TRIP_BLUE, width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  tagContainer: { paddingHorizontal: 16, gap: 8, marginVertical: 16 },
  tagPill: { backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  mapAction: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  mapText: { color: TRIP_BLUE, fontWeight: '700', fontSize: 14 },

  headerSpacer: { position: 'absolute', top: -9999, left: -9999 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
  actionItem: { alignItems: 'center', width: '22%' },
  actionIconBox: { width: 48, height: 48, backgroundColor: '#f0f7ff', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '700' },

  promoSection: { marginHorizontal: 16, marginBottom: 20 },
  promoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  promoHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  giftIcon: { fontSize: 18 },
  promoTitle: { fontSize: 14, fontWeight: '800' },
  promoList: { gap: 12 },
  promoCard: { 
    backgroundColor: TRIP_PINK, 
    width: 180, 
    padding: 12, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    borderWidth: 1,
    borderColor: '#fee2e2'
  },
  promoIcon: { marginRight: 4 },
  promoDiscount: { color: '#e11d48', fontWeight: '900', fontSize: 16 },
  promoUse: { color: '#fb7185', fontSize: 12, fontWeight: '800' },
  perforated: { position: 'absolute', right: -3, top: '50%', marginTop: -6, width: 6, height: 12, backgroundColor: '#fff', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },

  destGrid: { paddingHorizontal: 16, flexDirection: 'row', gap: 12 },
  destHeroCard: { flex: 1, height: 260, borderRadius: 16, overflow: 'hidden' },
  destHeroImg: { width: '100%', height: '100%' },
  destHeroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', padding: 12 },
  destHeroTag: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  destHeroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  destHeroFooter: { position: 'absolute', bottom: 12, left: 0, right: 0 },
  dealPill: { backgroundColor: 'rgba(37,99,235,0.9)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderTopRightRadius: 20, borderBottomRightRadius: 20, marginBottom: 8 },
  dealPillText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  viewDealsBtn: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 20, paddingVertical: 8, alignItems: 'center' },
  viewDealsText: { color: TRIP_BLUE, fontSize: 12, fontWeight: '900' },
  tncText: { color: 'rgba(255,255,255,0.6)', fontSize: 8, textAlign: 'center', marginTop: 4 },
  countBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  countText: { color: '#fff', fontSize: 10 },

  destSmallCard: { flex: 1, height: 260, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2 },
  destSmallImg: { width: '100%', height: 120 },
  destSmallContent: { padding: 10, flex: 1, justifyContent: 'space-between' },
  destSmallTitle: { fontSize: 13, fontWeight: '800' },
  plannerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  plannerText: { color: TRIP_BLUE, fontWeight: '900', fontSize: 12 },
  aiBtn: { backgroundColor: '#2563eb', borderRadius: 4, paddingVertical: 6, alignItems: 'center' },
  aiBtnText: { color: '#fff', fontSize: 10, fontWeight: '900' },
});
