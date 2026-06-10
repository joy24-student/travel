/**
 * Secure Storage Utilities
 * Handles encrypted token storage using Expo SecureStore
 */

import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  EXPIRES_AT: "auth_expires_at",
  USER_ID: "auth_user_id",
};

export interface TokenData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  userId?: string;
}

/**
 * Store tokens securely
 */
export const storeTokens = async (tokens: TokenData): Promise<void> => {
  try {
    if (tokens.accessToken) {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    if (tokens.expiresAt) {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.EXPIRES_AT,
        tokens.expiresAt.toString()
      );
    }
    if (tokens.userId) {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, tokens.userId);
    }
  } catch (error) {
    console.error("Error storing tokens:", error);
    throw error;
  }
};

/**
 * Get access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

/**
 * Get all stored tokens
 */
export const getAllTokens = async (): Promise<TokenData | null> => {
  try {
    const [accessToken, refreshToken, expiresAtStr, userId] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.EXPIRES_AT),
      SecureStore.getItemAsync(STORAGE_KEYS.USER_ID),
    ]);

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt: expiresAtStr ? parseInt(expiresAtStr, 10) : undefined,
      userId: userId || undefined,
    };
  } catch (error) {
    console.error("Error getting all tokens:", error);
    return null;
  }
};

/**
 * Clear all tokens
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRES_AT),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID),
    ]);
  } catch (error) {
    console.error("Error clearing tokens:", error);
    throw error;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiresAtStr = await SecureStore.getItemAsync(STORAGE_KEYS.EXPIRES_AT);

    if (!expiresAtStr) {
      return true;
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Math.floor(Date.now() / 1000);

    // Consider expired if less than 5 minutes remaining
    return expiresAt - now < 300;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Get token expiration time in seconds
 */
export const getTokenExpiresIn = async (): Promise<number> => {
  try {
    const expiresAtStr = await SecureStore.getItemAsync(STORAGE_KEYS.EXPIRES_AT);

    if (!expiresAtStr) {
      return 0;
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Math.floor(Date.now() / 1000);

    return Math.max(expiresAt - now, 0);
  } catch (error) {
    console.error("Error getting token expiration time:", error);
    return 0;
  }
};
