-- ============================================================================
-- ADMIN PANEL SCHEMA - ENTERPRISE FEATURES (450+ Features)
-- ============================================================================

-- ENUMS FOR ADMIN MODULE
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'admin',
  'finance_admin',
  'support_admin',
  'marketing_admin',
  'content_admin',
  'agency_manager',
  'readonly'
);

CREATE TYPE user_verification_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'manual_review'
);

CREATE TYPE kyc_document_type AS ENUM (
  'national_id',
  'passport',
  'license',
  'trade_license',
  'business_license',
  'tax_document'
);

CREATE TYPE agency_verification_status AS ENUM (
  'pending',
  'verified',
  'suspended',
  'banned',
  'reactivated'
);

CREATE TYPE destination_status AS ENUM (
  'active',
  'inactive',
  'archived'
);

CREATE TYPE package_status AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'archived'
);

CREATE TYPE refund_status AS ENUM (
  'requested',
  'approved',
  'rejected',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE ad_type AS ENUM (
  'banner',
  'video',
  'sponsored_package',
  'sponsored_agency'
);

CREATE TYPE ad_status AS ENUM (
  'draft',
  'active',
  'paused',
  'completed',
  'expired'
);

-- ============================================================================
-- 1. ADMIN & RBAC (Role-Based Access Control)
-- ============================================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'admin',
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, deactivated
  permissions JSONB NOT NULL DEFAULT '{}', -- Granular permissions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(user_id)
);

CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}', -- Array of permission strings
  is_system BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(100), -- dashboard, users, agencies, packages, etc.
  action VARCHAR(100), -- create, read, update, delete, approve, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  module VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. DASHBOARD & ANALYTICS
-- ============================================================================

CREATE TABLE dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users BIGINT DEFAULT 0,
  active_users BIGINT DEFAULT 0,
  new_users BIGINT DEFAULT 0,
  total_agencies BIGINT DEFAULT 0,
  active_agencies BIGINT DEFAULT 0,
  total_bookings BIGINT DEFAULT 0,
  completed_bookings BIGINT DEFAULT 0,
  cancelled_bookings BIGINT DEFAULT 0,
  pending_bookings BIGINT DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  today_revenue DECIMAL(15, 2) DEFAULT 0,
  commission_earnings DECIMAL(15, 2) DEFAULT 0,
  active_trips BIGINT DEFAULT 0,
  live_visitors BIGINT DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  cancellation_rate DECIMAL(5, 2) DEFAULT 0,
  refund_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_date)
);

CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  widget_type VARCHAR(100) NOT NULL, -- revenue_graph, booking_graph, user_growth, etc.
  widget_position INT,
  is_enabled BOOLEAN DEFAULT TRUE,
  custom_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(255),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(100),
  entity_id UUID,
  properties JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE real_time_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value BIGINT,
  metric_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_period VARCHAR(50) -- hourly, daily, monthly
);

-- ============================================================================
-- 3. USER MANAGEMENT
-- ============================================================================

CREATE TABLE user_admin_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_status user_verification_status DEFAULT 'pending',
  kyc_status user_verification_status DEFAULT 'pending',
  is_suspended BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspension_date TIMESTAMP WITH TIME ZONE,
  ban_reason TEXT,
  ban_date TIMESTAMP WITH TIME ZONE,
  approved_date TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),
  device_name VARCHAR(255),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

CREATE TABLE user_device_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255),
  device_type VARCHAR(50),
  device_model VARCHAR(255),
  os_version VARCHAR(100),
  app_version VARCHAR(20),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type kyc_document_type NOT NULL,
  document_number VARCHAR(100),
  file_url TEXT,
  file_path VARCHAR(500),
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  verified_by UUID REFERENCES admin_users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  face_match_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_reward_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(100),
  points_earned INT DEFAULT 0,
  points_redeemed INT DEFAULT 0,
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. AGENCY MANAGEMENT
-- ============================================================================

