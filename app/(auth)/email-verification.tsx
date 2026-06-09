import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Pressable, Text } from "react-native";

import { otpSchema, OtpFormValues } from "../../src/auth/schemas";
import { AuthScreenShell } from "../../src/components/AuthScreenShell";
import { AuthSubmitButton } from "../../src/components/AuthSubmitButton";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

export default function EmailVerificationScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    email?: string;
    token_hash?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { control, getValues, handleSubmit } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { identifier: params.email ?? "", token: "" },
  });

  useEffect(() => {
    const confirmFromLink = async () => {
      try {
        if (params.code) {
          await authService.exchangeCodeForSession(params.code);
          router.replace("/(tabs)");
        } else if (params.token_hash) {
          await authService.verifyTokenHash(params.token_hash, "signup");
          router.replace("/(tabs)");
        }
      } catch (error) {
        Alert.alert(
          "Verification failed",
          error instanceof Error ? error.message : "Please enter the code.",
        );
      }
    };

    confirmFromLink();
  }, [params.code, params.token_hash]);

  const resend = async () => {
    const identifier = getValues("identifier");
    if (!identifier) {
      Alert.alert(
        "Email required",
        "Enter your email before resending verification.",
      );
      return;
    }
    setResending(true);
    try {
      await authService.resendEmailVerification(identifier);
      Alert.alert(
        "Verification sent",
        "Check your email for a new verification message.",
      );
    } catch (error) {
      Alert.alert(
        "Could not resend",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const onSubmit = handleSubmit(async ({ identifier, token }) => {
    setLoading(true);
    try {
      await authService.verifyOtp(identifier, token, "signup");
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Verification failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthScreenShell
      subtitle="Confirm the signup code from your Supabase verification email."
      title="Email Verification"
    >
      <AuthTextField
        control={control}
        keyboardType="email-address"
        label="Email"
        name="identifier"
      />
      <AuthTextField
        control={control}
        keyboardType="number-pad"
        label="Verification code"
        name="token"
      />
      <AuthSubmitButton
        label="Verify email"
        loading={loading}
        onPress={onSubmit}
      />
      <Pressable
        className="mt-4 items-center rounded-xl border border-gray-200 bg-white px-4 py-4"
        onPress={resend}
      >
        <Text className="font-extrabold text-gray-800">
          {resending ? "Resending..." : "Resend verification"}
        </Text>
      </Pressable>
    </AuthScreenShell>
  );
}
