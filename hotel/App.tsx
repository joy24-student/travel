import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChatScreen,
  ContactSupportScreen,
  DashboardScreen,
  EarningsOverviewScreen,
  GuestDetailsScreen,
  HousekeepingScreen,
  CustomerProfileScreen,
  LoginDevicesScreen,
  MaintenanceScreen,
  MessagesScreen,
  OTPVerificationScreen,
  ReportsAnalyticsScreen,
  ResetPasswordScreen,
  ReservationsScreen,
  RoomManagementScreen,
  SettingsScreen,
  StaffManagementScreen,
  TwoFactorAuthenticationScreen,
} from "./src/screens";

const routeItems = [
  { id: "dashboard", label: "Dashboard", component: DashboardScreen },
  { id: "reservations", label: "Reservations", component: ReservationsScreen },
  {
    id: "roomManagement",
    label: "Room Management",
    component: RoomManagementScreen,
  },
  { id: "guestDetails", label: "Guest Details", component: GuestDetailsScreen },
  { id: "earnings", label: "Earnings", component: EarningsOverviewScreen },
  { id: "messages", label: "Messages", component: MessagesScreen },
  { id: "chat", label: "Chat", component: ChatScreen },
  { id: "housekeeping", label: "Housekeeping", component: HousekeepingScreen },
  { id: "maintenance", label: "Maintenance", component: MaintenanceScreen },
  { id: "analytics", label: "Reports", component: ReportsAnalyticsScreen },
  { id: "settings", label: "Settings", component: SettingsScreen },
  { id: "support", label: "Support", component: ContactSupportScreen },
  { id: "devices", label: "Devices", component: LoginDevicesScreen },
  { id: "otp", label: "OTP", component: OTPVerificationScreen },
  {
    id: "resetPassword",
    label: "Reset Password",
    component: ResetPasswordScreen,
  },
  {
    id: "twoFactor",
    label: "Two-Factor",
    component: TwoFactorAuthenticationScreen,
  },
  { id: "staff", label: "Staff Management", component: StaffManagementScreen },
  {
    id: "customerProfile",
    label: "Customer Profile",
    component: CustomerProfileScreen,
  },
];

export default function App() {
  const [active, setActive] = useState(routeItems[0]);
  const ActiveScreen = active.component;

  // Mock navigation object to work with your custom state logic
  const customNavigation = {
    navigate: (routeId: string, params: any) => {
      const target = routeItems.find((r) => r.id === routeId);
      if (target) {
        setActive({ ...target, params }); // Set active screen and store params
      }
    },
    goBack: () => setActive(routeItems[5]), // Example: return to Messages
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationPanel}>
        <Text style={styles.navTitle}>Hotel UI</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.navList}
        >
          {routeItems.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.navButton,
                active.id === route.id && styles.navButtonActive,
              ]}
              onPress={() => setActive(route)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.navLabel,
                  active.id === route.id && styles.navLabelActive,
                ]}
              >
                {route.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.screenContainer}>
        <ActiveScreen
          navigation={customNavigation}
          route={{ params: (active as any).params }}
        />
        <StatusBar style="light" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  navigationPanel: {
    width: 220,
    backgroundColor: "#070B18",
    paddingTop: 48,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: "#111827",
  },
  navTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
  },
  navList: {
    paddingBottom: 40,
  },
  navButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "#111827",
  },
  navButtonActive: {
    backgroundColor: "#4F46E5",
  },
  navLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "700",
  },
  navLabelActive: {
    color: "#fff",
  },
  screenContainer: {
    flex: 1,
    backgroundColor: "#0b1326",
  },
});
