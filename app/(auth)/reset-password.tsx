import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Text } from "react-native";

import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "../../src/auth/schemas";
import { AuthScreenShell } from "../../src/components/AuthScreenShell";
import { AuthSubmitButton } from "../../src/components/AuthSubmitButton";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    email?: string;
    token_hash?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: params.email ?? "",
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const prepareRecoverySession = async () => {
      try {
        if (params.code) {
          await authService.exchangeCodeForSession(params.code);
          setSessionReady(true);
        } else if (params.token_hash) {
          await authService.verifyTokenHash(params.token_hash, "recovery");
          setSessionReady(true);
        }
      } catch (error) {
        Alert.alert(
          "Recovery link failed",
          error instanceof Error ? error.message : "Use the code instead.",
        );
      }
    };

    prepareRecoverySession();
  }, [params.code, params.token_hash]);

  const onSubmit = handleSubmit(async ({ email, token, password }) => {
    setLoading(true);
    try {
      if (!sessionReady && email && token) {
        await authService.verifyOtp(email, token, "recovery");
      }
      await authService.updatePassword(password);
      Alert.alert(
        "Password updated",
        "You can now sign in with your new password.",
      );
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Reset failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthScreenShell
      subtitle="Open the recovery link, or enter the recovery code, then set a new password."
      title="Reset Password"
    >
      {!sessionReady ? (
        <>
          <AuthTextField
            control={control}
            keyboardType="email-address"
            label="Email"
            name="email"
          />
          <AuthTextField
            control={control}
            keyboardType="number-pad"
            label="Recovery code"
            name="token"
          />
          <Text className="mb-4 text-xs leading-5 text-gray-500">
            If you opened the recovery link directly, you can leave these fields
            empty.
          </Text>
        </>
      ) : null}
      <AuthTextField
        control={control}
        label="New password"
        name="password"
        secureTextEntry
      />
      <AuthTextField
        control={control}
        label="Confirm new password"
        name="confirmPassword"
        secureTextEntry
      />
      <AuthSubmitButton
        label="Update password"
        loading={loading}
        onPress={onSubmit}
      />
    </AuthScreenShell>
  );
}
