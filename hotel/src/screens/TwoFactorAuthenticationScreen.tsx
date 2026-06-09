import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export function TwoFactorAuthenticationScreen() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [authAppEnabled, setAuthAppEnabled] = useState(false);

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Protect your hotel admin account with an extra layer of security.
        </Text>

        <View style={styles.optionRow}>
          <View>
            <Text style={styles.optionLabel}>SMS Verification</Text>
            <Text style={styles.optionDescription}>
              Receive codes on your phone.
            </Text>
          </View>
          <Switch
            value={smsEnabled}
            onValueChange={setSmsEnabled}
            trackColor={{ true: "#6366F1", false: "#374151" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.optionRow}>
          <View>
            <Text style={styles.optionLabel}>Authenticator App</Text>
            <Text style={styles.optionDescription}>
              Use Google Authenticator or similar.
            </Text>
          </View>
          <Switch
            value={authAppEnabled}
            onValueChange={setAuthAppEnabled}
            trackColor={{ true: "#6366F1", false: "#374151" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Recovery Codes</Text>
          <Text style={styles.detailsText}>
            Keep these codes safe in case you lose access to your phone.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <Text style={styles.secondaryText}>Show Recovery Codes</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
          <Text style={styles.primaryText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0b1326",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  optionLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionDescription: {
    color: "#94A3B8",
    fontSize: 12,
  },
  detailsCard: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },
  detailsTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  detailsText: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
