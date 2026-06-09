-- Agency/admin/user bridge for the ShopnoJatra apps.
-- This migration intentionally references auth.users directly and keeps
-- privileged helper functions in a private schema.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE TABLE IF NOT EXISTS account_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'agency', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  type TEXT NOT NULL DEFAULT 'standard',
  email TEXT,
  phone TEXT,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(owner_user_id)
);

CREATE TABLE IF NOT EXISTS agency_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'support', 'finance')),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agency_id, user_id)
);

CREATE TABLE IF NOT EXISTS agency_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT,
  account_number_last4 TEXT,
  account_type TEXT NOT NULL DEFAULT 'settlement',
  currency TEXT NOT NULL DEFAULT 'BDT',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'standby', 'action_required', 'disabled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agency_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT,
  file_url TEXT,
  file_path TEXT,
  expiry_date DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agency_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agency_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('super_admin', 'admin', 'finance_admin', 'support_admin', 'marketing_admin', 'content_admin', 'agency_manager', 'readonly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_agency_id ON bookings(agency_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agencies_owner ON agencies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status, verification_status);
CREATE INDEX IF NOT EXISTS idx_agency_team_members_user ON agency_team_members(user_id, agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_documents_agency ON agency_documents(agency_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_agency_activity_logs_agency ON agency_activity_logs(agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agency_messages_agency ON agency_messages(agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id, status);

CREATE OR REPLACE FUNCTION app_private.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = check_user_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION app_private.is_agency_member(check_agency_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.agencies
    WHERE id = check_agency_id
      AND owner_user_id = check_user_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.agency_team_members
    WHERE agency_id = check_agency_id
      AND user_id = check_user_id
      AND status = 'active'
  );
$$;

GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_agency_member(UUID, UUID) TO authenticated;

ALTER TABLE account_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON account_profiles, agencies, agency_team_members, agency_bank_accounts, agency_documents, agency_activity_logs, agency_messages TO authenticated;
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT, UPDATE ON bookings TO authenticated;

DROP POLICY IF EXISTS account_profiles_owner_read ON account_profiles;
CREATE POLICY account_profiles_owner_read ON account_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR app_private.is_admin());

DROP POLICY IF EXISTS account_profiles_owner_write ON account_profiles;
CREATE POLICY account_profiles_owner_write ON account_profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS agencies_member_read ON agencies;
CREATE POLICY agencies_member_read ON agencies
  FOR SELECT TO authenticated
  USING (app_private.is_agency_member(id) OR app_private.is_admin());

DROP POLICY IF EXISTS agencies_owner_insert ON agencies;
CREATE POLICY agencies_owner_insert ON agencies
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() OR app_private.is_admin());

DROP POLICY IF EXISTS agencies_owner_update ON agencies;
CREATE POLICY agencies_owner_update ON agencies
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() OR app_private.is_admin())
  WITH CHECK (owner_user_id = auth.uid() OR app_private.is_admin());

DROP POLICY IF EXISTS agency_team_members_member_read ON agency_team_members;
CREATE POLICY agency_team_members_member_read ON agency_team_members
  FOR SELECT TO authenticated
  USING (app_private.is_agency_member(agency_id) OR app_private.is_admin());

DROP POLICY IF EXISTS agency_team_members_owner_write ON agency_team_members;
CREATE POLICY agency_team_members_owner_write ON agency_team_members
  FOR ALL TO authenticated
  USING (app_private.is_agency_member(agency_id) OR app_private.is_admin())
  WITH CHECK (app_private.is_agency_member(agency_id) OR app_private.is_admin());

DROP POLICY IF EXISTS agency_bank_accounts_member_all ON agency_bank_accounts;
CREATE POLICY agency_bank_accounts_member_all ON agency_bank_accounts
  FOR ALL TO authenticated
  USING (app_private.is_agency_member(agency_id) OR app_private.is_admin())
  WITH CHECK (app_private.is_agency_member(agency_id) OR app_private.is_admin());

DROP POLICY IF EXISTS agency_documents_member_all ON agency_documents;
CREATE POLICY agency_documents_member_all ON agency_documents
  FOR ALL TO authenticated
  USING (app_private.is_agency_member(agency_id) OR app_private.is_admin())
  WITH CHECK (app_private.is_agency_member(agency_id) OR app_private.is_admin());

DROP POLICY IF EXISTS agency_activity_logs_member_read_insert ON agency_activity_logs;
CREATE POLICY agency_activity_logs_member_read_insert ON agency_activity_logs
  FOR ALL TO authenticated
  USING (app_private.is_agency_member(agency_id) OR app_private.is_admin())
  WITH CHECK (app_private.is_agency_member(agency_id) OR app_private.is_admin());

DROP POLICY IF EXISTS agency_messages_member_all ON agency_messages;
CREATE POLICY agency_messages_member_all ON agency_messages
  FOR ALL TO authenticated
  USING (app_private.is_agency_member(agency_id) OR sender_user_id = auth.uid() OR recipient_user_id = auth.uid() OR app_private.is_admin())
  WITH CHECK (app_private.is_agency_member(agency_id) OR sender_user_id = auth.uid() OR app_private.is_admin());

DROP POLICY IF EXISTS admin_users_self_or_admin_read ON admin_users;
CREATE POLICY admin_users_self_or_admin_read ON admin_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR app_private.is_admin());

DROP POLICY IF EXISTS bookings_agency_member_read ON bookings;
CREATE POLICY bookings_agency_member_read ON bookings
  FOR SELECT TO authenticated
  USING (agency_id IS NOT NULL AND app_private.is_agency_member(agency_id));

DROP POLICY IF EXISTS bookings_agency_member_update ON bookings;
CREATE POLICY bookings_agency_member_update ON bookings
  FOR UPDATE TO authenticated
  USING (agency_id IS NOT NULL AND app_private.is_agency_member(agency_id))
  WITH CHECK (agency_id IS NOT NULL AND app_private.is_agency_member(agency_id));

DO $$
DECLARE
  rel TEXT;
BEGIN
  FOREACH rel IN ARRAY ARRAY[
    'account_profiles',
    'agencies',
    'agency_team_members',
    'agency_bank_accounts',
    'agency_documents',
    'admin_users'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at_trigger ON %I', rel, rel);
    EXECUTE format(
      'CREATE TRIGGER %I_updated_at_trigger BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      rel,
      rel
    );
  END LOOP;
END $$;

COMMIT;
