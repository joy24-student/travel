import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../../utils/supabase";
import { tripPlannerService, reviewAnalyzerService } from "../services/ai";
import { BottomNav, AiPill } from "./Navigation";
import { TopBar } from "./TopBar";
import type { UIScreen } from "../data/screens";

const PRIMARY = "#287dfa";

const PACKAGES_DEFAULT = [
  {
    id: "pkg-1",
    name: "Cox's Bazar Premium 4D/3N",
    destination: "Cox's Bazar",
    duration: "4 Days / 3 Nights",
    price: "৳12,500",
    originalPrice: "৳16,000",
    rating: 4.8,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800",
    includes: [
      "Hotel (3 nights)",
      "Breakfast & Dinner",
      "AC Transport",
      "Guide",
      "Beach Activities",
    ],
    excludes: ["Airfare", "Lunch", "Personal Expenses", "Travel Insurance"],
    hotel: {
      name: "Ocean View Resort",
      stars: 4,
      amenities: ["Pool", "WiFi", "Spa", "Restaurant", "Beach Access"],
    },
    transport: {
      type: "AC Bus",
      from: "Dhaka",
      to: "Cox's Bazar",
      duration: "8 hours",
    },
    meals: [
      "Breakfast daily",
      "Dinner at Ocean View Restaurant",
      "Welcome drink on arrival",
    ],
    addons: [
      { name: "Scuba Diving", price: "৳2,500" },
      { name: "Inani Beach Tour", price: "৳800" },
      { name: "Travel Insurance", price: "৳500" },
    ],
    cancellation:
      "Free cancellation up to 7 days before departure. 50% refund 3-6 days prior. No refund within 48 hours.",
    availability: 8,
    reviews: [
      "Amazing beach views and great service!",
      "Hotel was clean and staff were friendly.",
      "The guided tours were very informative.",
      "Food was excellent, especially the seafood.",
    ],
  },
  {
    id: "pkg-2",
    name: "Bangkok Explorer 6D/5N",
    destination: "Bangkok, Thailand",
    duration: "6 Days / 5 Nights",
    price: "$480",
    originalPrice: "$650",
    rating: 4.7,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
    includes: [
      "Hotel (5 nights)",
      "Daily Breakfast",
      "Airport Transfers",
      "City Tour",
      "Temple Visits",
    ],
    excludes: [
      "International Flights",
      "Visa",
      "Lunch & Dinner",
      "Optional Tours",
    ],
    hotel: {
      name: "Bangkok Central Hotel",
      stars: 4,
      amenities: ["Pool", "WiFi", "Gym", "Rooftop Bar"],
    },
    transport: {
      type: "Private Van",
      from: "Suvarnabhumi Airport",
      to: "Hotel",
      duration: "45 minutes",
    },
    meals: [
      "Breakfast daily at hotel",
      "Welcome Thai dinner",
      "Street food tour on Day 3",
    ],
    addons: [
      { name: "Pattaya Day Trip", price: "$45" },
      { name: "Thai Cooking Class", price: "$35" },
      { name: "River Cruise", price: "$25" },
    ],
    cancellation:
      "Free cancellation 14 days before. 30% charge 7-13 days. 50% charge within 7 days.",
    availability: 12,
    reviews: [
      "Bangkok is magical, this package was perfect!",
      "Hotel location was great, walking distance to BTS.",
      "The temple tour guide was knowledgeable.",
    ],
  },
];

const TABS = ["Overview", "Itinerary", "Hotel", "Reviews", "Policy"] as const;
type Tab = (typeof TABS)[number];

interface Package {
  id: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  includes: string[];
  excludes: string[];
  hotel: { name: string; stars: number; amenities: string[] };
  transport: { type: string; from: string; to: string; duration: string };
  meals: string[];
  addons: { name: string; price: string }[];
  cancellation: string;
  availability: number;
  reviews: string[];
}

