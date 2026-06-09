import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StoryCircleProps {
  name: string;
  image?: string;
  isAdd?: boolean;
  hasStory?: boolean;
  onPress?: () => void;
}

function StoryCircle({
  name,
  image,
  isAdd,
  hasStory,
  onPress,
}: StoryCircleProps) {
  if (isAdd) {
    return (
      <Pressable style={styles.addStoryCircle} onPress={onPress}>
        <View style={styles.addStoryContent}>
          <Ionicons name="add-circle" size={32} color="#000666" />
        </View>
        <Text style={styles.name}>{name}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.storyContainer} onPress={onPress}>
      <View style={[styles.storyRing, hasStory && styles.storyRingActive]}>
        <View style={styles.storyImageBorder}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.storyImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.storyImagePlaceholder} />
          )}
        </View>
      </View>
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
}

interface StoriesBarProps {
  stories?: Array<{ name: string; image?: string }>;
  onAddStory?: () => void;
  onStoryPress?: (name: string) => void;
}

export function StoriesBar({
  stories = [],
  onAddStory,
  onStoryPress,
}: StoriesBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      <StoryCircle name="Post" isAdd onPress={onAddStory} />

      {stories.map((story) => (
        <StoryCircle
          key={story.name}
          name={story.name}
          image={story.image}
          hasStory
          onPress={() => onStoryPress?.(story.name)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
  },
  storyRing: {
    padding: 0,
  },
  storyRingActive: {
    backgroundColor: "#1a237e",
    padding: 2,
  },
  storyImageBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#f3f4f5",
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  storyImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e1e3e4",
  },
  addStoryCircle: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
  },
  addStoryContent: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#e1e3e4",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f5",
  },
  name: {
    fontSize: 12,
    color: "#191c1d",
    fontWeight: "500",
    textAlign: "center",
    width: 70,
  },
});
