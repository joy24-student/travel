import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuth } from "../hooks/useAuth";
import { useLoyaltyAccount } from "../hooks/useLoyaltySupport";
import { tripPlannerService, destinationFinderService } from "../services/ai";
import { AiPill } from "./Navigation";

const PRIMARY = "#287dfa";
const ACCENT = "#ff7d00";

const TRENDING = [
  {
    name: "Cox's Bazar",
    country: "BD",
    img: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=300",
    price: "৳3,500",
  },
  {
    name: "Sundarbans",
    country: "BD",
    img: "https://images.unsplash.com/photo-1600093112432-e3a7b6f3e4d3?w=300",
    price: "৳4,200",
  },
  {
    name: "Bangkok",
    country: "TH",
    img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=300",
    price: "$320",
  },
  {
    name: "Maldives",
    country: "MV",
    img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=300",
    price: "$850",
  },
];

const FLASH_DEALS = [
  {
    title: "Cox's Bazar 3N/4D",
    original: "৳8,000",
    discounted: "৳5,500",
    tag: "31% OFF",
    expires: "2h 30m",
  },
  {
    title: "Bangkok Package 5D",
    original: "$650",
    discounted: "$420",
    tag: "35% OFF",
    expires: "4h 15m",
  },
  {
    title: "Sylhet Weekend",
    original: "৳4,500",
    discounted: "৳2,800",
    tag: "38% OFF",
    expires: "1h 45m",
  },
];

const AGENCIES = [
  { name: "Shopno Tours", rating: 4.8, packages: 42, verified: true },
  { name: "Dhaka Travels", rating: 4.6, packages: 31, verified: true },
  { name: "BD Explorer", rating: 4.5, packages: 28, verified: false },
];

const WEEKEND = [
  {
    title: "Sylhet Tea Garden",
    duration: "2D 1N",
    price: "৳2,500",
    img: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=300",
  },
  {
    title: "Rangamati Lake",
    duration: "2D 1N",
    price: "৳3,000",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
  },
];

