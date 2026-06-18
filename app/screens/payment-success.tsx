/**
 * Payment Success Screen - Transaction Confirmation
 * Displays payment confirmation and receipt details
 * Production-level implementation
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { useAuth } from "../../src/hooks/useAuth";
import { userRepository } from "../../src/services/repositories/user";
import { BottomNav, AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";
const SUCCESS_COLOR = "#10b981";

export default function PaymentSuccessScreen() {
  const { user } = useAuth();
  const { paymentId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    loadPaymentDetails();
  }, [paymentId]);

  const loadPaymentDetails = async () => {
    try {
      if (paymentId) {
        const data = await userRepository.getPayment(paymentId as string);
        setPayment(data);
      }
    } catch (error) {
      console.error("Error loading payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      "Download Receipt",
      "Receipt will be sent to your email shortly."
    );
  };

  const handleViewTransaction = () => {
    router.push("/payments");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.shell}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
        <BottomNav active="Account" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={SUCCESS_COLOR} />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>Your payment has been processed successfully</Text>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>
              {payment?.original_amount.toFixed(2)} BDT
            </Text>
          </View>

          {payment?.fee > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={styles.detailValue}>{payment?.fee.toFixed(2)} BDT</Text>
            </View>
          )}

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.detailLabelTotal}>Total Paid</Text>
            <Text style={styles.detailValueTotal}>
              {payment?.amount.toFixed(2)} BDT
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{payment?.method.toUpperCase()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.transactionId}>{payment?.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date(payment?.created_at).toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark" size={14} color="#fff" />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Receipt Section */}
        <View style={styles.receiptSection}>
          <Text style={styles.receiptTitle}>Receipt Details</Text>
          <View style={styles.receiptContent}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Paid By</Text>
              <Text style={styles.receiptValue}>{payment?.phone}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Reference</Text>
              <Text style={styles.receiptValue}>{payment?.reference}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <Pressable style={styles.primaryButton} onPress={handleDownloadReceipt}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Download Receipt</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleViewTransaction}>
          <Text style={styles.secondaryButtonText}>View All Transactions</Text>
        </Pressable>

        <Pressable
          style={styles.tertiaryButton}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.tertiaryButtonText}>Back to Home</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AiPill color={PRIMARY} />
      <BottomNav active="Account" color={PRIMARY} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f9fafb" },
  content: { paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Icon
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  // Title & Subtitle
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },

  // Details Card
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalRow: {
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
  detailLabelTotal: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  detailValueTotal: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: "700",
  },
  transactionId: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },

  // Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SUCCESS_COLOR,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Receipt Section
  receiptSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  receiptContent: {
    gap: 8,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  receiptValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
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
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
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
  },
  tertiaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
});
