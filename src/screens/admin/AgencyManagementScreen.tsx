/**
 * Agency Management Screen - Admin Panel
 * Manage agencies, verify, suspend, and monitor performance
 */

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { agencyManagementService, adminService } from "@/services/adminService";
import { AgencyAdminDetails, AdminUser } from "@/types/admin";

const { width } = Dimensions.get("window");

/**
 * Agency Status Badge
 */
const AgencyStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<
    string,
    { color: string; icon: string; label: string }
  > = {
    verified: {
      color: "#10b981",
      icon: "check-circle",
      label: "Verified",
    },
    pending: {
      color: "#f59e0b",
      icon: "clock",
      label: "Pending",
    },
    rejected: {
      color: "#ef4444",
      icon: "x-circle",
      label: "Rejected",
    },
    suspended: {
      color: "#8b5cf6",
      icon: "alert-circle",
      label: "Suspended",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${config.color}20`, borderColor: config.color },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={14}
        color={config.color}
      />
      <Text style={[styles.badgeText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

/**
 * Agency Card Component
 */
const AgencyCard: React.FC<{
  agency: AgencyAdminDetails;
  onPress: (agency: AgencyAdminDetails) => void;
}> = ({ agency, onPress }) => {
  const statusColor = agency.is_suspended
    ? "#8b5cf6"
    : agency.verification_status === "verified"
      ? "#10b981"
      : "#f59e0b";

  return (
    <TouchableOpacity onPress={() => onPress(agency)}>
      <LinearGradient
        colors={["#ffffff", "#f9fafb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.agencyCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardAvatar}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <MaterialCommunityIcons
                name="office-building"
                size={24}
                color="#fff"
              />
            </LinearGradient>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.agencyName} numberOfLines={1}>
              {agency.agency_name || "Agency"}
            </Text>
            <AgencyStatusBadge status={agency.verification_status} />
          </View>
          <View
            style={[styles.statusIndicator, { backgroundColor: statusColor }]}
          />
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="email" size={14} color="#6b7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {agency.registration_email}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={14} color="#6b7280" />
            <Text style={styles.detailText}>{agency.registration_phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#6b7280"
            />
            <Text style={styles.detailText}>{agency.registration_country}</Text>
          </View>
        </View>

        {agency.is_suspended && (
          <View
            style={[
              styles.detailRow,
              { paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
            ]}
          >
            <MaterialCommunityIcons name="alert" size={14} color="#f59e0b" />
            <Text style={styles.suspensionText}>
              Suspended: {agency.suspension_reason}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye-outline" size={16} color="#667eea" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="chart-line"
              size={16}
              color="#667eea"
            />
            <Text style={styles.actionButtonText}>Performance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={16}
              color="#667eea"
            />
            <Text style={styles.actionButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

/**
 * Agency Action Modal
 */
const AgencyActionModal: React.FC<{
  visible: boolean;
  agency: AgencyAdminDetails | null;
  onClose: () => void;
  onAction: (action: string, reason?: string) => void;
}> = ({ visible, agency, onClose, onAction }) => {
  const [selectedAction, setSelectedAction] = useState<
    "verify" | "suspend" | "reject" | null
  >(null);
  const [reason, setReason] = useState("");

  const handleAction = () => {
    if (selectedAction) {
      onAction(selectedAction, reason);
      setReason("");
      setSelectedAction(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agency Actions</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {!selectedAction ? (
              <View>
                <Text style={styles.sectionTitle}>Select Action</Text>

                <TouchableOpacity
                  style={styles.actionOption}
                  onPress={() => setSelectedAction("verify")}
                >
                  <LinearGradient
                    colors={["#43e97b", "#38f9d7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionOptionIcon}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.actionOptionContent}>
                    <Text style={styles.actionOptionTitle}>Verify Agency</Text>
                    <Text style={styles.actionOptionDesc}>
                      Approve agency and enable operations
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionOption}
                  onPress={() => setSelectedAction("suspend")}
                >
                  <LinearGradient
                    colors={["#f59e0b", "#f97316"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionOptionIcon}
                  >
                    <MaterialCommunityIcons
                      name="pause-circle"
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.actionOptionContent}>
                    <Text style={styles.actionOptionTitle}>Suspend Agency</Text>
                    <Text style={styles.actionOptionDesc}>
                      Temporarily disable agency
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionOption}
                  onPress={() => setSelectedAction("reject")}
                >
                  <LinearGradient
                    colors={["#ef4444", "#dc2626"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionOptionIcon}
                  >
                    <MaterialCommunityIcons
                      name="block-helper"
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.actionOptionContent}>
                    <Text style={styles.actionOptionTitle}>Reject Agency</Text>
                    <Text style={styles.actionOptionDesc}>
                      Reject verification application
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>
                  {selectedAction === "verify"
                    ? "Verify Agency"
                    : selectedAction === "suspend"
                      ? "Suspend Agency"
                      : "Reject Agency"}
                </Text>
                <Text style={styles.reasonLabel}>Reason/Notes (Optional)</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Enter reason or notes..."
                  placeholderTextColor="#9ca3af"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setSelectedAction(null)}
                  >
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={handleAction}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Agency Management Screen
 */
export const AgencyManagementScreen: React.FC<{ admin: AdminUser | null }> = ({
  admin,
}) => {
  const [agencies, setAgencies] = useState<AgencyAdminDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgency, setSelectedAgency] =
    useState<AgencyAdminDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      // TODO: Implement getAllAgencies in agencyManagementService
      // For now, use empty array
      setAgencies([]);
    } catch (error) {
      console.error("Error loading agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgencies();
    setRefreshing(false);
  };

  const handleAgencyPress = (agency: AgencyAdminDetails) => {
    setSelectedAgency(agency);
    setModalVisible(true);
  };

  const handleAgencyAction = async (action: string, reason?: string) => {
    if (!selectedAgency || !admin) return;

    try {
      let success = false;
      switch (action) {
        case "verify":
          success = await agencyManagementService.verifyAgency(
            selectedAgency.agency_id,
            admin.id,
          );
          break;
        case "suspend":
          success = await agencyManagementService.suspendAgency(
            selectedAgency.agency_id,
            reason || "Suspended by admin",
            admin.id,
          );
          break;
        case "reject":
          // TODO: Implement reject action in service
          success = true;
          break;
      }

      if (success) {
        Alert.alert("Success", `Agency ${action} successful`);
        setModalVisible(false);
        await loadAgencies();
      } else {
        Alert.alert("Error", `Failed to ${action} agency`);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while processing the action");
      console.error("Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Agency Management</Text>
        <Text style={styles.headerSubtitle}>Manage and monitor agencies</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          data={agencies}
          renderItem={({ item }) => (
            <AgencyCard agency={item} onPress={handleAgencyPress} />
          )}
          keyExtractor={(item) => item.agency_id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="office-building"
                size={64}
                color="#d1d5db"
              />
              <Text style={styles.emptyText}>No agencies found</Text>
            </View>
          }
        />
      )}

      <AgencyActionModal
        visible={modalVisible}
        agency={selectedAgency}
        onClose={() => {
          setModalVisible(false);
          setSelectedAgency(null);
        }}
        onAction={handleAgencyAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ffffff80",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 15,
  },
  agencyCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  agencyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  suspensionText: {
    fontSize: 12,
    color: "#f59e0b",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#667eea",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  actionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
  },
  actionOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionOptionContent: {
    flex: 1,
  },
  actionOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  actionOptionDesc: {
    fontSize: 12,
    color: "#6b7280",
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#1f2937",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default AgencyManagementScreen;
