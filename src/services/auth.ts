import { supabase } from "../utils/supabase";

export type EmailOtpType = "email" | "sms" | "signup" | "recovery";

const authRedirectTo = (path: string) => {
  const baseUrl = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
  return baseUrl ? `${baseUrl}${path}` : undefined;
};

export const authService = {
  // Sign up with email
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: authRedirectTo("/email-verification"),
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Send a passwordless email or phone OTP for sign in
  async sendOtp(identifier: string) {
    const isPhone = /^\+?[0-9\s()-]+$/.test(identifier.trim());
    const payload = isPhone
      ? { phone: identifier.trim() }
      : { email: identifier.trim() };

    const options = isPhone
      ? { shouldCreateUser: false }
      : { shouldCreateUser: false, emailRedirectTo: authRedirectTo("/otp") };

    const { data, error } = await supabase.auth.signInWithOtp({
      ...payload,
      options,
    });

    if (error) throw error;
    return data;
  },

  // Verify OTP codes for email or phone sign in
  async verifyOtp(identifier: string, token: string, type: EmailOtpType) {
    const isPhone = /^\+?[0-9\s()-]+$/.test(identifier.trim());
    const payload = isPhone
      ? { phone: identifier.trim() }
      : { email: identifier.trim() };

    const { data, error } = await supabase.auth.verifyOtp({
      ...payload,
      token,
      type,
    });

    if (error) throw error;
    return data;
  },

  // Resend signup email verification
  async resendEmailVerification(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: authRedirectTo("/email-verification"),
      },
    });

    if (error) throw error;
    return data;
  },

  // Exchange an auth callback code from a Supabase email link
  async exchangeCodeForSession(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data;
  },

  // Verify token_hash links from Supabase emails
  async verifyTokenHash(tokenHash: string, type: EmailOtpType) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) throw error;
    return data;
  },

  // Sign in with OAuth (Google, Facebook, etc)
  async signInWithOAuth(provider: "google" | "facebook" | "apple") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectTo("/reset-password"),
    });

    if (error) throw error;
    return data;
  },

  // Sign in with a passkey. On supported devices this can invoke Face ID,
  // Touch ID, Windows Hello, Android biometrics, or another platform authenticator.
  async signInWithBiometric() {
    const { data, error } = await supabase.auth.signInWithPasskey();
    if (error) throw error;
    return data;
  },

  // Register a passkey for the current signed-in user
  async registerBiometric() {
    const { data, error } = await supabase.auth.registerPasskey();
    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      if (error.message?.includes("Auth session missing")) return null;
      throw error;
    }
    return user;
  },

  // Get current session
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      if (error.message?.includes("Auth session missing")) return null;
      throw error;
    }
    return session;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (isAuthenticated: boolean, user: any) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuthenticated = !!session?.user;
      callback(isAuthenticated, session?.user);
    });

    return () => subscription?.unsubscribe();
  },
};
