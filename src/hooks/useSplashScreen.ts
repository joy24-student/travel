import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export const useSplashScreen = () => {
  const [isReady, setIsReady] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Simulate app initialization (checking auth, loading data, etc)
    const initializeApp = async () => {
      try {
        // Wait for auth check
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // App is ready
        setIsReady(true);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsReady(true);
      }
    };

    if (!loading) {
      initializeApp();
    }
  }, [loading]);

  const hideSplash = () => {
    setIsSplashVisible(false);
  };

  return {
    isSplashVisible,
    hideSplash,
    isReady,
    isAuthenticated,
  };
};
