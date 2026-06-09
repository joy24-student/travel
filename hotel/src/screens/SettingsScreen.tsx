import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export function SettingsScreen() {
  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="notifications" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>General</Text>
          {[
            { label: "Profile", icon: "person" },
            { label: "Notifications", icon: "notifications" },
            { label: "Language", icon: "language" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.settingItem}
              activeOpacity={0.8}
            >
              <View style={styles.settingIcon}>
                <MaterialIcons name={item.icon as any} size={20} color="#fff" />
              </View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Security</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialIcons name="lock" size={20} color="#fff" />
            </View>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
              <Text style={styles.settingSub}>Enabled for your account</Text>
            </View>
            <Switch
              value
              trackColor={{ true: "#6366F1", false: "#374151" }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.8}>
            <View style={styles.settingIcon}>
              <MaterialIcons name="vpn-key" size={20} color="#fff" />
            </View>
            <Text style={styles.settingLabel}>Password</Text>
            <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Support</Text>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.8}>
            <View style={styles.settingIcon}>
              <MaterialIcons name="support" size={20} color="#fff" />
            </View>
            <Text style={styles.settingLabel}>Contact Support</Text>
            <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.8}>
            <View style={styles.settingIcon}>
              <MaterialIcons name="info" size={20} color="#fff" />
            </View>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingValue}>v1.0.0</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
  },
  sectionHeading: {
    color: "#94A3B8",
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 14,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  settingSub: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },
  settingTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  settingValue: {
    color: "#94A3B8",
    fontSize: 12,
  },
});
