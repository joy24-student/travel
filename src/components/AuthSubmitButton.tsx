import { Pressable, Text } from "react-native";

type AuthSubmitButtonProps = {
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export function AuthSubmitButton({
  label,
  loading,
  onPress,
}: AuthSubmitButtonProps) {
  return (
    <Pressable
      className={`items-center rounded-xl px-4 py-4 ${loading ? "bg-blue-300" : "bg-blue-600"}`}
      disabled={loading}
      onPress={onPress}
    >
      <Text className="text-base font-extrabold text-white">
        {loading ? "Please wait..." : label}
      </Text>
    </Pressable>
  );
}