CREATE TABLE agency_admin_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  verification_status agency_verification_status DEFAULT 'pending',
  is_certified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspension_date TIMESTAMP WITH TIME ZONE,
  ban_reason TEXT,
  ban_date TIMESTAMP WITH TIME ZONE,
  reactivation_date TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES admin_users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agency_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  document_type VARCHAR(100),
  document_number VARCHAR(100),
  file_url TEXT,
  file_path VARCHAR(500),
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agency_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES admin_users(id)
);

CREATE TABLE agency_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  total_packages BIGINT DEFAULT 0,
  active_packages BIGINT DEFAULT 0,
  total_bookings BIGINT DEFAULT 0,
  completed_bookings BIGINT DEFAULT 0,
  cancelled_bookings BIGINT DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  commission_earned DECIMAL(15, 2) DEFAULT 0,
  customer_satisfaction DECIMAL(5, 2),
  complaint_count INT DEFAULT 0,
  response_time_hours DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, metric_date)
);

-- ============================================================================
-- 5. DESTINATION MANAGEMENT
-- ============================================================================

CREATE TABLE destination_cms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  country VARCHAR(100),
  state_province VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status destination_status DEFAULT 'active',
  featured_image_url TEXT,
  banner_image_url TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  category VARCHAR(100),
  difficulty_level VARCHAR(50),
  best_season VARCHAR(100),
  weather_api_data JSONB,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE destination_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE destination_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destination_cms(id) ON DELETE CASCADE,
  tag_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE destination_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destination_cms(id) ON DELETE CASCADE,
  media_type VARCHAR(50), -- photo, video
  media_url TEXT,
  media_path VARCHAR(500),
  title VARCHAR(255),
  description TEXT,
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE destination_attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destination_cms(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  entry_fee DECIMAL(10, 2),
  opening_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE destination_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destination_cms(id) ON DELETE CASCADE,
  event_name VARCHAR(255),
  event_date DATE,
  event_time TIME,
  description TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE travel_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destination_cms(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT,
  author VARCHAR(255),
  created_by UUID REFERENCES admin_users(id),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. PACKAGE MANAGEMENT
-- ============================================================================

CREATE TABLE package_admin_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL,
  status package_status DEFAULT 'draft',
  approval_status VARCHAR(50),
  rejection_reason TEXT,
  approved_by UUID REFERENCES admin_users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES admin_users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  view_count BIGINT DEFAULT 0,
  booking_count BIGINT DEFAULT 0,
  conversion_rate DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE package_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL,
  addon_name VARCHAR(255),
  addon_description TEXT,
  addon_price DECIMAL(10, 2),
  is_optional BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE package_special_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL,
  offer_name VARCHAR(255),
  discount_type VARCHAR(50), -- percentage, fixed
  discount_value DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  max_usage INT,
  current_usage INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. BOOKING MANAGEMENT
-- ============================================================================

CREATE TABLE booking_admin_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE,
  internal_notes TEXT,
  customer_service_notes TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason VARCHAR(255),
  reassigned_from UUID REFERENCES admin_users(id),
  reassigned_to UUID REFERENCES admin_users(id),
  reassigned_at TIMESTAMP WITH TIME ZONE,
  handled_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE booking_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  document_type VARCHAR(100), -- invoice, voucher, ticket, qr_pass
  document_url TEXT,
  document_path VARCHAR(500),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. PAYMENT MANAGEMENT
-- ============================================================================

CREATE TABLE payment_gateway_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(100) NOT NULL UNIQUE,
  api_key TEXT,
  api_secret TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_test_mode BOOLEAN DEFAULT TRUE,
  config_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payment_transaction_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL UNIQUE,
  admin_notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES admin_users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  manual_verification_notes TEXT,
  is_suspicious BOOLEAN DEFAULT FALSE,
  fraud_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE settlement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_type VARCHAR(50), -- agency, commission, tax
  settlement_period_start DATE,
  settlement_period_end DATE,
  total_amount DECIMAL(15, 2),
  settled_amount DECIMAL(15, 2),
  pending_amount DECIMAL(15, 2),
  status VARCHAR(50), -- pending, processing, completed
  processed_by UUID REFERENCES admin_users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. REFUND MANAGEMENT
-- ============================================================================

CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  refund_amount DECIMAL(15, 2),
  refund_reason TEXT,
  status refund_status DEFAULT 'requested',
  approval_notes TEXT,
  approved_by UUID REFERENCES admin_users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_notes TEXT,
  rejected_by UUID REFERENCES admin_users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE refund_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE DEFAULT CURRENT_DATE,
  total_refund_requests BIGINT DEFAULT 0,
  approved_refunds BIGINT DEFAULT 0,
  rejected_refunds BIGINT DEFAULT 0,
  total_refund_amount DECIMAL(15, 2) DEFAULT 0,
  refund_fraud_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_date)
);

