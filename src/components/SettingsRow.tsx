import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SettingsRowProps {
  label: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  hasBorder?: boolean;
}

export function SettingsRow({
  label,
  value,
  showChevron = true,
  onPress,
  rightComponent,
  hasBorder = true,
}: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.rightContent}>
          {rightComponent}
          {value && <Text style={styles.value}>{value}</Text>}
          {showChevron && (
            <Ionicons color="#94a3b8" name="chevron-forward" size={18} />
          )}
        </View>
      </View>
      {hasBorder && <View style={styles.border} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#94a3b8",
    marginRight: 8,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  border: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
});
