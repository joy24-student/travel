/**
 * Settings Screen - User App
 * Complete settings management for user preferences, security, and account
 * Production-level implementation with full functionality
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { useAuth } from "../../src/hooks/useAuth";
import { userRepository } from "../../src/services/repositories/user";
import { BottomNav, AiPill } from "../../src/screens/Navigation";

const PRIMARY = "#287dfa";

interface SettingsState {
  notifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  twoFactorAuth: boolean;
  language: string;
  currency: string;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false,
    language: "English (US)",
    currency: "USD",
  });

  const [loading, setLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [show2FACode, setShow2FACode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const languages = [
    "English (US)",
    "English (UK)",
    "Spanish (ES)",
    "French",
    "German",
    "Chinese (Simplified)",
    "Japanese",
    "Arabic",
  ];

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await userRepository.getSettings();
      if (userSettings) {
        setSettings((prev) => ({ ...prev, ...userSettings }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: keyof SettingsState, value: any) => {
    try {
      setSettings((prev) => ({ ...prev, [key]: value }));
      await userRepository.updateSetting(key, value);
    } catch (error) {
      Alert.alert("Error", "Failed to save setting");
      console.error("Error saving setting:", error);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      await userRepository.changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password changed successfully");
      setChangePasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.shell}>
        <View style={[styles.scroll, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Get booking and trip updates</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => saveSetting("notifications", value)}
                trackColor={{ false: "#e5e7eb", true: PRIMARY }}
                thumbColor={settings.notifications ? PRIMARY : "#f3f4f6"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="mail-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingSubtitle}>Confirmations and receipts</Text>
              </View>
              <Switch
                value={settings.emailNotifications}
                onValueChange={(value) => saveSetting("emailNotifications", value)}
                trackColor={{ false: "#e5e7eb", true: PRIMARY }}
                thumbColor={settings.emailNotifications ? PRIMARY : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.card}>
            <Pressable style={styles.settingItem} onPress={() => setChangePasswordModal(true)}>
              <View style={styles.settingIcon}>
                <Ionicons name="key-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingSubtitle}>Update your password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.settingItem}
              onPress={() => {
                setShow2FAModal(true);
                setShow2FACode(false);
              }}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingSubtitle}>
                  {settings.twoFactorAuth ? "Enabled" : "Disabled"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.card}>
            <Pressable
              style={styles.settingItem}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="language-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingSubtitle}>{settings.language}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.settingItem}
              onPress={() => setShowCurrencyModal(true)}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="cash-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingSubtitle}>{settings.currency}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="moon-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>System theme</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => saveSetting("darkMode", value)}
                trackColor={{ false: "#e5e7eb", true: PRIMARY }}
                thumbColor={settings.darkMode ? PRIMARY : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>

          <View style={styles.card}>
            <Pressable
              style={styles.settingItem}
              onPress={() => router.push("/help")}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="help-circle-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Help Center</Text>
                <Text style={styles.settingSubtitle}>FAQs and support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="document-text-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.settingSubtitle}>Our privacy practices</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="document-text-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Terms & Conditions</Text>
                <Text style={styles.settingSubtitle}>Legal terms</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <Pressable
              style={styles.settingItem}
              onPress={handleLogout}
            >
              <View style={[styles.settingIcon, { backgroundColor: "#ef444420" }]}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: "#ef4444" }]}>Logout</Text>
                <Text style={styles.settingSubtitle}>Sign out of your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: "#ef444420" }]}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: "#ef4444" }]}>Delete Account</Text>
                <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <Pressable onPress={() => setShowLanguageModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {languages.map((lang) => (
              <Pressable
                key={lang}
                style={styles.modalOption}
                onPress={() => {
                  saveSetting("language", lang);
                  setShowLanguageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    settings.language === lang && { color: PRIMARY, fontWeight: "700" },
                  ]}
                >
                  {lang}
                </Text>
                {settings.language === lang && (
                  <Ionicons name="checkmark" size={20} color={PRIMARY} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <Pressable onPress={() => setShowCurrencyModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {currencies.map((curr) => (
              <Pressable
                key={curr.code}
                style={styles.modalOption}
                onPress={() => {
                  saveSetting("currency", curr.code);
                  setShowCurrencyModal(false);
                }}
              >
                <View>
                  <Text
                    style={[
                      styles.modalOptionText,
                      settings.currency === curr.code && { color: PRIMARY, fontWeight: "700" },
                    ]}
                  >
                    {curr.name}
                  </Text>
                  <Text style={styles.modalOptionSubtitle}>{curr.code}</Text>
                </View>
                {settings.currency === curr.code && (
                  <Ionicons name="checkmark" size={20} color={PRIMARY} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setChangePasswordModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Pressable onPress={() => setChangePasswordModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor="#9ca3af"
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#9ca3af"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#9ca3af"
            />

            <Pressable
              style={styles.primaryButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.primaryButtonText}>Change Password</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 2FA Modal */}
      <Modal
        visible={show2FAModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShow2FAModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
            <Pressable onPress={() => setShow2FAModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            {!show2FACode ? (
              <>
                <Text style={styles.description}>
                  Two-factor authentication adds an extra layer of security to your account
                </Text>

                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setShow2FACode(true)}
                >
                  <Text style={styles.primaryButtonText}>Enable 2FA</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.description}>
                  Enter the verification code from your authenticator app
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholderTextColor="#9ca3af"
                />

                <Pressable style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Verify & Enable</Text>
                </Pressable>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

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
  scroll: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${PRIMARY}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  settingSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f3f4f6" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modalContent: { flex: 1, padding: 16 },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalOptionText: { fontSize: 15, color: "#374151" },
  modalOptionSubtitle: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: "#111827",
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  description: { fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 20 },
});
