import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { AuthScreenShell } from "../../src/components/AuthScreenShell";
import { authService } from "../../src/services/auth";

export default function BiometricLoginScreen() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      await authService.signInWithBiometric();
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Biometric login unavailable",
        error instanceof Error
          ? error.message
          : "Passkeys are not available in this runtime. Try email login.",
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    setLoading(true);
    try {
      await authService.registerBiometric();
      Alert.alert(
        "Biometric login enabled",
        "This account can now sign in with its passkey.",
      );
    } catch (error) {
      Alert.alert(
        "Could not enable biometric login",
        error instanceof Error
          ? error.message
          : "Sign in first, then try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      subtitle="Use Supabase passkeys for device biometrics where WebAuthn is supported."
      title="Biometric Login"
    >
      <View className="gap-4">
        <Pressable
          className={`items-center rounded-xl px-4 py-4 ${loading ? "bg-blue-300" : "bg-blue-600"}`}
          disabled={loading}
          onPress={signIn}
        >
          <Text className="text-base font-extrabold text-white">
            {loading ? "Please wait..." : "Sign in with biometrics"}
          </Text>
        </Pressable>
        <Pressable
          className="items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-4"
          disabled={loading}
          onPress={register}
        >
          <Text className="font-extrabold text-blue-700">
            Enable biometrics for current account
          </Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
}
