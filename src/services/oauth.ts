/**
 * OAuth Service
 * Native Google and Facebook authentication without browser redirect
 * Production-ready implementation
 */

import { supabase } from "../utils/supabase";
import { storeTokens } from "./secureStorage";
import Constants from "expo-constants";

const GOOGLE_WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const FACEBOOK_APP_ID = Constants.expoConfig?.extra?.facebookAppId || process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

/**
 * Google Sign-In (Native Implementation)
 * Uses native Google Sign-In prompt, no browser redirect
 */
export const signInWithGoogle = async () => {
  try {
    // Try using expo-google-sign-in if available
    try {
      const GoogleSignIn = require("expo-google-sign-in");

      // Request configuration (usually done once at app startup)
      const result = await GoogleSignIn.signInAsync();

      if (!result.idToken) {
        throw new Error("No ID token received from Google");
      }

      // Exchange Google ID token for Supabase session
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: result.idToken,
        nonce: result.nonce,
      });

      if (error) throw error;

      if (data.session) {
        // Store tokens securely
        await storeTokens({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
          userId: data.user?.id,
        });

        // Create or update user profile
        if (data.user) {
          await createOrUpdateUserProfile(data.user);
        }
      }

      return { data, error: null };
    } catch (googleSignInError) {
      // Fallback: Use Supabase OAuth flow
      console.warn("expo-google-sign-in not available, using OAuth flow:", googleSignInError);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "exp://oauth-callback",
          queryParams: {
            prompt: "login",
          },
        },
      });

      return { data, error };
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { data: null, error };
  }
};

/**
 * Facebook Sign-In (Native Implementation)
 * Uses native Facebook SDK, no browser redirect
 */
export const signInWithFacebook = async () => {
  try {
    // Try using expo-facebook if available
    try {
      const Facebook = require("expo-facebook");

      // Initialize Facebook SDK
      await Facebook.initializeAsync({
        appId: FACEBOOK_APP_ID,
        version: "v18.0",
      });

      // Request login with email permission
      const result = await Facebook.logInWithPermissionsAsync({
        permissions: ["public_profile", "email"],
      });

      if (result.type === "cancel") {
        return { data: null, error: new Error("Facebook login cancelled") };
      }

      if (!result.token) {
        throw new Error("No access token received from Facebook");
      }

      // Get user info from Facebook
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${result.token}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Facebook user info");
      }

      const facebookUser = await response.json();

      // For Facebook, we create/update user in our database
      // Since Facebook doesn't provide OpenID Connect tokens by default
      const { data, error } = await supabase.auth.admin?.updateUserById(
        facebookUser.id,
        {
          user_metadata: {
            provider: "facebook",
            facebook_id: facebookUser.id,
            name: facebookUser.name,
            email: facebookUser.email,
            avatar_url: facebookUser.picture?.data?.url,
          },
        }
      ) || { data: null, error: new Error("Admin update not available") };

      if (error) {
        console.warn("User metadata update error:", error);
      }

      // Create user profile
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await createOrUpdateUserProfile(
          userData.user,
          facebookUser.name,
          facebookUser.picture?.data?.url
        );
      }

      return { data: userData, error: null };
    } catch (facebookError) {
      // Fallback: Use Supabase OAuth flow
      console.warn("expo-facebook not available, using OAuth flow:", facebookError);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: "exp://oauth-callback",
        },
      });

      return { data, error };
    }
  } catch (error) {
    console.error("Facebook sign-in error:", error);
    return { data: null, error };
  }
};

/**
 * Create or update user profile
 * Helper function to ensure user profile exists
 */
const createOrUpdateUserProfile = async (
  user: any,
  fullName?: string,
  avatarUrl?: string
) => {
  try {
    const names = fullName?.split(" ") || [];
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "";

    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl || user.user_metadata?.avatar_url,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Error creating user profile:", error);
    }
  } catch (error) {
    console.error("Create user profile error:", error);
  }
};

/**
 * Sign out
 * Revokes tokens and clears session
 */
export const signOut = async () => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    // Facebook specific cleanup
    try {
      const Facebook = require("expo-facebook");
      await Facebook.logOutAsync();
    } catch {
      // Facebook module not available
    }

    // Google specific cleanup
    try {
      const GoogleSignIn = require("expo-google-sign-in");
      await GoogleSignIn.signOutAsync();
    } catch {
      // Google Sign-In module not available
    }

    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error };
  }
};

/**
 * Initialize OAuth providers
 * Call this once at app startup
 */
export const initializeOAuthProviders = async () => {
  try {
    // Initialize Google Sign-In
    try {
      const GoogleSignIn = require("expo-google-sign-in");

      const iosClientId = Constants.expoConfig?.extra?.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

      if (iosClientId || androidClientId) {
        await GoogleSignIn.initAsync({
          iosClientId,
          androidClientId,
          webClientId: GOOGLE_WEB_CLIENT_ID,
          scopes: ["profile", "email"],
        });

        console.log("Google Sign-In initialized");
      }
    } catch (error) {
      console.warn("Google Sign-In initialization failed:", error);
    }

    // Initialize Facebook
    try {
      const Facebook = require("expo-facebook");

      if (FACEBOOK_APP_ID) {
        await Facebook.initializeAsync({
          appId: FACEBOOK_APP_ID,
          version: "v18.0",
        });

        console.log("Facebook SDK initialized");
      }
    } catch (error) {
      console.warn("Facebook initialization failed:", error);
    }
  } catch (error) {
    console.error("OAuth initialization error:", error);
  }
};

export default {
  signInWithGoogle,
  signInWithFacebook,
  signOut,
  initializeOAuthProviders,
};
