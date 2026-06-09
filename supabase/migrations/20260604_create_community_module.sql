BEGIN;

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Community module

CREATE TABLE IF NOT EXISTS community_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  location TEXT,
  website_url TEXT,
  is_influencer BOOLEAN NOT NULL DEFAULT FALSE,
  influencer_category TEXT,
  followers_count INTEGER NOT NULL DEFAULT 0 CHECK (followers_count >= 0),
  following_count INTEGER NOT NULL DEFAULT 0 CHECK (following_count >= 0),
  posts_count INTEGER NOT NULL DEFAULT 0 CHECK (posts_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL CONSTRAINT posts_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  group_id UUID,
  title TEXT NOT NULL,
  content TEXT,
  location TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'group', 'private')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL CONSTRAINT post_comments_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL CONSTRAINT post_likes_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL CONSTRAINT comment_likes_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL CONSTRAINT stories_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  location TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL CONSTRAINT groups_owner_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  destination TEXT,
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  members_count INTEGER NOT NULL DEFAULT 0 CHECK (members_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safe FK adjust
ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_group_id_fkey,
  ADD CONSTRAINT posts_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL CONSTRAINT group_members_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL CONSTRAINT group_messages_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT CHECK (attachment_type IN ('image', 'video', 'file')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL CONSTRAINT user_follows_follower_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL CONSTRAINT user_follows_following_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE TABLE IF NOT EXISTS saved_posts (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL CONSTRAINT saved_posts_user_id_fkey REFERENCES community_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_profiles_influencer ON community_profiles(is_influencer);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(status, visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_group ON posts(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_media_post ON post_media(post_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(expires_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_groups_privacy ON groups(privacy, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Count refresh functions
CREATE OR REPLACE FUNCTION refresh_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;

  -- DELETE
  UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;

  -- DELETE
  UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  END IF;

  -- DELETE
  UPDATE post_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE community_profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  END IF;

  -- DELETE
  UPDATE community_profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  UPDATE community_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET members_count = members_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  END IF;

  -- DELETE
  UPDATE groups SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.group_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_group_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at triggers (covers all tables with updated_at)
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'community_profiles',
    'posts',
    'post_comments',
    'stories',
    'groups',
    'group_members',
    'group_messages',
    'user_follows',
    'saved_posts'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at_trigger ON %I', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER %I_updated_at_trigger BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      table_name,
      table_name
    );
  END LOOP;
END $$;

-- Count triggers
DROP TRIGGER IF EXISTS post_comments_count_trigger ON post_comments;
CREATE TRIGGER post_comments_count_trigger
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION refresh_post_comment_count();

DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
CREATE TRIGGER post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION refresh_post_like_count();

DROP TRIGGER IF EXISTS comment_likes_count_trigger ON comment_likes;
CREATE TRIGGER comment_likes_count_trigger
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION refresh_comment_like_count();

DROP TRIGGER IF EXISTS user_follows_count_trigger ON user_follows;
CREATE TRIGGER user_follows_count_trigger
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW EXECUTE FUNCTION refresh_follow_counts();

DROP TRIGGER IF EXISTS group_member_count_trigger ON group_members;
CREATE TRIGGER group_member_count_trigger
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION refresh_group_member_count();

DROP TRIGGER IF EXISTS group_owner_membership_trigger ON groups;
CREATE TRIGGER group_owner_membership_trigger
AFTER INSERT ON groups
FOR EACH ROW EXECUTE FUNCTION create_group_owner_membership();

-- RLS
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Grants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

GRANT SELECT ON community_profiles, posts, post_media, post_comments, post_likes, stories, groups, group_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  community_profiles, posts, post_media, post_comments, post_likes, comment_likes, stories, groups, group_members, group_messages,
  user_follows, saved_posts
TO authenticated;

-- Policies
CREATE POLICY community_profiles_public_read ON community_profiles
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY community_profiles_owner_all ON community_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY posts_public_read ON posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND visibility = 'public');

CREATE POLICY posts_group_member_read ON posts
  FOR SELECT TO authenticated
  USING (
    visibility = 'group'
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = posts.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY posts_owner_all ON posts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY post_media_public_read ON post_media
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id));

CREATE POLICY post_media_owner_all ON post_media
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()));

CREATE POLICY post_comments_public_read ON post_comments
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_comments.post_id));

CREATE POLICY post_comments_owner_all ON post_comments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY post_likes_public_read ON post_likes
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_likes.post_id));

CREATE POLICY post_likes_owner_all ON post_likes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY comment_likes_owner_all ON comment_likes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY stories_public_read ON stories
  FOR SELECT TO anon, authenticated
  USING (expires_at > CURRENT_TIMESTAMP);

CREATE POLICY stories_owner_all ON stories
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY groups_public_read ON groups
  FOR SELECT TO anon, authenticated
  USING (privacy = 'public');

CREATE POLICY groups_member_read ON groups
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid()));

CREATE POLICY groups_owner_all ON groups
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY group_members_public_read ON group_members
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.privacy = 'public'));

CREATE POLICY group_members_self_read ON group_members
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY group_members_join_public ON group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'member'
    AND EXISTS (SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.privacy = 'public')
  );

CREATE POLICY group_members_self_delete ON group_members
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND role <> 'owner');

-- group_messages
CREATE POLICY group_messages_member_read ON group_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = group_messages.group_id AND group_members.user_id = auth.uid()));

CREATE POLICY group_messages_member_insert ON group_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = group_messages.group_id AND group_members.user_id = auth.uid())
  );

CREATE POLICY group_messages_owner_update_delete ON group_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY group_messages_owner_delete ON group_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- user_follows
CREATE POLICY user_follows_public_read ON user_follows
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY user_follows_owner_all ON user_follows
  FOR ALL TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- saved posts
CREATE POLICY saved_posts_owner_all ON saved_posts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;