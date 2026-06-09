import { useEffect, useState } from "react";
import { getSupabaseStatus } from "../utils/supabase-test";

export interface SupabaseStatus {
  connected: boolean;
  url: boolean;
  key: boolean;
  authenticated: boolean;
  user: { id: string; email: string } | null;
  error?: string;
}

/**
 * useSupabaseStatus Hook
 * Monitors Supabase connection status
 */
export const useSupabaseStatus = () => {
  const [status, setStatus] = useState<SupabaseStatus>({
    connected: false,
    url: false,
    key: false,
    authenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const result = await getSupabaseStatus();
        setStatus(result);
        setError(null);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { status, loading, error };
};
