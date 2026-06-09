import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { registerSchema, RegisterFormValues } from "../../src/auth/schemas";
import { AuthScreenShell } from "../../src/components/AuthScreenShell";
import { AuthSubmitButton } from "../../src/components/AuthSubmitButton";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(
    async ({ email, password, firstName, lastName }) => {
      setLoading(true);
      try {
        await authService.signUp(email, password, firstName, lastName);
        router.push({ pathname: "/email-verification", params: { email } });
      } catch (error) {
        Alert.alert(
          "Registration failed",
          error instanceof Error ? error.message : "Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
  );

  return (
    <AuthScreenShell
      subtitle="Create your account. Supabase will send an email verification code or link."
      title="Register"
    >
      <AuthTextField control={control} label="First name" name="firstName" />
      <AuthTextField control={control} label="Last name" name="lastName" />
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
      <AuthTextField
        control={control}
        label="Confirm password"
        name="confirmPassword"
        secureTextEntry
      />
      <AuthSubmitButton
        label="Create account"
        loading={loading}
        onPress={onSubmit}
      />
    </AuthScreenShell>
  );
}
