import "../global.css";

import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { AuthProvider } from "../src/auth/context";
import { useAuth } from "../src/hooks/useAuth";
import { supabase } from "../src/utils/supabase";
import { initializeOAuthProviders } from "../src/services/oauth";

WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync().catch(console.error);

const RootLayoutContent = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Initialize OAuth providers when the app loads
    initializeOAuthProviders().catch(console.error);
    
    if (!loading) SplashScreen.hideAsync().catch(console.error);
  }, [loading]);

  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (!url.includes("auth/callback")) return;
      const code = new URL(url).searchParams.get("code");
      if (code) await supabase.auth.exchangeCodeForSession(code);
    };
    const sub = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => { if (url) handleUrl({ url }); });
    return () => sub.remove();
  }, []);

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      {isAuthenticated ? (
        // Authenticated user - show protected screens
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      ) : (
        // Unauthenticated - show auth screens
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      )}

      {/* Index screen - shouldn't normally render */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

/**
 * Root Layout Export
 * Wraps the app with AuthProvider and handles layout switching
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}