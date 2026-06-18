import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav, AiPill } from "./Navigation";
import { TopBar } from "./TopBar";
import { supabase } from "../utils/supabase";
import type { UIScreen } from "../data/screens";

const PRIMARY = "#287dfa";

const LIVE_STREAMS = [
  {
    id: "1",
    type: "agency",
    host: "Shopno Tours",
    title: "Live: Cox's Bazar Beach Tour",
    viewers: 1240,
    thumbnail: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400",
    isLive: true,
    badge: "🏢 Agency",
  },
  {
    id: "2",
    type: "influencer",
    host: "Rafi Travels",
    title: "Bangkok Street Food Night Tour 🍜",
    viewers: 3820,
    thumbnail: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400",
    isLive: true,
    badge: "⭐ Influencer",
  },
];

const UPCOMING = [
  {
    host: "BD Explorer Agency",
    title: "Sajek Valley Trek Preview",
    time: "Today 8:00 PM",
  },
];

type CallType = "video" | "voice" | "group";

export function LiveScreen({ screen }: { screen: UIScreen }) {
  const [activeStream, setActiveStream] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<CallType | null>(null);
  const [filter, setFilter] = useState<"all" | "agency" | "influencer" | "destination" | "event">("all");
  const [liveStreams, setLiveStreams] = useState<any[]>(LIVE_STREAMS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from("live_streams")
          .select("*")
          .eq("status", "live");

        if (data && data.length > 0) {
          setLiveStreams(data.map((s: any) => ({
            id: s.id,
            type: s.category || "agency",
            host: s.streamer_name,
            title: s.title,
            viewers: s.viewers_count,
            thumbnail: s.thumbnail_url,
            isLive: true,
            badge: s.category === 'influencer' ? '⭐ Influencer' : '🏢 Agency',
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
  }, []);

  const filtered = filter === "all" ? liveStreams : liveStreams.filter((s) => s.type === filter);

  const startCall = (type: CallType) => {
    Alert.alert(
      `${type === "group" ? "Group Video" : type === "video" ? "Video" : "Voice"} Call`,
      "Live call functionality requires WebRTC integration. This screen is the UI scaffold.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Simulate", onPress: () => setActiveCall(type) },
      ],
    );
  };

  if (activeCall) {
    return (
      <SafeAreaView style={[s.shell, { backgroundColor: "#0f172a" }]}>
        <LinearGradient colors={["#1e293b", "#0f172a"]} style={s.callScreen}>
          <Text style={s.callType}>{activeCall.toUpperCase()} CALL</Text>
          <View style={s.callAvatar}>
            <Ionicons name={activeCall === "voice" ? "call" : "videocam"} size={48} color="#fff" />
          </View>
          <Text style={s.callStatus}>Connecting...</Text>
          <View style={s.callActions}>
             <Pressable style={[s.callBtn, { backgroundColor: "#ef4444" }]} onPress={() => setActiveCall(null)}>
               <Ionicons name="call-outline" size={24} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
             </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (activeStream) {
    return (
      <SafeAreaView style={[s.shell, { backgroundColor: "#0f172a" }]}>
        <Image source={{ uri: activeStream.thumbnail }} style={s.streamFull} />
        <LinearGradient colors={["rgba(0,0,0,0.7)", "transparent"]} style={s.streamTopBar}>
          <Pressable onPress={() => setActiveStream(null)} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={s.liveBadge}><Text style={s.liveBadgeText}>● LIVE</Text></View>
          <View style={s.viewerCount}>
            <Ionicons name="eye-outline" size={14} color="#fff" />
            <Text style={s.viewerText}>{activeStream.viewers}</Text>
          </View>
        </LinearGradient>
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={s.streamBottomBar}>
          <View style={s.streamInfo}>
            <Text style={s.streamHost}>{activeStream.host}</Text>
            <Text style={s.streamTitle}>{activeStream.title}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.shell}>
      <TopBar screen={screen} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterTabs}>
          {["all", "agency", "influencer", "destination", "event"].map((f) => (
            <Pressable key={f} onPress={() => setFilter(f as any)} style={[s.filterTab, filter === f && s.filterTabActive]}>
              <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>{f.toUpperCase()}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={s.sectionTitle}>🔴 Live Now</Text>
        {filtered.map((stream) => (
          <Pressable key={stream.id} onPress={() => stream.isLive && setActiveStream(stream)} style={s.streamCard}>
            <Image source={{ uri: stream.thumbnail }} style={s.streamThumb} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={s.streamOverlay}>
              <View style={s.livePill}><Text style={s.livePillText}>● LIVE</Text></View>
              <View style={s.streamCardBadge}><Text style={s.streamCardBadgeText}>{stream.badge}</Text></View>
              <Text style={s.streamCardTitle}>{stream.title}</Text>
              <View style={s.streamCardMeta}>
                <Text style={s.streamCardHost}>{stream.host}</Text>
                <View style={s.viewerPill}>
                  <Ionicons name="eye-outline" size={12} color="#fff" />
                  <Text style={s.viewerPillText}>{stream.viewers}</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}

        <Text style={s.sectionTitle}>📞 Start a Call</Text>
        <View style={s.callGrid}>
          <CallCard icon="videocam" label="Video Call" desc="1-on-1" color="#287dfa" onPress={() => startCall("video")} />
          <CallCard icon="call" label="Voice Call" desc="Clear Audio" color="#10b981" onPress={() => startCall("voice")} />
          <CallCard icon="people" label="Group" desc="Up to 50" color="#8b5cf6" onPress={() => startCall("group")} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <AiPill color={PRIMARY} />
      <BottomNav active="Messages" color={PRIMARY} />
    </SafeAreaView>
  );
}

function CallCard({ icon, label, desc, color, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={s.callCard}>
      <LinearGradient colors={[color, `${color}99`]} style={s.callCardIcon}>
        <Ionicons name={icon} size={26} color="#fff" />
      </LinearGradient>
      <Text style={s.callCardLabel}>{label}</Text>
      <Text style={s.callCardDesc}>{desc}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f5f7fa" },
  scroll: { padding: 16, paddingBottom: 100 },
  filterTabs: { gap: 8, marginBottom: 14, paddingVertical: 4 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#e5e7eb" },
  filterTabActive: { backgroundColor: PRIMARY },
  filterTabText: { fontSize: 11, fontWeight: "800", color: "#667085" },
  filterTabTextActive: { color: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827", marginBottom: 10, marginTop: 8 },
  streamCard: { borderRadius: 16, overflow: "hidden", marginBottom: 14, height: 200 },
  streamThumb: { width: "100%", height: "100%" },
  streamOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", padding: 12 },
  livePill: { position: "absolute", top: 10, left: 10, backgroundColor: "#ef4444", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  livePillText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  streamCardBadge: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  streamCardBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  streamCardTitle: { color: "#fff", fontSize: 15, fontWeight: "800", marginBottom: 4 },
  streamCardMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  streamCardHost: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  viewerPill: { flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  viewerPillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  callGrid: { flexDirection: "row", gap: 10 },
  callCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center", gap: 8 },
  callCardIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  callCardLabel: { fontSize: 12, fontWeight: "900", color: "#111827" },
  callCardDesc: { fontSize: 10, color: "#9ca3af", textAlign: "center" },
  callScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  callType: { color: "#fff", fontSize: 18, fontWeight: "900" },
  callAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" },
  callStatus: { color: "#94a3b8", fontSize: 14 },
  callActions: { flexDirection: "row", gap: 20, marginTop: 20 },
  callBtn: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  streamFull: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  streamTopBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingTop: 48 },
  backBtn: { padding: 4 },
  liveBadge: { backgroundColor: "#ef4444", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  liveBadgeText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  viewerCount: { flexDirection: "row", gap: 4, alignItems: "center", flex: 1, justifyContent: "flex-end" },
  viewerText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  streamBottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "flex-end", padding: 16, paddingBottom: 32 },
  streamInfo: { flex: 1 },
  streamHost: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  streamTitle: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 2 },
});
