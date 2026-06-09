/**
 * Splash Screen Configuration
 *
 * This file controls which splash screen variant is displayed
 * and other splash-related settings.
 */

export type SplashScreenVariant = "basic" | "advanced";

export interface SplashScreenConfig {
  // Which splash screen to display: 'basic' or 'advanced'
  variant: SplashScreenVariant;

  // How long the splash screen displays (in milliseconds)
  duration: number;

  // Whether to show splash screen for authentication check
  showForAuth: boolean;

  // Color scheme
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };

  // Animation settings
  animation: {
    birdDuration: number; // Bird animation duration (ms)
    textDuration: number; // Text animation duration (ms)
    particleCount: number; // Number of particles (advanced only)
  };
}

// Default configuration
export const DEFAULT_SPLASH_CONFIG: SplashScreenConfig = {
  variant: "basic", // Change to 'advanced' to use particle effects version
  duration: 3500,
  showForAuth: true,
  colors: {
    primary: "#003399",
    accent: "#FF5722",
    background: "#FFFFFF",
    text: "#333333",
  },
  animation: {
    birdDuration: 800,
    textDuration: 800,
    particleCount: 8,
  },
};

// Preset configurations
export const PRESETS: Record<string, SplashScreenConfig> = {
  // Quick splash (1.5 seconds)
  quick: {
    ...DEFAULT_SPLASH_CONFIG,
    duration: 1500,
    animation: {
      ...DEFAULT_SPLASH_CONFIG.animation,
      birdDuration: 500,
      textDuration: 400,
    },
  },

  // Standard splash (3.5 seconds)
  standard: DEFAULT_SPLASH_CONFIG,

  // Extended splash (5 seconds)
  extended: {
    ...DEFAULT_SPLASH_CONFIG,
    duration: 5000,
    animation: {
      ...DEFAULT_SPLASH_CONFIG.animation,
      birdDuration: 1200,
      textDuration: 1000,
    },
  },

  // Minimal splash (basic version only)
  minimal: {
    ...DEFAULT_SPLASH_CONFIG,
    variant: "basic",
    duration: 2000,
  },

  // Full featured (advanced with particles)
  featured: {
    ...DEFAULT_SPLASH_CONFIG,
    variant: "advanced",
    duration: 3500,
    animation: {
      ...DEFAULT_SPLASH_CONFIG.animation,
      particleCount: 12,
    },
  },

  // Dark theme
  dark: {
    ...DEFAULT_SPLASH_CONFIG,
    colors: {
      primary: "#1A1A2E",
      accent: "#FF6B6B",
      background: "#0F0F1E",
      text: "#FFFFFF",
    },
  },

  // Light theme
  light: {
    ...DEFAULT_SPLASH_CONFIG,
    colors: {
      primary: "#003399",
      accent: "#FF5722",
      background: "#FFFFFF",
      text: "#333333",
    },
  },
};

// Get configuration by preset name
export const getSplashConfig = (
  preset?: keyof typeof PRESETS,
): SplashScreenConfig => {
  if (preset && PRESETS[preset]) {
    return PRESETS[preset];
  }
  return DEFAULT_SPLASH_CONFIG;
};

// Export all presets
export type PresetName = keyof typeof PRESETS;
export const presetNames = Object.keys(PRESETS) as PresetName[];
