import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const supportItems = [
  {
    id: "ticket",
    title: "Open a Ticket",
    description: "Get help from our support team",
    icon: "support-agent",
  },
  {
    id: "chat",
    title: "Live Chat",
    description: "Chat with an agent now",
    icon: "chat",
  },
  {
    id: "call",
    title: "Call Support",
    description: "Reach us by phone",
    icon: "call",
  },
];

export function ContactSupportScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Contact Support</Text>
        <Text style={styles.subTitle}>
          We’re here to help your team stay ahead of every guest request.
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Need help with a reservation?</Text>
          <Text style={styles.heroText}>
            Our specialist team is available 24/7 for urgent assistance and
            property issues.
          </Text>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Text style={styles.primaryText}>Start a Live Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.supportList}>
          {supportItems.map((item) => (
            <View key={item.id} style={styles.supportCard}>
              <View style={styles.supportIcon}>
                <MaterialIcons name={item.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>{item.title}</Text>
                <Text style={styles.supportDescription}>
                  {item.description}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
            </View>
          ))}
        </View>

        <View style={styles.contactFooter}>
          <Text style={styles.footerTitle}>Emergency Line</Text>
          <Text style={styles.footerSubtitle}>+1 (800) 555-0130</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0b1326",
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subTitle: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  heroText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  supportList: {
    marginBottom: 24,
  },
  supportCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  supportIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  supportDescription: {
    color: "#94A3B8",
    fontSize: 12,
  },
  contactFooter: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
  },
  footerTitle: {
    color: "#94A3B8",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  footerSubtitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
});
