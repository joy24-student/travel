import React from "react";
import { View } from "react-native";
import SplashScreen from "./SplashScreen";
import AdvancedSplashScreen from "./AdvancedSplashScreen";
import {
  SplashScreenConfig,
  DEFAULT_SPLASH_CONFIG,
  getSplashConfig,
  PresetName,
} from "../config/splashConfig";

interface CustomSplashScreenProps {
  onFinish?: () => void;
  config?: SplashScreenConfig;
  preset?: PresetName;
}

/**
 * Customizable Splash Screen Wrapper
 *
 * This component allows you to easily switch between splash screen variants
 * and customize their appearance and behavior.
 *
 * @example
 * // Using default configuration
 * <CustomSplashScreen onFinish={() => navigation.navigate('Home')} />
 *
 * @example
 * // Using a preset
 * <CustomSplashScreen preset="advanced" onFinish={() => navigation.navigate('Home')} />
 *
 * @example
 * // Using custom configuration
 * <CustomSplashScreen
 *   config={{
 *     variant: 'advanced',
 *     duration: 4000,
 *     colors: { primary: '#FF0000', accent: '#00FF00', background: '#FFFFFF', text: '#000000' }
 *   }}
 *   onFinish={() => navigation.navigate('Home')}
 * />
 */
export default function CustomSplashScreen({
  onFinish,
  config,
  preset,
}: CustomSplashScreenProps) {
  // Determine which configuration to use
  const finalConfig = config || getSplashConfig(preset);

  // Select the appropriate splash screen component
  const SplashComponent =
    finalConfig.variant === "advanced" ? AdvancedSplashScreen : SplashScreen;

  return (
    <View style={{ flex: 1 }}>
      <SplashComponent onFinish={onFinish} />
    </View>
  );
}

// Export configuration helpers
export { getSplashConfig, DEFAULT_SPLASH_CONFIG };
export type { SplashScreenConfig };
