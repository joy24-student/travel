import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { UIScreen } from "../data/screens";
import { SettingsRow } from "../components/SettingsRow";
import { TopBar } from "./TopBar";
import { BottomNav, AiPill } from "./Navigation";

export function SettingsSpecializedScreen({ screen }: { screen: UIScreen }) {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <TopBar screen={screen} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Localization Settings */}
        <View style={styles.section}>
          <SettingsRow label="Language" value="English" />
          <SettingsRow label="Country or Region" value="United States" />
          <SettingsRow label="Currency" value="USD" />
          <SettingsRow label="Units" value="Imperial (miles, ft², lb)" />
          <SettingsRow label="Temperature Scale" value="Fahrenheit (°F)" />
          <SettingsRow
            label="Time format"
            value="12-hour (am/pm)"
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
            rightComponent={<DarkToggle />}
          />
          <SettingsRow label="Notifications" showChevron />
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

function DarkToggle() {
  return (
    <View
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        paddingHorizontal: 2,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#fff",
          marginLeft: 2,
        }}
      />
    </View>
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
