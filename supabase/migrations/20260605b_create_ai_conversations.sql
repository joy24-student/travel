-- AI conversations table for persistent chat sessions across all AI assistants

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Which AI feature owns this session
  agent TEXT NOT NULL DEFAULT 'travel_assistant'
    CHECK (agent IN ('travel_assistant', 'trip_planner', 'budget_planner', 'concierge', 'route_planner')),

  -- Free-form context (booking refs, destination, preferences, etc.)
  context JSONB NOT NULL DEFAULT '{}',

  -- Full message history stored as JSONB array
  -- Each item: { id, role, content, timestamp }
  messages JSONB NOT NULL DEFAULT '[]',

  -- Soft title for session list UI
  title TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id   ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent      ON ai_conversations(agent);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at DESC);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_conversations TO authenticated;

CREATE POLICY ai_conversations_owner_all ON ai_conversations
  FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reuse the set_updated_at() function already defined in 20260603_create_booking_system.sql
DO $$
BEGIN
  DROP TRIGGER IF EXISTS ai_conversations_updated_at_trigger ON ai_conversations;
  CREATE TRIGGER ai_conversations_updated_at_trigger
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;
