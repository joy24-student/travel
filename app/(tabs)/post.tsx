import { router } from "expo-router";
import { screens } from "../../src/data/screens";
import { CommunitySpecializedScreen } from "../../src/screens/CommunityScreen";

const communityScreen = screens.find(
  (s) => s.slug === "travel-community-posts",
)!;

export default function PostTab() {
  return <CommunitySpecializedScreen screen={communityScreen} />;
}
