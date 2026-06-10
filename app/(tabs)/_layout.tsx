import { Tabs, usePathname } from "expo-router";
import { View, StyleSheet } from "react-native";
import { BottomNav, AiPill } from "../../src/screens/Navigation";

export default function TabLayout() {
  const pathname = usePathname();

  // Determine active tab based on current path for the indicator animation
  let activeTab = "Home";
  if (pathname.includes("/messages")) activeTab = "Messages";
  else if (pathname.includes("/post")) activeTab = "Post";
  else if (pathname.includes("/trips")) activeTab = "My Trips";
  else if (pathname.includes("/account")) activeTab = "Account";
  else if (pathname.includes("/agency")) activeTab = "Agencies";

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // Hide the default system tab bar
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="post" />
        <Tabs.Screen name="trips" />
        <Tabs.Screen name="account" />
      </Tabs>

      {/* Render your custom navigation globally on top of the screens */}
      <AiPill color="#287dfa" />
      <BottomNav active={activeTab} color="#287dfa" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});