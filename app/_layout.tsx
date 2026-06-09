import "../global.css";

import { StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import SplashScreen from "../src/screens/SplashScreen";
import { useSplashScreen } from "../src/hooks/useSplashScreen";

export default function RootLayout() {
  const { isSplashVisible, hideSplash } = useSplashScreen();

  if (isSplashVisible) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SplashScreen onFinish={hideSplash} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      />
    </SafeAreaProvider>
  );
}
