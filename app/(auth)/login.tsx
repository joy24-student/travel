import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Linking, Text, View, Pressable } from "react-native";

import { loginSchema, LoginFormValues } from "../../src/auth/schemas";
import { AuthScreenShell } from "../../src/components/AuthScreenShell";
import { AuthSubmitButton } from "../../src/components/AuthSubmitButton";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

const socialProviders: Array<{
  label: string;
  provider: "google" | "facebook";
  color: string;
}> = [
  { label: "Continue with Google", provider: "google", color: "#4285F4" },
  { label: "Continue with Facebook", provider: "facebook", color: "#1877F2" },
];

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  });

  const onSocialSignIn = async (provider: "google" | "facebook") => {
    setSocialLoading(provider);
    try {
      const { url } = await authService.signInWithOAuth(provider);
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Social login", "Unable to start authentication flow.");
      }
    } catch (error) {
      Alert.alert(
        "Social login failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <AuthScreenShell
      footer={
        <View className="gap-3">
          <Link
            className="text-center text-sm font-bold text-blue-600"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
          <Link
            className="text-center text-sm font-bold text-blue-600"
            href="/register"
          >
            Create an account
          </Link>
          <Link
            className="text-center text-sm font-bold text-blue-600"
            href="/biometric-login"
          >
            Use biometric login
          </Link>
        </View>
      }
      subtitle="Sign in with your Supabase email/password, phone OTP, or social login."
      title="Login"
    >
      <AuthTextField
        control={control}
        keyboardType="email-address"
        label="Email"
        name="email"
      />
      <AuthTextField
        control={control}
        label="Password"
        name="password"
        secureTextEntry
      />
      <AuthSubmitButton label="Sign in" loading={loading} onPress={onSubmit} />
      <Text className="mt-4 text-center text-sm text-gray-500">
        Prefer a code?{" "}
        <Link className="font-bold text-blue-600" href="/otp">
          Sign in with OTP
        </Link>
      </Text>
      <Text className="mt-6 text-center text-sm uppercase tracking-[0.25rem] text-gray-400">
        Or continue with
      </Text>
      <View className="mt-4 space-y-3">
        {socialProviders.map((provider) => (
          <Pressable
            key={provider.provider}
            onPress={() => onSocialSignIn(provider.provider)}
            disabled={socialLoading !== null}
            className={`rounded-xl px-4 py-4 ${provider.provider === socialLoading ? "bg-gray-300" : "bg-[#f8fafc]"}`}
          >
            <Text
              className="text-center text-base font-extrabold"
              style={{ color: provider.color }}
            >
              {socialLoading === provider.provider
                ? `Connecting to ${provider.label.split(" ")[2]}...`
                : provider.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </AuthScreenShell>
  );
}
