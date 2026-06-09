import { useMutation, useQuery, useRealtimeSubscription } from "./useAuth";
import {
  communityRepository,
  CreatePostInput,
  CreateStoryInput,
} from "../services/repositories/community";

// Hook for posts feed
export const usePostsFeed = () => {
  const {
    data: posts,
    loading,
    error,
    refetch,
  } = useQuery(async () => await communityRepository.getPostsFeed());

  // Real-time subscription to new posts
  useRealtimeSubscription("posts", "INSERT", (newPost) => {
    refetch();
  });

  return {
    posts: posts || [],
    loading,
    error,
    refetch,
  };
};

// Hook for user's posts
export const useUserPosts = (userId?: string) => {
  const {
    data: posts,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return [];
      return await communityRepository.getUserPosts(userId);
    },
    [userId],
    { enabled: !!userId },
  );

  return {
    posts: posts || [],
    loading,
    error,
    refetch,
  };
};

// Hook for creating posts
export const useCreatePost = (userId?: string) => {
  const createMutation = useMutation(async (post: CreatePostInput) => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.createPost(userId, post);
  });

  return {
    createPost: createMutation.mutate,
    loading: createMutation.loading,
    error: createMutation.error,
    data: createMutation.data,
  };
};

// Hook for post interactions (like, comment, save)
export const usePostInteractions = (postId: string, userId?: string) => {
  const likeMutation = useMutation(async () => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.likePost(postId, userId);
  });

  const unlikeMutation = useMutation(async () => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.unlikePost(postId, userId);
  });

  const saveMutation = useMutation(async () => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.savePost(postId, userId);
  });

  const unsaveMutation = useMutation(async () => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.unsavePost(postId, userId);
  });

  const commentMutation = useMutation(async (content: string) => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.addComment(postId, userId, content);
  });

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    save: saveMutation.mutate,
    unsave: unsaveMutation.mutate,
    addComment: commentMutation.mutate,
    isLiking: likeMutation.loading,
    isUnliking: unlikeMutation.loading,
    isSaving: saveMutation.loading,
    isUnsaving: unsaveMutation.loading,
    isCommenting: commentMutation.loading,
  };
};

export const useStories = () => {
  const {
    data: stories,
    loading,
    error,
    refetch,
  } = useQuery(async () => await communityRepository.getStories());

  useRealtimeSubscription("stories", "INSERT", () => {
    refetch();
  });

  return {
    stories: stories || [],
    loading,
    error,
    refetch,
  };
};

export const useCreateStory = (userId?: string) => {
  const storyMutation = useMutation(async (story: CreateStoryInput) => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.createStory(userId, story);
  });

  return {
    createStory: storyMutation.mutate,
    loading: storyMutation.loading,
    error: storyMutation.error,
    data: storyMutation.data,
  };
};

export const usePostComments = (postId?: string) => {
  const {
    data: comments,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!postId) return [];
      return await communityRepository.getPostComments(postId);
    },
    [postId],
    { enabled: !!postId },
  );

  useRealtimeSubscription("post_comments", "INSERT", () => {
    refetch();
  });

  return {
    comments: comments || [],
    loading,
    error,
    refetch,
  };
};

export const useGroups = () => {
  const {
    data: groups,
    loading,
    error,
    refetch,
  } = useQuery(async () => await communityRepository.getGroups());

  useRealtimeSubscription("groups", "INSERT", () => {
    refetch();
  });

  return {
    groups: groups || [],
    loading,
    error,
    refetch,
  };
};

export const useCreateGroup = (userId?: string) => {
  const groupMutation = useMutation(async (group: any) => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.createGroup(userId, group);
  });

  return {
    createGroup: groupMutation.mutate,
    loading: groupMutation.loading,
    error: groupMutation.error,
    data: groupMutation.data,
  };
};

export const useGroupChat = (groupId?: string, userId?: string) => {
  const {
    data: messages,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!groupId) return [];
      return await communityRepository.getGroupMessages(groupId);
    },
    [groupId],
    { enabled: !!groupId },
  );

  useRealtimeSubscription("group_messages", "INSERT", () => {
    refetch();
  });

  const joinMutation = useMutation(async () => {
    if (!groupId || !userId) throw new Error("Group ID and User ID required");
    return await communityRepository.joinGroup(groupId, userId);
  });

  const sendMutation = useMutation(async (content: string) => {
    if (!groupId || !userId) throw new Error("Group ID and User ID required");
    return await communityRepository.sendGroupMessage(groupId, userId, content);
  });

  return {
    messages: messages || [],
    loading,
    error,
    refetch,
    joinGroup: joinMutation.mutate,
    sendMessage: sendMutation.mutate,
    isJoining: joinMutation.loading,
    isSending: sendMutation.loading,
  };
};

export const useInfluencerProfiles = () => {
  const {
    data: influencers,
    loading,
    error,
    refetch,
  } = useQuery(async () => await communityRepository.getInfluencerProfiles());

  return {
    influencers: influencers || [],
    loading,
    error,
    refetch,
  };
};

// Hook for saved posts
export const useSavedPosts = (userId?: string) => {
  const {
    data: savedPosts,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return [];
      return await communityRepository.getSavedPosts(userId);
    },
    [userId],
    { enabled: !!userId },
  );

  return {
    savedPosts: savedPosts || [],
    loading,
    error,
    refetch,
  };
};

// Hook for following/unfollowing
export const useFollowing = (userId?: string) => {
  const followMutation = useMutation(async (followingId: string) => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.followUser(userId, followingId);
  });

  const unfollowMutation = useMutation(async (followingId: string) => {
    if (!userId) throw new Error("User ID required");
    return await communityRepository.unfollowUser(userId, followingId);
  });

  const {
    data: following,
    loading: followingLoading,
    refetch: refetchFollowing,
  } = useQuery(
    async () => {
      if (!userId) return [];
      return await communityRepository.getFollowing(userId);
    },
    [userId],
    { enabled: !!userId },
  );

  const {
    data: followers,
    loading: followersLoading,
    refetch: refetchFollowers,
  } = useQuery(
    async () => {
      if (!userId) return [];
      return await communityRepository.getFollowers(userId);
    },
    [userId],
    { enabled: !!userId },
  );

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    following: following || [],
    followers: followers || [],
    isFollowing: followMutation.loading,
    isUnfollowing: unfollowMutation.loading,
    followingLoading,
    followersLoading,
    refetchFollowing,
    refetchFollowers,
  };
};
