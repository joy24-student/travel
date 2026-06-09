import { supabase } from "../../utils/supabase";

export type CommunityProfileInput = {
  display_name?: string;
  username?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website_url?: string;
  is_influencer?: boolean;
  influencer_category?: string;
};

export type CreatePostInput = {
  title: string;
  content?: string;
  location?: string;
  visibility?: "public" | "followers" | "group" | "private";
  group_id?: string;
  media?: Array<{
    media_url: string;
    media_type?: "image" | "video";
    alt_text?: string;
  }>;
};

export type CreateStoryInput = {
  media_url: string;
  media_type?: "image" | "video";
  caption?: string;
  location?: string;
};

const getDisplayName = (user: any) => {
  const firstName = user?.user_metadata?.first_name;
  const lastName = user?.user_metadata?.last_name;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || user?.email?.split("@")[0] || "Traveler";
};

export const communityRepository = {
  async ensureProfile(userId: string, profile: CommunityProfileInput = {}) {
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData.user;

    const fallbackName =
      authUser?.id === userId ? getDisplayName(authUser) : "Traveler";
    const payload = {
      id: userId,
      display_name: profile.display_name || fallbackName,
      ...profile,
    };

    const { data, error } = await supabase
      .from("community_profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("community_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, profile: CommunityProfileInput) {
    const { data, error } = await supabase
      .from("community_profiles")
      .update(profile)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInfluencerProfiles(limit = 12) {
    const { data, error } = await supabase
      .from("community_profiles")
      .select("*")
      .eq("is_influencer", true)
      .order("followers_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getPostsFeed(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:community_profiles!posts_user_id_fkey(*),
        media:post_media(*),
        comments:post_comments(count),
        likes:post_likes(count)
      `,
      )
      .eq("status", "published")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async getUserPosts(userId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:community_profiles!posts_user_id_fkey(*),
        media:post_media(*),
        comments:post_comments(count),
        likes:post_likes(count)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPost(userId: string, post: CreatePostInput) {
    await this.ensureProfile(userId);

    const { media = [], ...postPayload } = post;
    const { data, error } = await supabase
      .from("posts")
      .insert([{ user_id: userId, ...postPayload }])
      .select()
      .single();

    if (error) throw error;

    if (media.length > 0) {
      const { error: mediaError } = await supabase.from("post_media").insert(
        media.map((item, index) => ({
          post_id: data.id,
          sort_order: index,
          media_type: item.media_type || "image",
          media_url: item.media_url,
          alt_text: item.alt_text,
        })),
      );

      if (mediaError) throw mediaError;
    }

    return data;
  },

  async updatePost(postId: string, post: Partial<CreatePostInput>) {
    const { media, ...postPayload } = post;
    const { data, error } = await supabase
      .from("posts")
      .update(postPayload)
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(postId: string) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw error;
  },

  async getStories(limit = 20) {
    const { data, error } = await supabase
      .from("stories")
      .select("*, author:community_profiles!stories_user_id_fkey(*)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createStory(userId: string, story: CreateStoryInput) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("stories")
      .insert([{ user_id: userId, media_type: "image", ...story }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPostComments(postId: string) {
    const { data, error } = await supabase
      .from("post_comments")
      .select("*, author:community_profiles!post_comments_user_id_fkey(*)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addComment(
    postId: string,
    userId: string,
    content: string,
    parentCommentId?: string,
  ) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("post_comments")
      .insert([
        {
          post_id: postId,
          user_id: userId,
          content,
          parent_comment_id: parentCommentId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async likePost(postId: string, userId: string) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("post_likes")
      .upsert([{ post_id: postId, user_id: userId }], {
        onConflict: "post_id,user_id",
      })
      .select();

    if (error) throw error;
    return data;
  },

  async unlikePost(postId: string, userId: string) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async savePost(postId: string, userId: string) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("saved_posts")
      .upsert([{ post_id: postId, user_id: userId }], {
        onConflict: "post_id,user_id",
      })
      .select();

    if (error) throw error;
    return data;
  },

  async unsavePost(postId: string, userId: string) {
    const { error } = await supabase
      .from("saved_posts")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async getSavedPosts(userId: string) {
    const { data, error } = await supabase
      .from("saved_posts")
      .select(
        `
        post:posts(
          *,
          author:community_profiles!posts_user_id_fkey(*),
          media:post_media(*)
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map((item) => (item as any).post).filter(Boolean) || [];
  },

  async createGroup(userId: string, group: any) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("groups")
      .insert([{ owner_id: userId, ...group }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGroups(limit = 20) {
    const { data, error } = await supabase
      .from("groups")
      .select("*, owner:community_profiles!groups_owner_id_fkey(*)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async joinGroup(groupId: string, userId: string) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("group_members")
      .upsert([{ group_id: groupId, user_id: userId, role: "member" }], {
        onConflict: "group_id,user_id",
      })
      .select();

    if (error) throw error;
    return data;
  },

  async leaveGroup(groupId: string, userId: string) {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async getGroupMessages(groupId: string, limit = 50) {
    const { data, error } = await supabase
      .from("group_messages")
      .select("*, author:community_profiles!group_messages_user_id_fkey(*)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse();
  },

  async sendGroupMessage(groupId: string, userId: string, content: string) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("group_messages")
      .insert([{ group_id: groupId, user_id: userId, content }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async followUser(userId: string, followingId: string) {
    await this.ensureProfile(userId);

    const { data, error } = await supabase
      .from("user_follows")
      .upsert([{ follower_id: userId, following_id: followingId }], {
        onConflict: "follower_id,following_id",
      })
      .select();

    if (error) throw error;
    return data;
  },

  async unfollowUser(userId: string, followingId: string) {
    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", followingId);

    if (error) throw error;
  },

  async getFollowers(userId: string) {
    const { data, error } = await supabase
      .from("user_follows")
      .select("follower:community_profiles!user_follows_follower_id_fkey(*)")
      .eq("following_id", userId);

    if (error) throw error;
    return data?.map((item) => (item as any).follower).filter(Boolean) || [];
  },

  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from("user_follows")
      .select("following:community_profiles!user_follows_following_id_fkey(*)")
      .eq("follower_id", userId);

    if (error) throw error;
    return data?.map((item) => (item as any).following).filter(Boolean) || [];
  },
};
