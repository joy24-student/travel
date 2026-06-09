import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Pressable, Text } from "react-native";

import { otpSchema, OtpFormValues } from "../../src/auth/schemas";
import { AuthScreenShell } from "../../src/components/AuthScreenShell";
import { AuthSubmitButton } from "../../src/components/AuthSubmitButton";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

export default function OtpScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { control, getValues, handleSubmit } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { identifier: params.email ?? "", token: "" },
  });

  const sendCode = async () => {
    const identifier = getValues("identifier");
    if (!identifier) {
      Alert.alert(
        "Identifier required",
        "Enter your email or phone number before requesting a code.",
      );
      return;
    }
    setSending(true);
    try {
      await authService.sendOtp(identifier);
      Alert.alert("Code sent", "Check your email or phone for the login code.");
    } catch (error) {
      Alert.alert(
        "Could not send code",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const onSubmit = handleSubmit(async ({ identifier, token }) => {
    setLoading(true);
    try {
      const isPhone = /^\+?[0-9\s()-]+$/.test(identifier.trim());
      await authService.verifyOtp(identifier, token, isPhone ? "sms" : "email");
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "OTP failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthScreenShell
      subtitle="Request and verify a Supabase email or phone OTP."
      title="OTP Login"
    >
      <AuthTextField
        control={control}
        keyboardType="default"
        label="Email or phone"
        name="identifier"
      />
      <Pressable
        className={`mb-4 items-center rounded-xl border px-4 py-4 ${
          sending ? "border-gray-200 bg-gray-100" : "border-blue-200 bg-blue-50"
        }`}
        disabled={sending}
        onPress={sendCode}
      >
        <Text className="font-extrabold text-blue-700">
          {sending ? "Sending..." : "Send OTP"}
        </Text>
      </Pressable>
      <AuthTextField
        control={control}
        keyboardType="number-pad"
        label="Code"
        name="token"
      />
      <AuthSubmitButton
        label="Verify and sign in"
        loading={loading}
        onPress={onSubmit}
      />
    </AuthScreenShell>
  );
}
