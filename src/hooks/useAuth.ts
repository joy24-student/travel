import { useState, useEffect, useCallback } from "react";
import { authService, EmailOtpType } from "../services/auth";
import { supabase } from "../utils/supabase";

// Hook for authentication state
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const unsubscribe = authService.onAuthStateChange(
      (authenticated, authUser) => {
        setIsAuthenticated(authenticated);
        setUser(authUser);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ) => {
      setLoading(true);
      try {
        const result = await authService.signUp(
          email,
          password,
          firstName,
          lastName,
        );
        return result;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    return authService.sendOtp(email);
  }, []);

  const verifyEmailOtp = useCallback(
    async (email: string, token: string, type: EmailOtpType) => {
      return authService.verifyEmailOtp(email, token, type);
    },
    [],
  );

  const resendEmailVerification = useCallback(async (email: string) => {
    return authService.resendEmailVerification(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return authService.updatePassword(newPassword);
  }, []);

  const signInWithBiometric = useCallback(async () => {
    return authService.signInWithBiometric();
  }, []);

  const registerBiometric = useCallback(async () => {
    return authService.registerBiometric();
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendOtp,
    verifyEmailOtp,
    resendEmailVerification,
    updatePassword,
    signInWithBiometric,
    registerBiometric,
  };
};

// Hook for data fetching with cache
export const useQuery = <T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options: { enabled?: boolean; cacheTime?: number } = {},
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, refetch };
};

// Hook for mutations (create, update, delete)
export const useMutation = <T, R = void>(
  mutationFn: (args: T) => Promise<R>,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<R | null>(null);

  const mutate = useCallback(
    async (args: T) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(args);
        setData(result);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
};

// Hook for real-time subscriptions
export const useRealtimeSubscription = <T>(
  channel: string,
  event: string,
  callback: (payload: T) => void,
) => {
  useEffect(() => {
    const subscription = supabase
      .channel(channel)
      .on(
        "postgres_changes" as any,
        { event, schema: "public" } as any,
        (payload: any) => {
          callback(payload.new as T);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [channel, event, callback]);
};