export function PackageScreen({ screen }: { screen: UIScreen }) {
   const [packages, setPackages] = useState<Package[]>(PACKAGES_DEFAULT);
   const [loadingPackages, setLoadingPackages] = useState(true);
   const [selected, setSelected] = useState<Package | null>(null);
   const [tab, setTab] = useState<Tab>("Overview");
  const [itinerary, setItinerary] = useState<any>(null);
  const [reviewAnalysis, setReviewAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Load tours from Supabase
  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoadingPackages(true);
        const { data, error } = await supabase
          .from("tours")
          .select("*")
          .limit(20);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const mappedPackages = data.map((tour: any) => ({
            id: tour.id,
            name: tour.title,
            destination: `${tour.destination_city}, ${tour.destination_country}`,
            duration: `${tour.duration_days} Days`,
            price: `$${tour.price}`,
            originalPrice: `$${Math.round(tour.price * 1.3)}`,
            rating: tour.rating || 4.5,
            reviewCount: tour.reviews_count || 0,
            image: (Array.isArray(tour.image_urls) && tour.image_urls[0]) || 
                   "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800",
            includes: Array.isArray(tour.included_services) ? tour.included_services : ["Tour guide", "Meals"],
            excludes: Array.isArray(tour.not_included) ? tour.not_included : ["Flights", "Personal expenses"],
            hotel: { name: "Partner Hotel", stars: 4, amenities: ["WiFi", "Restaurant"] },
            transport: { type: "Coach", from: "Main office", to: tour.destination_city, duration: "TBD" },
            meals: ["Breakfast", "Lunch", "Dinner"],
            addons: [{ name: "Travel Insurance", price: "$25" }],
            cancellation: "Free cancellation up to 7 days before departure.",
            availability: 5,
            reviews: [tour.description || "Great tour experience!"],
          }));
          setPackages(mappedPackages);
        } else {
          setPackages(PACKAGES_DEFAULT);
        }
      } catch (err) {
        console.error("Error loading tours:", err);
        setPackages(PACKAGES_DEFAULT);
      } finally {
        setLoadingPackages(false);
      }
    };

    loadTours();
  }, []);

