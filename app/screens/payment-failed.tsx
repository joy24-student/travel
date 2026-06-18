/**
 * Payment Failed Screen - Transaction Failure
 * Displays payment failure details and retry options
 * Production-level implementation
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { BottomNav, AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";
const ERROR_COLOR = "#ef4444";

export default function PaymentFailedScreen() {
  const { reason, amount, method } = useLocalSearchParams();

  const failureReasons: { [key: string]: { title: string; message: string } } = {
    insufficient_funds: {
      title: "Insufficient Funds",
      message: "Your account does not have enough balance for this transaction. Please try with a smaller amount or use a different payment method.",
    },
    invalid_credentials: {
      title: "Invalid Credentials",
      message: "The credentials you provided are incorrect. Please verify and try again.",
    },
    network_error: {
      title: "Network Error",
      message: "A network error occurred during the transaction. Please check your connection and try again.",
    },
    timeout: {
      title: "Transaction Timeout",
      message: "The payment gateway did not respond in time. Please try again.",
    },
    user_cancelled: {
      title: "Payment Cancelled",
      message: "You cancelled the payment. Your account has not been charged.",
    },
    fraud_detected: {
      title: "Fraud Detection",
      message: "The transaction was declined due to security concerns. Please contact support.",
    },
    service_unavailable: {
      title: "Service Unavailable",
      message: "The payment service is currently unavailable. Please try again later.",
    },
  };

  const failureInfo = failureReasons[reason as string] || {
    title: "Payment Failed",
    message: "The transaction could not be completed. Please try again.",
  };

  const handleRetryPayment = () => {
    router.push({
      pathname: "/payments",
      params: { retryAmount: amount, retryMethod: method },
    });
  };

  const handleContactSupport = () => {
    router.push("/help");
  };

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Payment Failed</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.errorIconBg}>
            <Ionicons name="close-circle" size={80} color={ERROR_COLOR} />
          </View>
        </View>

        {/* Failure Title & Message */}
        <Text style={styles.failureTitle}>{failureInfo.title}</Text>
        <Text style={styles.failureMessage}>{failureInfo.message}</Text>

        {/* Error Details Card */}
        <View style={styles.detailsCard}>
          {amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Attempted Amount</Text>
              <Text style={styles.detailValue}>{amount} BDT</Text>
            </View>
          )}

          {method && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{(method as string).toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Charge Status</Text>
            <Text style={styles.notChargedText}>✓ Not Charged</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>What you can do:</Text>
          <View style={styles.recommendationItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.recommendationText}>
              Verify your payment method details and try again
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.recommendationText}>
              Try a different payment method
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.recommendationText}>
              Check your account balance or credit limit
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.recommendationText}>
              Contact your bank or payment provider
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <Pressable style={styles.primaryButton} onPress={handleRetryPayment}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleContactSupport}>
          <Ionicons name="help-circle-outline" size={20} color={PRIMARY} />
          <Text style={styles.secondaryButtonText}>Contact Support</Text>
        </Pressable>

        <Pressable
          style={styles.tertiaryButton}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.tertiaryButtonText}>Back to Home</Text>
        </Pressable>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#10b981" />
          <Text style={styles.securityText}>
            No charges were made. Your payment is secure.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AiPill color={PRIMARY} />
      <BottomNav active="Account" color={PRIMARY} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827", flex: 1, textAlign: "center" },
  spacer: { width: 32 },
  content: { paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 100 },

  // Icon
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  errorIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${ERROR_COLOR}10`,
    justifyContent: "center",
    alignItems: "center",
  },

  // Title & Message
  failureTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: ERROR_COLOR,
    textAlign: "center",
    marginBottom: 8,
  },
  failureMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  // Details Card
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: ERROR_COLOR,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  notChargedText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "600",
  },

  // Recommendations
  recommendationsCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ERROR_COLOR,
    marginTop: 6,
    flexShrink: 0,
  },
  recommendationText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    flex: 1,
  },

  // Buttons
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: `${PRIMARY}15`,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "700",
  },
  tertiaryButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  tertiaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },

  // Security Badge
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "500",
    flex: 1,
  },
});
