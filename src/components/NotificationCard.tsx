import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface NotificationCardProps {
  badge?: React.ReactNode;
  title: string;
  subtitle?: string;
  time?: string;
  actionText?: string;
  onAction?: () => void;
  onPress?: () => void;
}

export function NotificationCard({
  badge,
  title,
  subtitle,
  time,
  actionText = "View details",
  onAction,
  onPress,
}: NotificationCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      {badge && <View style={styles.badgeContainer}>{badge}</View>}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.footer}>
        {time && <Text style={styles.time}>{time}</Text>}
        <Pressable onPress={onAction}>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>{actionText}</Text>
            <View style={styles.badge}>
              <View style={styles.dot} />
            </View>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    overflow: "hidden",
    marginBottom: 16,
  },
  badgeContainer: {
    padding: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  time: {
    fontSize: 12,
    color: "#d1d5db",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },
  badge: {
    position: "relative",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f97316",
  },
});