-- ============================================================================
-- 10. WALLET MANAGEMENT
-- ============================================================================

CREATE TABLE wallet_admin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  wallet_id UUID,
  transaction_type VARCHAR(100), -- credit, debit, freeze, unfreeze
  amount DECIMAL(15, 2),
  admin_id UUID REFERENCES admin_users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reward_points_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  points INT,
  reward_type VARCHAR(100),
  description TEXT,
  admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. REVIEW & RATING MANAGEMENT
-- ============================================================================

CREATE TABLE review_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL UNIQUE,
  content_type VARCHAR(100), -- package, agency, destination
  user_id UUID REFERENCES users(id),
  review_text TEXT,
  rating INT,
  status VARCHAR(50), -- approved, rejected, pending
  rejection_reason VARCHAR(255),
  moderated_by UUID REFERENCES admin_users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  has_offensive_content BOOLEAN DEFAULT FALSE,
  has_spam BOOLEAN DEFAULT FALSE,
  is_fake BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 12. COMMUNITY MANAGEMENT
-- ============================================================================

CREATE TABLE community_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID,
  comment_id UUID,
  user_id UUID REFERENCES users(id),
  report_reason VARCHAR(255),
  report_status VARCHAR(50), -- pending, approved, rejected
  moderated_by UUID REFERENCES admin_users(id),
  moderation_action VARCHAR(100), -- approve, reject, delete
  moderation_notes TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE community_groups_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  member_count BIGINT DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 13. LIVE STREAMING MANAGEMENT
-- ============================================================================

CREATE TABLE live_stream_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL UNIQUE,
  broadcaster_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  viewer_count BIGINT DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  is_recorded BOOLEAN DEFAULT FALSE,
  moderation_status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stream_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_stream_admin(id) ON DELETE CASCADE,
  action_type VARCHAR(100), -- mute_user, block_user, end_stream
  target_user_id UUID REFERENCES users(id),
  admin_id UUID REFERENCES admin_users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 14. CHAT & MESSAGING MANAGEMENT
-- ============================================================================

CREATE TABLE messaging_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL UNIQUE,
  sender_id UUID REFERENCES users(id),
  chat_type VARCHAR(50), -- user_chat, agency_chat, group_chat
  message_content TEXT,
  is_reported BOOLEAN DEFAULT FALSE,
  report_reason VARCHAR(255),
  is_spam BOOLEAN DEFAULT FALSE,
  is_abuse BOOLEAN DEFAULT FALSE,
  moderation_status VARCHAR(50),
  moderated_by UUID REFERENCES admin_users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 15. AI MANAGEMENT
-- ============================================================================

CREATE TABLE ai_assistant_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_type VARCHAR(100), -- travel_planner, recommendation, budget_planner
  is_enabled BOOLEAN DEFAULT TRUE,
  usage_count BIGINT DEFAULT 0,
  accuracy_score DECIMAL(5, 2),
  last_trained TIMESTAMP WITH TIME ZONE,
  training_data_version VARCHAR(50),
  config_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_assistant_id UUID REFERENCES ai_assistant_admin(id),
  metric_date DATE DEFAULT CURRENT_DATE,
  usage_count BIGINT DEFAULT 0,
  unique_users BIGINT DEFAULT 0,
  accuracy_rate DECIMAL(5, 2),
  response_time_ms DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ai_assistant_id, metric_date)
);

