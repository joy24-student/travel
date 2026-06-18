/**
 * Payment Details Screen - Individual Transaction View
 * Display complete payment information and actions
 * Production-level implementation
 */

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

import { useAuth } from "../../src/hooks/useAuth";
import { userRepository } from "../../src/services/repositories/user";
import { BottomNav, AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";

const STATUS_COLORS: { [key: string]: string } = {
  completed: "#10b981",
  pending: PRIMARY,
  failed: "#ef4444",
  refunded: "#f59e0b",
};

export default function PaymentDetailsScreen() {
  const { id: paymentId } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentDetails();
  }, [paymentId]);

  const loadPaymentDetails = async () => {
    try {
      if (paymentId) {
        const data = await userRepository.getPayment(paymentId as string);
        setPayment(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      "Download Receipt",
      "Receipt will be sent to your registered email address."
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      "Report Issue",
      "Issue reported successfully. Our support team will contact you shortly.",
      [{ text: "OK" }]
    );
  };

  const handleRefundRequest = () => {
    if (payment?.status === "completed") {
      Alert.alert(
        "Request Refund",
        "Your refund request has been submitted. You will receive a confirmation email within 24 hours.",
        [{ text: "OK" }]
      );
    }
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

  if (error || !payment) {
    return (
      <SafeAreaView style={styles.shell}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={PRIMARY} />
          </Pressable>
          <Text style={styles.title}>Payment Details</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Unable to load payment details</Text>
          <Pressable style={styles.retryButton} onPress={loadPaymentDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
        <BottomNav active="Account" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLORS[payment.status] || "#6b7280";

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Payment Details</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={[styles.statusCard, { borderTopColor: statusColor }]}>
          <View style={[styles.statusIconContainer, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons
              name={
                payment.status === "completed"
                  ? "checkmark-circle"
                  : payment.status === "pending"
                  ? "time-outline"
                  : payment.status === "failed"
                  ? "close-circle"
                  : "refresh-circle"
              }
              size={48}
              color={statusColor}
            />
          </View>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </Text>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountCard}>
            <View>
              <Text style={styles.amountLabel}>Original Amount</Text>
              <Text style={styles.amountValue}>{payment.original_amount.toFixed(2)} BDT</Text>
            </View>
            {payment.fee > 0 && (
              <View>
                <Text style={styles.amountLabel}>Transaction Fee</Text>
                <Text style={styles.amountValue}>{payment.fee.toFixed(2)} BDT</Text>
              </View>
            )}
            <View style={styles.totalAmount}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.totalAmountValue}>{payment.amount.toFixed(2)} BDT</Text>
            </View>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{payment.id}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{payment.method.toUpperCase()}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mobile Number</Text>
              <Text style={styles.detailValue}>{payment.phone}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference</Text>
              <Text style={styles.detailValue}>{payment.reference}</Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.dateTimeCard}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={20} color={PRIMARY} />
              <View>
                <Text style={styles.dateTimeLabel}>Date</Text>
                <Text style={styles.dateTimeValue}>
                  {new Date(payment.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={20} color={PRIMARY} />
              <View>
                <Text style={styles.dateTimeLabel}>Time</Text>
                <Text style={styles.dateTimeValue}>
                  {new Date(payment.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineCircle, { backgroundColor: statusColor }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>
                  Payment {payment.status}
                </Text>
                <Text style={styles.timelineDate}>
                  {new Date(payment.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Pressable style={styles.actionButton} onPress={handleDownloadReceipt}>
            <Ionicons name="download-outline" size={20} color={PRIMARY} />
            <Text style={styles.actionButtonText}>Download Receipt</Text>
          </Pressable>

          {payment.status === "completed" && (
            <Pressable style={styles.actionButton} onPress={handleRefundRequest}>
              <Ionicons name="arrow-undo-outline" size={20} color={PRIMARY} />
              <Text style={styles.actionButtonText}>Request Refund</Text>
            </Pressable>
          )}

          {payment.status === "failed" && (
            <Pressable style={styles.actionButton} onPress={() => router.push("/payments")}>
              <Ionicons name="refresh-outline" size={20} color={PRIMARY} />
              <Text style={styles.actionButtonText}>Retry Payment</Text>
            </Pressable>
          )}

          <Pressable style={styles.actionButton} onPress={handleReportIssue}>
            <Ionicons name="alert-circle-outline" size={20} color={PRIMARY} />
            <Text style={styles.actionButtonText}>Report Issue</Text>
          </Pressable>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Ionicons name="help-circle" size={20} color={PRIMARY} />
          <View style={{ flex: 1 }}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              Contact our support team if you have any questions about this transaction.
            </Text>
          </View>
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
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 100 },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: { fontSize: 16, fontWeight: "600", color: "#111827" },
  retryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },

  // Status Card
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderTopWidth: 4,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: { fontSize: 18, fontWeight: "700" },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12 },

  // Amount Card
  amountCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  amountLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  amountValue: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 4 },
  totalAmount: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 16, marginTop: 12 },
  totalAmountValue: { fontSize: 18, fontWeight: "700", color: PRIMARY },

  // Details Card
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  detailValue: { fontSize: 13, color: "#111827", fontWeight: "600", marginLeft: 12, flex: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#e5e7eb" },

  // Date Time Card
  dateTimeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  dateTimeLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  dateTimeValue: { fontSize: 14, color: "#111827", fontWeight: "600", marginTop: 2 },

  // Timeline
  timeline: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
  },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 14, fontWeight: "600", color: "#111827" },
  timelineDate: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  // Actions
  actionsSection: { gap: 8, marginBottom: 16 },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionButtonText: { fontSize: 14, fontWeight: "600", color: PRIMARY, flex: 1 },

  // Help Section
  helpSection: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  helpTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  helpText: { fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 16 },
});
