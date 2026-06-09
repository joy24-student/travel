import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

export function ChatScreen() {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
          <View>
            <Text style={styles.chatTitle}>Robert Fox</Text>
            <Text style={styles.chatSubtitle}>Room 302 • VIP Guest</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="search" size={22} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.callButton]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="call" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>Today, 30 May 2024</Text>
        </View>

        <View style={styles.messageRowLeft}>
          <View style={styles.messageBubbleLeft}>
            <Text style={styles.messageText}>
              Thank you for the quick check-in! Is it possible to get extra
              towels sent to room 302?
            </Text>
          </View>
          <Text style={styles.messageMeta}>10:24 AM • Sent</Text>
        </View>

        <View style={styles.messageRowRight}>
          <View style={styles.messageBubbleRight}>
            <Text style={styles.messageTextRight}>
              You're very welcome, Mr. Fox! I've sent a request to housekeeping.
              They'll be at your door in 5 minutes.
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.messageMetaRight}>10:26 AM • Read</Text>
            <MaterialIcons name="done-all" size={16} color="#22C55E" />
          </View>
        </View>

        <View style={styles.messageRowLeft}>
          <View style={styles.messageBubbleLeft}>
            <Text style={styles.messageText}>Perfect, thanks!</Text>
          </View>
          <Text style={styles.messageMeta}>10:27 AM</Text>
        </View>
      </ScrollView>

      <View style={styles.quickActions}>
        {[
          { id: "towels", label: "Send Towels", icon: "dry-cleaning" },
          { id: "roomService", label: "Room Service", icon: "restaurant" },
          {
            id: "housekeeping",
            label: "Housekeeping",
            icon: "cleaning-services",
          },
          { id: "extend", label: "Extend Stay", icon: "event-repeat" },
        ].map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionChip}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={action.icon as any}
              size={18}
              color="#fff"
            />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0b1326",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#0b1326",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#6366F1",
    marginLeft: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  chatTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  chatSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
  },
  messages: {
    paddingTop: 140,
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  dateBadge: {
    alignSelf: "center",
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  dateText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  messageRowLeft: {
    alignSelf: "flex-start",
    marginBottom: 20,
    maxWidth: "85%",
  },
  messageBubbleLeft: {
    backgroundColor: "#111827",
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 24,
    padding: 16,
  },
  messageRowRight: {
    alignSelf: "flex-end",
    marginBottom: 20,
    maxWidth: "85%",
    alignItems: "flex-end",
  },
  messageBubbleRight: {
    backgroundColor: "#6366F1",
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 20,
    padding: 16,
  },
  messageText: {
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextRight: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  messageMeta: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  messageMetaRight: {
    color: "#E5E7EB",
    fontSize: 11,
  },
  quickActions: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  actionChip: {
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: "47%",
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
