import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsRow } from "./SettingsRow";

interface SettingsScreenProps {
  title: string;
}

export function SettingsScreen({ title }: SettingsScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

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
          <SettingsRow label="Manage my account" value="" showChevron />
          <SettingsRow
            label="Scan QR Code"
            value=""
            showChevron
            hasBorder={false}
          />
        </View>

        <View style={styles.separator} />

        {/* Interface Settings */}
        <View style={styles.section}>
          <SettingsRow
            label="Dark Theme"
            value=""
            rightComponent={<DarkToggle />}
            showChevron={false}
          />
          <SettingsRow label="Notifications" value="" showChevron />
          <SettingsRow
            label="Accessibility"
            value=""
            showChevron
            hasBorder={false}
          />
        </View>

        <View style={styles.separator} />

        {/* Legal Settings */}
        <View style={styles.section}>
          <SettingsRow label="Terms & Conditions" value="" showChevron />
          <SettingsRow label="Privacy Statement" value="" showChevron />
          <SettingsRow
            label="Opt-out of Sales and Targeted Advertising"
            value=""
            showChevron
            hasBorder={false}
          />
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1e293b",
  },
  placeholder: {
    width: 24,
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
