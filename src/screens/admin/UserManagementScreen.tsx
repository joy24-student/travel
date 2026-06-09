/**
 * User Management Module - Admin Panel
 * Manage users, verifications, KYC, and suspensions
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
import { userManagementService, adminService } from "@/services/adminService";
import {
  UserAdminDetails,
  UserVerificationStatus,
  AdminUser,
} from "@/types/admin";

const { width } = Dimensions.get("window");

/**
 * User Verification Status Badge
 */
const VerificationBadge: React.FC<{ status: UserVerificationStatus }> = ({
  status,
}) => {
  const statusConfig: Record<
    UserVerificationStatus,
    { color: string; icon: string; label: string }
  > = {
    [UserVerificationStatus.VERIFIED]: {
      color: "#10b981",
      icon: "check-circle",
      label: "Verified",
    },
    [UserVerificationStatus.PENDING]: {
      color: "#f59e0b",
      icon: "clock",
      label: "Pending",
    },
    [UserVerificationStatus.REJECTED]: {
      color: "#ef4444",
      icon: "x-circle",
      label: "Rejected",
    },
    [UserVerificationStatus.MANUAL_REVIEW]: {
      color: "#8b5cf6",
      icon: "alert-circle",
      label: "Manual Review",
    },
  };

  const config = statusConfig[status];

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
 * User Card Component
 */
const UserCard: React.FC<{
  user: UserAdminDetails;
  onPress: (user: UserAdminDetails) => void;
}> = ({ user, onPress }) => {
  const statusColor = user.is_banned
    ? "#ef4444"
    : user.is_suspended
      ? "#f59e0b"
      : "#10b981";

  return (
    <TouchableOpacity onPress={() => onPress(user)}>
      <LinearGradient
        colors={["#ffffff", "#f9fafb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.userCard}
      >
        <View style={styles.userCardHeader}>
          <View style={styles.userAvatar}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <MaterialCommunityIcons name="account" size={24} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              User ID: {user.id.slice(0, 8)}...
            </Text>
            <VerificationBadge status={user.verification_status} />
          </View>
          <View
            style={[styles.statusIndicator, { backgroundColor: statusColor }]}
          />
        </View>

        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>KYC Status:</Text>
            <VerificationBadge status={user.kyc_status} />
          </View>

          {user.is_suspended && (
            <View
              style={[
                styles.detailRow,
                { paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
              ]}
            >
              <MaterialCommunityIcons name="alert" size={16} color="#f59e0b" />
              <Text style={styles.suspensionText}>
                Suspended: {user.suspension_reason}
              </Text>
            </View>
          )}

          {user.is_banned && (
            <View
              style={[
                styles.detailRow,
                { paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
              ]}
            >
              <MaterialCommunityIcons
                name="block-helper"
                size={16}
                color="#ef4444"
              />
              <Text style={styles.banText}>Banned: {user.ban_reason}</Text>
            </View>
          )}
        </View>

        <View style={styles.userCardFooter}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye-outline" size={16} color="#667eea" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={16}
              color="#667eea"
            />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

/**
 * User Action Modal
 */
const UserActionModal: React.FC<{
  visible: boolean;
  user: UserAdminDetails | null;
  onClose: () => void;
  onAction: (action: string, reason: string) => void;
}> = ({ visible, user, onClose, onAction }) => {
  const [selectedAction, setSelectedAction] = useState<
    "suspend" | "ban" | "verify" | null
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
            <Text style={styles.modalTitle}>User Actions</Text>
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
                    <Text style={styles.actionOptionTitle}>Verify User</Text>
                    <Text style={styles.actionOptionDesc}>
                      Mark user as verified
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
                    <Text style={styles.actionOptionTitle}>Suspend User</Text>
                    <Text style={styles.actionOptionDesc}>
                      Temporarily restrict access
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionOption}
                  onPress={() => setSelectedAction("ban")}
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
                    <Text style={styles.actionOptionTitle}>Ban User</Text>
                    <Text style={styles.actionOptionDesc}>
                      Permanently ban from platform
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  onPress={() => setSelectedAction(null)}
                  style={styles.backButton}
                >
                  <Ionicons name="chevron-back" size={20} color="#667eea" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>
                  {selectedAction === "verify" ? "Verify User" : ""}
                  {selectedAction === "suspend" ? "Suspend User" : ""}
                  {selectedAction === "ban" ? "Ban User" : ""}
                </Text>

                {selectedAction !== "verify" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reason</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter reason..."
                      value={reason}
                      onChangeText={setReason}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAction}
                >
                  <Text style={styles.confirmButtonText}>Confirm Action</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Main User Management Component
 */
export const UserManagementScreen: React.FC<{ admin: AdminUser | null }> = ({
  admin,
}) => {
  const [users, setUsers] = useState<UserAdminDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdminDetails | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "verified" | "pending"
  >("all");

  const loadUsers = async () => {
    try {
      const allUsers = await userManagementService.getAllUsers(100, 0);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleUserAction = async (action: string, reason: string) => {
    if (!selectedUser || !admin) return;

    try {
      let success = false;

      if (action === "suspend") {
        success = await userManagementService.suspendUser(
          selectedUser.user_id,
          reason,
          admin.id,
        );
      } else if (action === "ban") {
        success = await userManagementService.banUser(
          selectedUser.user_id,
          reason,
          admin.id,
        );
      } else if (action === "verify") {
        success = await userManagementService.suspendUser(
          selectedUser.user_id,
          "",
          admin.id,
        );
      }

      if (success) {
        Alert.alert("Success", "Action completed successfully");
        setModalVisible(false);
        await loadUsers();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to perform action");
      console.error("Error:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filterStatus === "verified")
      return user.verification_status === "verified";
    if (filterStatus === "pending")
      return user.verification_status === "pending";
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>{filteredUsers.length} users</Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["all", "verified", "pending"] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={(user) => {
              setSelectedUser(user);
              setModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-search-outline"
              size={48}
              color="#d1d5db"
            />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* Action Modal */}
      <UserActionModal
        visible={modalVisible}
        user={selectedUser}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
        onAction={handleUserAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },

  // Filter
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  filterTabActive: {
    backgroundColor: "#667eea",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterTabTextActive: {
    color: "#fff",
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // User Card
  userCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  userAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },

  // User Details
  userDetails: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  suspensionText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "500",
    marginLeft: 8,
  },
  banText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
    marginLeft: 8,
  },

  // Card Footer
  userCardFooter: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#667eea",
  },

  // List Content
  listContent: {
    paddingVertical: 8,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Modal Content
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  actionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionOptionContent: {
    flex: 1,
  },
  actionOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  actionOptionDesc: {
    fontSize: 12,
    color: "#6b7280",
  },

  // Back Button
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
    marginLeft: 4,
  },

  // Input
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1f2937",
    textAlignVertical: "top",
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: "#667eea",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 12,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default UserManagementScreen;
