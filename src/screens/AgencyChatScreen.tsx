import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav, AiPill } from "./Navigation";

const PRIMARY = "#287dfa";

const AGENCY_CHATS = [
  {
    id: "1",
    agency: "Shopno Tours",
    message: "Your package is confirmed! Check your email for the voucher.",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: "2",
    agency: "Rafi Travels",
    message: "Flight schedule updated. New departure time: 8:45 AM",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "3",
    agency: "BD Explorer",
    message: "Your refund of ৳1,200 has been processed.",
    time: "2 days ago",
    unread: false,
  },
];

export function AgencyChatScreen() {
  const [messages, setMessages] = useState(AGENCY_CHATS);

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={PRIMARY} />
        </Pressable>
        <Text style={s.title}>Agency Chat</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <Pressable style={s.chatItem}>
            <View style={s.chatAvatar}>
              <Ionicons name="business" size={20} color={PRIMARY} />
            </View>
            <View style={s.chatContent}>
              <Text style={s.chatAgency}>{item.agency}</Text>
              <Text style={s.chatMessage} numberOfLines={1}>
                {item.message}
              </Text>
            </View>
            <View style={s.chatMeta}>
              <Text style={s.chatTime}>{item.time}</Text>
              {item.unread && <View style={s.unreadDot} />}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>No agency messages yet</Text>
          </View>
        }
      />

      <View style={s.inputRow}>
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          style={s.input}
        />
        <Pressable style={s.sendBtn}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>

      <AiPill color={PRIMARY} />
      <BottomNav active="Messages" color={PRIMARY} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f5f7fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  list: { padding: 16 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${PRIMARY}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  chatContent: { flex: 1 },
  chatAgency: { fontSize: 14, fontWeight: "700", color: "#111827" },
  chatMessage: { fontSize: 13, color: "#6b7280" },
  chatMeta: { alignItems: "flex-end" },
  chatTime: { fontSize: 11, color: "#9ca3af" },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginTop: 4,
  },
  empty: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 15, color: "#9ca3af" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
});