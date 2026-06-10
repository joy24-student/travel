/**
 * Supabase Client Configuration
 * Production-ready setup with automatic token refresh
 */

import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Custom auth storage using Expo SecureStore
 * Provides encrypted local storage for sensitive tokens
 */
const authStorage = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("SecureStore getItem error:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore setItem error:", error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore removeItem error:", error);
    }
  },
};

/**
 * Initialize Supabase client
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Setup automatic token refresh interceptor
 * Refreshes JWT 5 minutes before expiration
 */
export const setupTokenRefreshInterceptor = () => {
  let refreshTimeout: NodeJS.Timeout | null = null;

  const scheduleRefresh = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.warn("No active session for token refresh");
        return;
      }

      const { expires_at } = session;

      if (!expires_at) return;

      // Calculate time until expiry (in seconds)
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = expires_at - now;

      // Refresh 5 minutes before expiry
      const refreshTime = Math.max((expiresIn - 300) * 1000, 0);

      if (refreshTimeout) clearTimeout(refreshTimeout);

      refreshTimeout = setTimeout(async () => {
        try {
          const { error } = await supabase.auth.refreshSession();

          if (error) {
            console.error("Token refresh error:", error);
          } else {
            console.log("Token refreshed successfully");
            scheduleRefresh();
          }
        } catch (error) {
          console.error("Token refresh interceptor error:", error);
        }
      }, refreshTime);
    } catch (error) {
      console.error("Schedule refresh error:", error);
    }
  };

  // Listen to auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        scheduleRefresh();
      } else if (event === "SIGNED_OUT") {
        if (refreshTimeout) clearTimeout(refreshTimeout);
      } else if (event === "TOKEN_REFRESHED" && session) {
        scheduleRefresh();
      }
    }
  );

  // Initial schedule
  scheduleRefresh();

  // Return cleanup function
  return () => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    if (subscription) subscription.unsubscribe();
  };
};

/**
 * Get current user from session
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

/**
 * Get current session
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Get current session error:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export default supabase;
