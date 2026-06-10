/**
 * useAuth Hook
 * Custom React hook to access authentication context
 */

import { useContext, useState, useEffect } from "react";
import { AuthContext, AuthContextType } from "../auth/context";

/**
 * Hook for accessing auth context
 * Provides all auth functions and state
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

/**
 * Hook for checking if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook for getting current user
 */
export const useCurrentUser = () => {
  const { user } = useAuth();
  return user;
};

/**
 * Hook for loading state
 */
export const useAuthLoading = (): boolean => {
  const { loading } = useAuth();
  return loading;
};

/**
 * Simple useQuery hook for data fetching
 */
export const useQuery = <T,>(
  queryFn: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Simple useMutation hook for data mutations
 */
export const useMutation = <T, V>(
  mutationFn: (variables: V) => Promise<T>
): {
  mutate: (variables: V) => Promise<void>;
  loading: boolean;
  error: Error | null;
  data: T | null;
} => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (variables: V) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(variables);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
};

/**
 * Simple useRealtimeSubscription hook for Supabase realtime
 */
export const useRealtimeSubscription = <T,>(
  channel: string,
  event: string,
  callback: (payload: T) => void
): { unsubscribe: () => void } => {
  useEffect(() => {
    // Placeholder implementation
    // In a real app, this would use Supabase realtime
    const unsubscribe = () => {
      // Cleanup logic here
    };

    return unsubscribe;
  }, [channel, event]);

  return {
    unsubscribe: () => {
      // Manual unsubscribe if needed
    },
  };
};