-- ============================================================================
-- 16. MARKETING MANAGEMENT
-- ============================================================================

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(50), -- percentage, fixed
  discount_value DECIMAL(10, 2),
  max_usage INT,
  current_usage INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name VARCHAR(255),
  campaign_type VARCHAR(100), -- email, push, sms
  target_audience JSONB,
  message_content TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  sent_count BIGINT DEFAULT 0,
  open_count BIGINT DEFAULT 0,
  click_count BIGINT DEFAULT 0,
  conversion_count BIGINT DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referral_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referral_code VARCHAR(50) NOT NULL UNIQUE,
  referred_user_id UUID REFERENCES users(id),
  reward_amount DECIMAL(10, 2),
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 17. NOTIFICATION MANAGEMENT
-- ============================================================================

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(100),
  channel VARCHAR(50), -- push, email, sms, in_app
  template_name VARCHAR(255),
  template_content TEXT,
  variables JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID UNIQUE,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  send_status VARCHAR(50),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 18. CONTENT MANAGEMENT SYSTEM
-- ============================================================================

CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name VARCHAR(255) NOT NULL,
  page_slug VARCHAR(255) NOT NULL UNIQUE,
  page_type VARCHAR(100), -- static, blog, landing
  content TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cms_blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  author VARCHAR(255),
  category VARCHAR(100),
  tags JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count BIGINT DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 19. ADVERTISEMENT MANAGEMENT
-- ============================================================================

CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_name VARCHAR(255),
  ad_type ad_type NOT NULL,
  advertiser_id UUID REFERENCES users(id),
  content_url TEXT,
  media_url TEXT,
  media_path VARCHAR(500),
  target_audience JSONB,
  start_date DATE,
  end_date DATE,
  status ad_status DEFAULT 'draft',
  impression_count BIGINT DEFAULT 0,
  click_count BIGINT DEFAULT 0,
  conversion_count BIGINT DEFAULT 0,
  budget_allocated DECIMAL(15, 2),
  budget_spent DECIMAL(15, 2),
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 20. REPORTS & ANALYTICS
-- ============================================================================

CREATE TABLE financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(100), -- revenue, commission, refund, tax
  report_period_start DATE,
  report_period_end DATE,
  total_amount DECIMAL(15, 2),
  breakdown JSONB,
  generated_by UUID REFERENCES admin_users(id),
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE business_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(100), -- booking, user, agency
  report_period_start DATE,
  report_period_end DATE,
  total_records BIGINT,
  metrics JSONB,
  generated_by UUID REFERENCES admin_users(id),
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exported_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  export_format VARCHAR(50), -- pdf, excel, csv
  file_url TEXT,
  file_path VARCHAR(500),
  exported_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 21. SECURITY CENTER
-- ============================================================================

CREATE TABLE admin_two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT FALSE,
  secret_key TEXT,
  backup_codes TEXT[],
  enabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id)
);

CREATE TABLE device_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  ip_address INET,
  location VARCHAR(255),
  is_trusted BOOLEAN DEFAULT FALSE,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type VARCHAR(100),
  admin_id UUID REFERENCES admin_users(id),
  user_id UUID REFERENCES users(id),
  description TEXT,
  ip_address INET,
  severity VARCHAR(50), -- low, medium, high, critical
  is_investigated BOOLEAN DEFAULT FALSE,
  investigation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fraud_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100), -- user, booking, payment
  entity_id UUID,
  fraud_score DECIMAL(5, 2),
  fraud_indicators JSONB,
  is_flagged BOOLEAN DEFAULT FALSE,
  action_taken VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 22. SUPPORT CENTER
-- ============================================================================

