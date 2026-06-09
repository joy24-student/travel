import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { emailOnlySchema, EmailOnlyFormValues } from "../../src/auth/schemas";
import { AuthScreenShell } from "../../src/components/AuthScreenShell";
import { AuthSubmitButton } from "../../src/components/AuthSubmitButton";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<EmailOnlyFormValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setLoading(true);
    try {
      await authService.resetPassword(email);
      Alert.alert(
        "Recovery sent",
        "Check your email for the password reset link or code.",
      );
      router.push({ pathname: "/reset-password", params: { email } });
    } catch (error) {
      Alert.alert(
        "Recovery failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthScreenShell
      subtitle="Supabase will email a secure recovery link for your account."
      title="Forgot Password"
    >
      <AuthTextField
        control={control}
        keyboardType="email-address"
        label="Email"
        name="email"
      />
      <AuthSubmitButton
        label="Send reset email"
        loading={loading}
        onPress={onSubmit}
      />
    </AuthScreenShell>
  );
}
