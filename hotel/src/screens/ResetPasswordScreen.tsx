import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Create a new password for your account. Use at least 8 characters.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter password"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.passwordStrength}>
          <Text style={styles.strengthLabel}>Password Strength</Text>
          <View style={styles.strengthBarBackground}>
            <View style={styles.strengthBar} />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
          <Text style={styles.submitText}>Reset Password</Text>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  passwordStrength: {
    marginBottom: 24,
  },
  strengthLabel: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 10,
  },
  strengthBarBackground: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#0c1221",
  },
  strengthBar: {
    width: "60%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