CREATE TABLE support_tickets_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL UNIQUE,
  priority_level VARCHAR(50), -- low, medium, high, critical
  assigned_to UUID REFERENCES admin_users(id),
  escalation_level INT DEFAULT 0,
  resolution_time_hours DECIMAL(10, 2),
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE support_call_center_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES admin_users(id),
  call_id VARCHAR(255),
  call_duration INT,
  call_date TIMESTAMP WITH TIME ZONE,
  customer_id UUID REFERENCES users(id),
  issue_resolved BOOLEAN DEFAULT FALSE,
  rating INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 23. API & INTEGRATION MANAGEMENT
-- ============================================================================

CREATE TABLE api_keys_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_name VARCHAR(255),
  api_key_secret TEXT,
  created_by UUID REFERENCES admin_users(id),
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit INT,
  usage_count BIGINT DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys_admin(id),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INT,
  response_time_ms INT,
  request_ip INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE third_party_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name VARCHAR(100),
  integration_type VARCHAR(100), -- maps, weather, payment, sms, email
  api_endpoint TEXT,
  api_key TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 24. SYSTEM SETTINGS
-- ============================================================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(50), -- string, number, boolean, json
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE system_localization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code VARCHAR(10),
  country_code VARCHAR(10),
  currency_code VARCHAR(5),
  timezone VARCHAR(100),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE system_backup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name VARCHAR(255),
  backup_type VARCHAR(50), -- full, incremental
  backup_size BIGINT,
  backup_location VARCHAR(500),
  backup_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 25. ENTERPRISE FEATURES
-- ============================================================================

CREATE TABLE business_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(100), -- predictive_analytics, revenue_forecast, demand_forecast
  metric_date DATE,
  prediction_data JSONB,
  confidence_score DECIMAL(5, 2),
  actual_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255),
  rule_type VARCHAR(100), -- auto_refund, auto_commission, auto_notification
  trigger_condition JSONB,
  action_to_execute JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  execution_count BIGINT DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE automation_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID REFERENCES automation_rules(id),
  execution_status VARCHAR(50), -- success, failed
  execution_details JSONB,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(255),
  model_type VARCHAR(100), -- user_behavior, dynamic_pricing, recommendation
  model_version VARCHAR(50),
  accuracy_score DECIMAL(5, 2),
  is_active BOOLEAN DEFAULT FALSE,
  deployment_date TIMESTAMP WITH TIME ZONE,
  model_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_status ON admin_users(status);
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_dashboard_metrics_date ON dashboard_metrics(metric_date);
CREATE INDEX idx_user_admin_details_status ON user_admin_details(verification_status, kyc_status);
CREATE INDEX idx_user_login_history_user_id ON user_login_history(user_id, login_time DESC);
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id, document_type);
CREATE INDEX idx_agency_performance_metrics_date ON agency_performance_metrics(agency_id, metric_date DESC);
CREATE INDEX idx_destination_cms_status ON destination_cms(status);
CREATE INDEX idx_package_admin_details_status ON package_admin_details(status);
CREATE INDEX idx_booking_admin_details_booking_id ON booking_admin_details(booking_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status, created_at DESC);
CREATE INDEX idx_review_moderation_status ON review_moderation(status, moderated_at DESC);
CREATE INDEX idx_community_moderation_status ON community_moderation(report_status);
CREATE INDEX idx_advertisements_status ON advertisements(status, created_at DESC);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(campaign_type, created_at DESC);
CREATE INDEX idx_device_tracking_admin_id ON device_tracking(admin_id);
CREATE INDEX idx_suspicious_activities_severity ON suspicious_activities(severity, created_at DESC);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_automation_execution_logs_created_at ON automation_execution_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admins and the admin themselves can view admin_users
CREATE POLICY admin_users_select ON admin_users FOR SELECT
  USING (
    (SELECT role FROM admin_users WHERE user_id = auth.uid()) = 'super_admin'::admin_role
    OR user_id = auth.uid()
  );

-- ============================================================================
-- END OF ADMIN PANEL SCHEMA
-- ============================================================================
