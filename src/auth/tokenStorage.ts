import * as SecureStore from 'expo-secure-store';
import { Session } from '@supabase/supabase-js';
import type { StoredTokenData } from './types';

const AUTH_SESSION_KEY = 'supabase_session';
const LEGACY_TOKEN_KEY = 'auth_tokens';

export const tokenStorage = {
  async saveSession(session: Session | null) {
    try {
      if (session) {
        await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
      } else {
        await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
      }
    } catch (error) {
      console.error('Error saving session to storage:', error);
    }
  },

  async getSession(): Promise<Session | null> {
    try {
      const sessionStr = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (error) {
      console.error('Error getting session from storage:', error);
      return null;
    }
  },

  async clearSession() {
    await this.saveSession(null);
  },
};

export const storeTokens = async (tokens: StoredTokenData): Promise<void> => {
  try {
    await SecureStore.setItemAsync(LEGACY_TOKEN_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error storing auth tokens:', error);
    throw error;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
    await tokenStorage.clearSession();
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
    throw error;
  }
};
