import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function OTPVerificationScreen() {
  const [code, setCode] = useState(["", "", "", ""]);

  const updateDigit = (index: number, value: string) => {
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to your registered email.
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => updateDigit(index, value)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              placeholder="•"
              placeholderTextColor="#94A3B8"
            />
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
          <Text style={styles.submitText}>Verify Code</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Didn’t receive the code? <Text style={styles.linkText}>Resend</Text>
        </Text>
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
    padding: 26,
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
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  codeInput: {
    width: 60,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  helpText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
  },
  linkText: {
    color: "#818CF8",
    fontWeight: "700",
  },
});
