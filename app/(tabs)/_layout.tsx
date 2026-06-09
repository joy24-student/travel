import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../src/hooks/useAuth";

const PRIMARY = "#287dfa";

export default function TabsLayout() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading]);

  if (loading || !isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-trip-bg items-center justify-center">
        <ActivityIndicator size="large" color={PRIMARY} />
        <View className="mt-4" />
      </SafeAreaView>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eef2f7",
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 8,
          height: 72,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "My Trips",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Agency sub-screens — hidden from tab bar */}
      <Tabs.Screen name="agency/index" options={{ href: null }} />
      <Tabs.Screen name="agency/[id]" options={{ href: null }} />
      <Tabs.Screen name="agency/packages" options={{ href: null }} />
      <Tabs.Screen name="agency/reviews" options={{ href: null }} />
      <Tabs.Screen name="agency/live" options={{ href: null }} />
      <Tabs.Screen name="agency/contact" options={{ href: null }} />
    </Tabs>
  );
}
