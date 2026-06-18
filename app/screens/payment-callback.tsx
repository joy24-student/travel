/**
 * Payment Callback Screen
 * Handles redirects from payment gateways (bKash, Nagad)
 */

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { paymentService } from "../../src/services/paymentService";
import { userRepository } from "../../src/services/repositories/user";

const PRIMARY = "#287dfa";

export default function PaymentCallbackScreen() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const { method, paymentID, status: paymentStatus, paymentId } = params;
      
      if (!method || (!paymentID && !paymentId)) {
        setStatus("failed");
        setMessage("Invalid payment callback");
        return;
      }

      const transactionId = (paymentID || paymentId) as string;
      const paymentMethod = method as string;

      // Verify with payment provider
      const verifiedStatus = await paymentService.verify(
        paymentMethod as any,
        transactionId
      );

      // Update payment in database
      const payment = await userRepository.getPayments();
      const currentPayment = payment.find(p => p.transaction_id === transactionId);

      if (currentPayment) {
        await userRepository.updatePaymentStatus(currentPayment.id, verifiedStatus);
      }

      if (verifiedStatus === "completed") {
        setStatus("success");
        setMessage("Payment completed successfully!");
      } else if (verifiedStatus === "failed") {
        setStatus("failed");
        setMessage("Payment failed. Please try again.");
      } else {
        setStatus("success");
        setMessage(`Payment status: ${verifiedStatus}`);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("failed");
      setMessage("Failed to verify payment");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === "verifying" && (
          <>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.title}>Verifying Payment</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}

        {status === "success" && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>
            <Text style={[styles.title, { color: "#10b981" }]}>Success!</Text>
            <Text style={styles.message}>{message}</Text>
            <Pressable style={[styles.button, { backgroundColor: PRIMARY }]} onPress={() => router.replace("/screens/payments")}>
              <Text style={styles.buttonText}>View Payments</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.buttonSecondaryText}>Go to Home</Text>
            </Pressable>
          </>
        )}

        {status === "failed" && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={80} color="#ef4444" />
            </View>
            <Text style={[styles.title, { color: "#ef4444" }]}>Payment Failed</Text>
            <Text style={styles.message}>{message}</Text>
            <Pressable style={[styles.button, { backgroundColor: PRIMARY }]} onPress={() => router.replace("/screens/payments")}>
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.buttonSecondaryText}>Go to Home</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: { marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginTop: 16,
  },
  message: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  buttonSecondary: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonSecondaryText: { fontSize: 15, fontWeight: "600", color: PRIMARY },
});