const openPackage = (pkg: (typeof packages)[0]) => {
     setSelected(pkg);
     setTab("Overview");
     setItinerary(null);
     setReviewAnalysis(null);
     setSelectedAddons([]);
   };

  const handleTabChange = async (t: Tab) => {
    setTab(t);
    if (!selected) return;
    if (t === "Itinerary" && !itinerary) {
      setLoading(true);
      try {
        const res = await tripPlannerService.plan({
          origin: "Dhaka",
          destination: selected.destination,
          startDate: "2025-12-01",
          endDate: "2025-12-06",
          travelers: 2,
          interests: ["sightseeing", "food", "culture"],
        });
        setItinerary(res.data);
      } catch {
        setItinerary(null);
      }
      setLoading(false);
    }
    if (t === "Reviews" && !reviewAnalysis) {
      setLoading(true);
      try {
        const res = await reviewAnalyzerService.analyze({
          entityName: selected.name,
          entityType: "package",
          reviews: selected.reviews,
        });
        setReviewAnalysis(res.data);
      } catch {
        setReviewAnalysis(null);
      }
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selected) return;
    await Share.share({
      message: `Check out ${selected.name} for ${selected.price}! Book now on Shopno Jatra.`,
      title: selected.name,
    });
  };

  const toggleWishlist = (id: string) =>
    setWishlisted((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const toggleAddon = (name: string) =>
    setSelectedAddons((p) =>
      p.includes(name) ? p.filter((x) => x !== name) : [...p, name],
    );

  if (selected) {
    return (
      <SafeAreaView style={s.shell}>
        <View style={s.pkgHeader}>
          <Pressable onPress={() => setSelected(null)} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={s.pkgHeaderTitle} numberOfLines={1}>
            {selected.name}
          </Text>
          <View style={s.headerActions}>
            <Pressable onPress={() => toggleWishlist(selected.id)}>
              <Ionicons
                name={
                  wishlisted.includes(selected.id) ? "heart" : "heart-outline"
                }
                size={22}
                color={wishlisted.includes(selected.id) ? "#ef4444" : "#fff"}
              />
            </Pressable>
            <Pressable onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        <Image source={{ uri: selected.image }} style={s.pkgHero} />

        {/* Price row */}
        <View style={s.priceRow}>
          <View>
            <Text style={s.priceOriginal}>{selected.originalPrice}</Text>
            <Text style={s.price}>
              {selected.price} <Text style={s.pricePer}>/ person</Text>
            </Text>
          </View>
          <View style={s.availBadge}>
            <Ionicons name="people-outline" size={14} color="#10b981" />
            <Text style={s.availText}>{selected.availability} seats left</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabs}
        >
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => handleTabChange(t)}
              style={[s.tab, tab === t && s.tabActive]}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={s.body}>
          {loading && (
            <ActivityIndicator color={PRIMARY} style={{ margin: 20 }} />
          )}

          {!loading && tab === "Overview" && (
            <View style={s.section}>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={s.rating}>{selected.rating}</Text>
                <Text style={s.ratingCount}>
                  ({selected.reviewCount} reviews)
                </Text>
                <Text style={s.duration}>· {selected.duration}</Text>
              </View>

              <Block title="✅ What's Included">
                {selected.includes.map((inc) => (
                  <BulletRow
                    key={inc}
                    icon="checkmark-circle"
                    color="#10b981"
                    text={inc}
                  />
                ))}
              </Block>
              <Block title="❌ What's Excluded">
                {selected.excludes.map((exc) => (
                  <BulletRow
                    key={exc}
                    icon="close-circle"
                    color="#ef4444"
                    text={exc}
                  />
                ))}
              </Block>

              <Block title="🍽 Meals">
                {selected.meals.map((m) => (
                  <BulletRow
                    key={m}
                    icon="restaurant-outline"
                    color={PRIMARY}
                    text={m}
                  />
                ))}
              </Block>

              <Block title="🚌 Transport">
                <View style={s.transportCard}>
                  <Ionicons name="bus-outline" size={20} color={PRIMARY} />
                  <View>
                    <Text style={s.transportType}>
                      {selected.transport.type}
                    </Text>
                    <Text style={s.transportRoute}>
                      {selected.transport.from} → {selected.transport.to}
                    </Text>
                    <Text style={s.transportDuration}>
                      {selected.transport.duration}
                    </Text>
                  </View>
                </View>
              </Block>

              <Block title="➕ Add-ons">
                {selected.addons.map((addon) => (
                  <Pressable
                    key={addon.name}
                    onPress={() => toggleAddon(addon.name)}
                    style={[
                      s.addonRow,
                      selectedAddons.includes(addon.name) && s.addonSelected,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.addonName}>{addon.name}</Text>
                      <Text style={s.addonPrice}>{addon.price}</Text>
                    </View>
                    <Ionicons
                      name={
                        selectedAddons.includes(addon.name)
                          ? "checkmark-circle"
                          : "add-circle-outline"
                      }
                      size={22}
                      color={
                        selectedAddons.includes(addon.name)
                          ? "#10b981"
                          : PRIMARY
                      }
                    />
                  </Pressable>
                ))}
              </Block>

              <Pressable
                style={s.bookBtn}
                onPress={() =>
                  Alert.alert("Booking", "Proceeding to booking...")
                }
              >
                <Text style={s.bookBtnText}>Book Now — {selected.price}</Text>
              </Pressable>
            </View>
          )}

          {!loading && tab === "Itinerary" && (
            <View style={s.section}>
              {!itinerary && (
                <Text style={s.mutedText}>Generating AI itinerary...</Text>
              )}
              {itinerary?.days?.map((day: any) => (
                <View key={day.day} style={s.dayCard}>
                  <LinearGradient
                    colors={[PRIMARY, "#1a56db"]}
                    style={s.dayNum}
                  >
                    <Text style={s.dayNumText}>Day {day.day}</Text>
                  </LinearGradient>
                  <View style={s.dayBody}>
                    <Text style={s.dayTheme}>{day.theme}</Text>
                    {day.activities?.map((act: any, i: number) => (
                      <View key={i} style={s.actRow}>
                        <Text style={s.actTime}>{act.time}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.actName}>{act.activity}</Text>
                          <Text style={s.actLocation}>{act.location}</Text>
                        </View>
                      </View>
                    ))}
                    {day.accommodation && (
                      <Text style={s.accommodation}>
                        🏨 {day.accommodation}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
              {itinerary?.tips?.length > 0 && (
                <Block title="💡 Travel Tips">
                  {itinerary.tips.map((tip: string, i: number) => (
                    <Text key={i} style={s.bulletItem}>
                      • {tip}
                    </Text>
                  ))}
                </Block>
              )}
            </View>
          )}

          {!loading && tab === "Hotel" && (
            <View style={s.section}>
              <Text style={s.hotelName}>{selected.hotel.name}</Text>
              <View style={s.starsRow}>
                {Array.from({ length: selected.hotel.stars }).map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#f59e0b" />
                ))}
              </View>
              <Block title="Amenities">
                <View style={s.amenGrid}>
                  {selected.hotel.amenities.map((a) => (
                    <View key={a} style={s.amenItem}>
                      <Ionicons
                        name={amenityIcon(a)}
                        size={18}
                        color={PRIMARY}
                      />
                      <Text style={s.amenText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </Block>
            </View>
          )}

          {!loading && tab === "Reviews" && (
            <View style={s.section}>
              {reviewAnalysis && (
                <>
                  <View style={s.reviewSummaryCard}>
                    <Text style={s.reviewScore}>{reviewAnalysis.score}/10</Text>
                    <Text style={s.reviewSentiment}>
                      {reviewAnalysis.overallSentiment?.replace("_", " ")}
                    </Text>
                    <Text style={s.reviewSummaryText}>
                      {reviewAnalysis.summary}
                    </Text>
                  </View>
                  <Block title="What guests love">
                    {reviewAnalysis.topPraises?.map((p: string, i: number) => (
                      <BulletRow
                        key={i}
                        icon="thumbs-up"
                        color="#10b981"
                        text={p}
                      />
                    ))}
                  </Block>
                  <Block title="What could be better">
                    {reviewAnalysis.topComplaints?.map(
                      (c: string, i: number) => (
                        <BulletRow
                          key={i}
                          icon="thumbs-down"
                          color="#ef4444"
                          text={c}
                        />
                      ),
                    )}
                  </Block>
                </>
              )}
              {selected.reviews.map((r, i) => (
                <View key={i} style={s.reviewCard}>
                  <View style={s.reviewHeader}>
                    <View style={s.reviewAvatar}>
                      <Text style={s.reviewAvatarText}>T</Text>
                    </View>
                    <Text style={s.reviewerName}>Traveler {i + 1}</Text>
                    <View style={s.reviewStars}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Ionicons
                          key={si}
                          name="star"
                          size={12}
                          color="#f59e0b"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={s.reviewText}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          {!loading && tab === "Policy" && (
            <View style={s.section}>
              <Block title="📋 Cancellation Policy">
                <Text style={s.policyText}>{selected.cancellation}</Text>
              </Block>
              <Block title="📦 Inclusions Summary">
                {selected.includes.map((inc) => (
                  <BulletRow
                    key={inc}
                    icon="checkmark"
                    color="#10b981"
                    text={inc}
                  />
                ))}
              </Block>
              <Block title="⚠️ Exclusions">
                {selected.excludes.map((exc) => (
                  <BulletRow
                    key={exc}
                    icon="close"
                    color="#ef4444"
                    text={exc}
                  />
                ))}
              </Block>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
        <BottomNav active="Home" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.shell}>
      <TopBar screen={screen} />
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.pageTitle}>Travel Packages</Text>
        {loadingPackages ? (
          <ActivityIndicator color={PRIMARY} size="large" style={{ marginTop: 40 }} />
        ) : (
          packages.map((pkg) => (
            <Pressable
              key={pkg.id}
              onPress={() => openPackage(pkg)}
              style={s.pkgCard}
            >
              <Image source={{ uri: pkg.image }} style={s.pkgCardImg} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.82)"]}
                style={s.pkgCardOverlay}
              >
                <View style={s.pkgCardBadge}>
                  <Text style={s.pkgCardBadgeText}>
                    {Math.round(
                      (1 -
                        parseInt(pkg.price.replace(/[^\d]/g, "")) /
                          parseInt(pkg.originalPrice?.replace(/[^\d]/g, "") || "100")) *
                        100,
                    )}
                    % OFF
                  </Text>
                </View>
                <Text style={s.pkgCardName}>{pkg.name}</Text>
                <View style={s.pkgCardRow}>
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text style={s.pkgCardRating}>
                    {pkg.rating} · {pkg.duration}
                  </Text>
                </View>
                <View style={s.pkgCardFooter}>
                  <Text style={s.pkgCardOriginal}>{pkg.originalPrice}</Text>
                  <Text style={s.pkgCardPrice}>{pkg.price}</Text>
                  <Pressable
                    onPress={() => toggleWishlist(pkg.id)}
                    style={s.wishBtn}
                  >
                    <Ionicons
                    name={
                      wishlisted.includes(pkg.id) ? "heart" : "heart-outline"
                    }
                    size={18}
                    color={wishlisted.includes(pkg.id) ? "#ef4444" : "#fff"}
                  />
                </Pressable>
              </View>
            </LinearGradient>
          </Pressable>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <AiPill color={PRIMARY} />
      <BottomNav active="Home" color={PRIMARY} />
    </SafeAreaView>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.block}>
      <Text style={s.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletRow({
  icon,
  color,
  text,
}: {
  icon: string;
  color: string;
  text: string;
}) {
  return (
    <View style={s.bulletRow}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

function amenityIcon(amenity: string): any {
  const lower = amenity.toLowerCase();
  if (lower.includes("pool")) return "water-outline";
  if (lower.includes("wifi")) return "wifi-outline";
  if (lower.includes("gym")) return "fitness-outline";
  if (lower.includes("spa")) return "leaf-outline";
  if (lower.includes("restaurant")) return "restaurant-outline";
  if (lower.includes("beach")) return "umbrella-outline";
  if (lower.includes("bar")) return "wine-outline";
  return "checkmark-circle-outline";
}

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f5f7fa" },
  scroll: { padding: 16, paddingBottom: 100 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
  },
  pkgCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    height: 240,
  },
  pkgCardImg: { width: "100%", height: "100%" },
  pkgCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
  },
  pkgCardBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  pkgCardBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  pkgCardName: { color: "#fff", fontSize: 18, fontWeight: "900" },
  pkgCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  pkgCardRating: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  pkgCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  pkgCardOriginal: {
    color: "rgba(255,255,255,0.6)",
    textDecorationLine: "line-through",
    fontSize: 13,
  },
  pkgCardPrice: { color: "#fff", fontSize: 18, fontWeight: "900", flex: 1 },
  wishBtn: { padding: 4 },
  pkgHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: { padding: 4 },
  pkgHeaderTitle: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "900" },
  headerActions: { flexDirection: "row", gap: 14 },
  pkgHero: { width: "100%", height: 220 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f4f7",
  },
  priceOriginal: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  price: { fontSize: 22, fontWeight: "900", color: "#111827" },
  pricePer: { fontSize: 13, fontWeight: "400", color: "#667085" },
  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d1fae5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  availText: { color: "#10b981", fontSize: 12, fontWeight: "800" },
  tabs: { paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 13, fontWeight: "700", color: "#667085" },
  tabTextActive: { color: "#fff" },
  body: { padding: 16, paddingBottom: 100 },
  section: { gap: 14 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rating: { fontSize: 15, fontWeight: "900", color: "#111827" },
  ratingCount: { fontSize: 13, color: "#667085" },
  duration: { fontSize: 13, color: "#667085" },
  block: { gap: 8 },
  blockTitle: { fontSize: 15, fontWeight: "900", color: "#111827" },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  bulletText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },
  bulletItem: { fontSize: 13, color: "#374151", lineHeight: 20 },
  transportCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  transportType: { fontSize: 14, fontWeight: "800", color: "#111827" },
  transportRoute: { fontSize: 13, color: "#667085" },
  transportDuration: { fontSize: 12, color: PRIMARY, fontWeight: "700" },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addonSelected: { borderColor: "#10b981", backgroundColor: "#f0fdf4" },
  addonName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  addonPrice: { fontSize: 13, color: PRIMARY, fontWeight: "800", marginTop: 2 },
  bookBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  bookBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  dayCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  dayNum: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  dayNumText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  dayBody: { flex: 1, padding: 12, gap: 6 },
  dayTheme: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  actRow: { flexDirection: "row", gap: 8 },
  actTime: { fontSize: 11, color: PRIMARY, fontWeight: "700", width: 48 },
  actName: { fontSize: 13, fontWeight: "700", color: "#374151" },
  actLocation: { fontSize: 11, color: "#9ca3af" },
  accommodation: { fontSize: 12, color: "#667085", marginTop: 4 },
  hotelName: { fontSize: 20, fontWeight: "900", color: "#111827" },
  starsRow: { flexDirection: "row", gap: 2, marginBottom: 8 },
  amenGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amenItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  amenText: { fontSize: 12, color: "#374151", fontWeight: "700" },
  reviewSummaryCard: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  reviewScore: { fontSize: 36, fontWeight: "900", color: "#fff" },
  reviewSentiment: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textTransform: "capitalize",
  },
  reviewSummaryText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${PRIMARY}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: { color: PRIMARY, fontWeight: "900" },
  reviewerName: { flex: 1, fontSize: 13, fontWeight: "700", color: "#111827" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewText: { fontSize: 13, color: "#374151", lineHeight: 20 },
  policyText: { fontSize: 13, color: "#374151", lineHeight: 22 },
  mutedText: { color: "#9ca3af", fontSize: 13, textAlign: "center" },
});
