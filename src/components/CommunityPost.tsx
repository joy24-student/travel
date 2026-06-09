import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CommunityPostProps {
  authorName: string;
  authorImage?: string;
  role?: string;
  location?: string;
  timestamp?: string;
  title: string;
  description?: string;
  postImage?: string;
  likes?: number;
  comments?: number;
  liked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function CommunityPost({
  authorName,
  authorImage,
  role,
  location,
  timestamp,
  title,
  description,
  postImage,
  likes = 0,
  comments = 0,
  liked = false,
  onLike,
  onComment,
  onShare,
}: CommunityPostProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {authorImage && (
            <Image
              source={{ uri: authorImage }}
              style={styles.avatar}
              resizeMode="cover"
            />
          )}
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{authorName}</Text>
            {role && <Text style={styles.role}>{role}</Text>}
            {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
          </View>
        </View>
        <Pressable>
          <Ionicons name="ellipsis-horizontal" size={24} color="#767683" />
        </Pressable>
      </View>

      {/* Content */}
      {location && <Text style={styles.location}>{location}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      {/* Post Image */}
      {postImage && (
        <Image
          source={{ uri: postImage }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={onLike}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#ba1a1a" : "#767683"}
          />
          <Text style={styles.actionText}>{likes}</Text>
        </Pressable>

        <Pressable style={styles.action} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#767683" />
          <Text style={styles.actionText}>{comments}</Text>
        </Pressable>

        <Pressable style={styles.action} onPress={onShare}>
          <Ionicons name="share-social-outline" size={20} color="#767683" />
        </Pressable>

        <Pressable style={styles.action}>
          <Ionicons name="bookmark-outline" size={20} color="#767683" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#191c1d",
  },
  role: {
    fontSize: 12,
    color: "#767683",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#c6c5d4",
    marginTop: 2,
  },
  location: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000666",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#191c1d",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#454652",
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e3e4",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#767683",
    fontWeight: "500",
  },
});
