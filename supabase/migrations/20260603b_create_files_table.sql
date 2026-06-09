-- Create files table for storing file metadata
-- This table tracks all uploaded files (images, videos, documents) in Cloudflare R2

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File information
  url TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  
  -- File metadata
  alt_text TEXT,
  description TEXT,
  
  -- Entity association (link to hotels, posts, reviews, etc.)
  entity_type VARCHAR(50),
  entity_id UUID,
  
  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  CONSTRAINT files_entity_unique UNIQUE NULLS NOT DISTINCT (entity_type, entity_id, key)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_key ON files(key);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_is_public ON files(is_public);

-- Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own files
CREATE POLICY "Users can view their own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can see public files
CREATE POLICY "Anyone can view public files"
  ON files FOR SELECT
  USING (is_public = TRUE);

-- Policy: Users can insert their own files
CREATE POLICY "Users can insert their own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own files"
  ON files FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
  ON files FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER files_updated_at_trigger
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE FUNCTION update_files_updated_at();

-- Create a helper view for user file stats
CREATE OR REPLACE VIEW user_file_stats AS
SELECT
  user_id,
  file_type,
  COUNT(*) as count,
  SUM(size) as total_size,
  MAX(created_at) as last_upload
FROM files
GROUP BY user_id, file_type;

-- Create a helper view for entity files
CREATE OR REPLACE VIEW entity_files AS
SELECT
  entity_type,
  entity_id,
  COUNT(*) as file_count,
  array_agg(DISTINCT file_type) as file_types,
  array_agg(url) as urls
FROM files
WHERE entity_type IS NOT NULL AND entity_id IS NOT NULL
GROUP BY entity_type, entity_id;