export function HomeScreen() {
  const { user } = useAuth();
  const { account } = useLoyaltyAccount(user?.id);
  const [search, setSearch] = useState("");
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const firstName = (user?.user_metadata?.first_name as string) ?? "Traveler";

  useEffect(() => {
    const fetchAIRecs = async () => {
      setLoadingAI(true);
      try {
        const res = await destinationFinderService.find({
          budget: 500,
          currency: "USD",
          durationDays: 5,
          interests: ["culture", "food", "beach"],
          departureCity: "Dhaka",
          travelStyle: "mid-range",
        });
        setAiRecs(
          res.data.slice(0, 3).map((d) => `${d.destination}, ${d.country}`),
        );
      } catch {
        setAiRecs(["Cox's Bazar", "Bangkok", "Bali"]);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAIRecs();
  }, []);

  return (
    <SafeAreaView style={s.shell}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Header */}
        <LinearGradient colors={["#1a56db", PRIMARY]} style={s.header}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.greeting}>Good day, {firstName} 👋</Text>
              <Text style={s.tierText}>
                {account?.tier
                  ? `${account.tier.toUpperCase()} Member`
                  : "Member"}{" "}
                · {account?.points_balance ?? 0} pts
              </Text>
            </View>
            <Pressable
              style={s.notifBtn}
              onPress={() => router.push("/screens/messages" as any)}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </Pressable>
          </View>

          {/* Search bar */}
          <View style={s.searchBar}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Where do you want to go?"
              placeholderTextColor="#aaa"
              style={s.searchInput}
            />
            <Pressable
              style={s.voiceBtn}
              onPress={() => router.push("/screens/search" as any)}
            >
              <Ionicons name="mic" size={18} color={PRIMARY} />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Service grid */}
        <View style={s.serviceGrid}>
          {[
            { label: "Flights", icon: "airplane-outline" },
            { label: "Hotels", icon: "bed-outline" },
            { label: "Tours", icon: "map-outline" },
            { label: "Trains", icon: "train-outline" },
            { label: "Packages", icon: "gift-outline" },
            { label: "Cars", icon: "car-outline" },
            { label: "Deals", icon: "pricetag-outline" },
            { label: "More", icon: "grid-outline" },
          ].map((item) => {
            const route = {
              Flights: "/screens/flights",
              Hotels: "/screens/search-stays",
              Tours: "/screens/search",
              Trains: "/screens/search",
              Packages: "/screens/packages",
              Cars: "/screens/search",
              Deals: "/screens/search",
              More: "/screens/explore",
            }[item.label];

            return (
              <Pressable
                key={item.label}
                style={s.serviceItem}
                onPress={() => route && router.push(route as any)}
              >
                <View style={s.serviceIcon}>
                  <Ionicons name={item.icon as any} size={22} color={PRIMARY} />
                </View>
                <Text style={s.serviceLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Flash Deals */}
        <SectionHeader title="⚡ Flash Deals" subtitle="Limited time" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
        >
          {FLASH_DEALS.map((deal) => (
            <Pressable
              key={deal.title}
              style={s.dealCard}
              onPress={() => router.push("/screens/packages" as any)}
            >
              <View style={s.dealTag}>
                <Text style={s.dealTagText}>{deal.tag}</Text>
              </View>
              <Text style={s.dealTitle} numberOfLines={1}>
                {deal.title}
              </Text>
              <Text style={s.dealOriginal}>{deal.original}</Text>
              <Text style={s.dealPrice}>{deal.discounted}</Text>
              <View style={s.dealTimer}>
                <Ionicons name="timer-outline" size={12} color={ACCENT} />
                <Text style={s.dealTimerText}>{deal.expires} left</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* AI Recommendations */}
        <SectionHeader
          title="🤖 AI Picks For You"
          subtitle="Personalised by AI"
        />
        <View style={s.aiCard}>
          {loadingAI ? (
            <ActivityIndicator color={PRIMARY} />
          ) : (
            aiRecs.map((rec, i) => (
              <Pressable
                key={rec}
                style={s.aiRow}
                onPress={() => router.push("/screens/explore" as any)}
              >
                <View style={[s.aiNum, { backgroundColor: `${PRIMARY}18` }]}>
                  <Text style={[s.aiNumText, { color: PRIMARY }]}>{i + 1}</Text>
                </View>
                <Text style={s.aiRecText}>{rec}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </Pressable>
            ))
          )}
          <Text style={s.aiPowered}>
            Powered by AI · based on your preferences
          </Text>
        </View>

        {/* Trending Destinations */}
        <SectionHeader
          title="🔥 Trending Now"
          subtitle="Most booked this week"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
        >
          {TRENDING.map((dest) => (
            <Pressable
              key={dest.name}
              style={s.destCard}
              onPress={() => router.push("/screens/explore" as any)}
            >
              <Image source={{ uri: dest.img }} style={s.destImg} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.72)"]}
                style={s.destOverlay}
              >
                <Text style={s.destName}>{dest.name}</Text>
                <Text style={s.destCountry}>
                  {dest.country} · from {dest.price}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>

        {/* Weekend Getaways */}
        <SectionHeader
          title="🗓 Weekend Getaways"
          subtitle="Quick escapes from Dhaka"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
        >
          {WEEKEND.map((w) => (
            <Pressable
              key={w.title}
              style={s.weekendCard}
              onPress={() => router.push("/screens/packages" as any)}
            >
              <Image source={{ uri: w.img }} style={s.weekendImg} />
              <View style={s.weekendBody}>
                <Text style={s.weekendTitle}>{w.title}</Text>
                <Text style={s.weekendMeta}>
                  {w.duration} · {w.price}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured Agencies */}
        <SectionHeader
          title="🏢 Featured Agencies"
          subtitle="Top rated travel partners"
        />
        {AGENCIES.map((ag) => (
          <View key={ag.name} style={s.agencyRow}>
            <View style={s.agencyAvatar}>
              <Ionicons name="business" size={22} color={PRIMARY} />
            </View>
            <View style={s.agencyInfo}>
              <View style={s.agencyNameRow}>
                <Text style={s.agencyName}>{ag.name}</Text>
                {ag.verified && (
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                )}
              </View>
              <Text style={s.agencyMeta}>
                ⭐ {ag.rating} · {ag.packages} packages
              </Text>
            </View>
            <Pressable
              style={[s.viewBtn, { borderColor: PRIMARY }]}
              onPress={() => router.push("/screens/packages" as any)}
            >
              <Text style={[s.viewBtnText, { color: PRIMARY }]}>View</Text>
            </Pressable>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <AiPill color={PRIMARY} />
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionSub}>{subtitle}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f5f7fa" },
  scroll: { paddingBottom: 20 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  greeting: { color: "#fff", fontSize: 20, fontWeight: "800" },
  tierText: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  notifBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 8,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  voiceBtn: { padding: 4 },
  serviceGrid: {
    backgroundColor: "#fff",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  serviceItem: { width: "25%", alignItems: "center", marginBottom: 12 },
  serviceIcon: {
    backgroundColor: `${PRIMARY}12`,
    borderRadius: 16,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  serviceLabel: { fontSize: 11, color: "#475467", fontWeight: "700" },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  sectionSub: { fontSize: 12, color: "#667085", marginTop: 2 },
  hList: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  dealCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    width: 160,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  dealTag: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  dealTagText: { color: "#d97706", fontSize: 11, fontWeight: "800" },
  dealTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  dealOriginal: {
    fontSize: 11,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginTop: 2,
  },
  dealTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  dealTimerText: { fontSize: 11, color: ACCENT, fontWeight: "700" },
  aiCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    gap: 12,
  },
  aiRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  aiNumText: { fontSize: 13, fontWeight: "900" },
  aiRecText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#111827" },
  aiPowered: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 4,
  },
  destCard: { width: 150, height: 190, borderRadius: 16, overflow: "hidden" },
  destImg: { width: "100%", height: "100%" },
  destOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 10,
  },
  destName: { color: "#fff", fontSize: 14, fontWeight: "900" },
  destCountry: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 2 },
  weekendCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    width: 180,
  },
  weekendImg: { width: "100%", height: 110 },
  weekendBody: { padding: 10 },
  weekendTitle: { fontSize: 13, fontWeight: "800", color: "#111827" },
  weekendMeta: { fontSize: 11, color: "#667085", marginTop: 3 },
  agencyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  agencyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${PRIMARY}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  agencyInfo: { flex: 1 },
  agencyNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  agencyName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  agencyMeta: { fontSize: 12, color: "#667085", marginTop: 2 },
  viewBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewBtnText: { fontSize: 12, fontWeight: "800" },
});
