import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-trip-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
          <View className="flex-1 justify-center">
            <Text className="text-3xl font-extrabold text-trip-dark">
              {title}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-gray-500">
              {subtitle}
            </Text>
            <View className="mt-8">{children}</View>
            {footer ? <View className="mt-6">{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
