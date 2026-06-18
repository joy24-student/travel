import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View, Switch, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import type { UIScreen } from "../data/screens";
import { SettingsRow } from "../components/SettingsRow";
import { TopBar } from "./TopBar";
import { BottomNav, AiPill } from "./Navigation";
import { userRepository } from "../services/repositories";
import { useCurrentUser } from "../hooks/useAuth";

export function SettingsSpecializedScreen({ screen }: { screen: UIScreen }) {
  const user = useCurrentUser();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await userRepository.getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      setSettings((prev: any) => ({ ...prev, [key]: value }));
      await userRepository.updateSetting(key, value);
    } catch (err) {
      console.error("Error updating setting:", err);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#287dfa" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <TopBar screen={screen} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Localization Settings */}
        <View style={styles.section}>
          <SettingsRow label="Language" value={settings.language || "English"} />
          <SettingsRow label="Country or Region" value={settings.country || "United States"} />
          <SettingsRow label="Currency" value={settings.currency || "USD"} />
          <SettingsRow label="Units" value={settings.distance_unit === 'metric' ? "Metric (km, m², kg)" : "Imperial (miles, ft², lb)"} />
          <SettingsRow label="Temperature Scale" value={settings.temperature_unit === 'celsius' ? "Celsius (°C)" : "Fahrenheit (°F)"} />
          <SettingsRow
            label="Time format"
            value={settings.time_format || "12-hour (am/pm)"}
            hasBorder={false}
          />
        </View>

        <View style={styles.separator} />

        {/* Account Settings */}
        <View style={styles.section}>
          <SettingsRow label="Manage my account" showChevron />
          <SettingsRow label="Scan QR Code" showChevron hasBorder={false} />
        </View>

        <View style={styles.separator} />

        {/* Interface Settings */}
        <View style={styles.section}>
          <SettingsRow
            label="Dark Theme"
            showChevron={false}
            rightComponent={
              <Switch
                value={settings.theme === 'dark'}
                onValueChange={(val) => updateSetting('theme', val ? 'dark' : 'light')}
                trackColor={{ true: '#287dfa' }}
              />
            }
          />
          <SettingsRow
            label="Notifications"
            showChevron={false}
            rightComponent={
              <Switch
                value={settings.notifications_enabled}
                onValueChange={(val) => updateSetting('notifications_enabled', val)}
                trackColor={{ true: '#287dfa' }}
              />
            }
          />
          <SettingsRow label="Accessibility" showChevron hasBorder={false} />
        </View>

        <View style={styles.separator} />

        {/* Legal Settings */}
        <View style={styles.section}>
          <SettingsRow label="Terms & Conditions" showChevron />
          <SettingsRow label="Privacy Statement" showChevron />
          <SettingsRow
            label="Opt-out of Sales and Targeted Advertising"
            showChevron
            hasBorder={false}
          />
        </View>
      </ScrollView>

      <BottomNav active={screen.activeTab ?? "Account"} color="#287dfa" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
