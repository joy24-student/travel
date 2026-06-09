-- Booking system domain tables connected to Supabase Auth users.
-- Includes traveler details, passenger details, booking flow, invoices,
-- vouchers, trip timeline events, and refund tracking.

CREATE TABLE IF NOT EXISTS traveler_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  date_of_birth DATE,
  passport_number TEXT,
  passport_expiry DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES traveler_details(id) ON DELETE SET NULL,
  booking_reference TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL CHECK (product_type IN ('hotel', 'flight', 'train', 'tour', 'package', 'car')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'details_pending', 'payment_pending', 'confirmed', 'completed', 'cancelled', 'refunded')),
  flow_step TEXT NOT NULL DEFAULT 'traveler_details' CHECK (flow_step IN ('traveler_details', 'passenger_details', 'review', 'payment', 'confirmed', 'voucher_issued', 'completed', 'cancelled', 'refund')),
  origin_city TEXT,
  destination_city TEXT NOT NULL,
  destination_country TEXT,
  start_date DATE,
  end_date DATE,
  number_of_guests INTEGER NOT NULL DEFAULT 1 CHECK (number_of_guests > 0),
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  service_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  final_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (final_price >= 0),
  notes TEXT,
  special_requests TEXT,
  cancellation_policy JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  product_id UUID,
  product_type TEXT NOT NULL CHECK (product_type IN ('hotel', 'flight', 'train', 'tour', 'package', 'car')),
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (line_total >= 0),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  passenger_type TEXT NOT NULL DEFAULT 'adult' CHECK (passenger_type IN ('adult', 'child', 'infant')),
  seat_preference TEXT,
  meal_preference TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card', 'wallet', 'bank_transfer', 'points', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded')),
  transaction_id TEXT UNIQUE,
  payment_gateway TEXT,
  payment_gateway_response JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'void', 'refunded')),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  billing_details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'cancelled', 'expired')),
  qr_payload TEXT,
  redemption_instructions TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'traveler_added', 'passenger_added', 'reviewed', 'payment_created', 'payment_completed', 'confirmed', 'invoice_issued', 'voucher_issued', 'departed', 'arrived', 'completed', 'cancelled', 'refund_requested', 'refund_updated')),
  title TEXT NOT NULL,
  description TEXT,
  event_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  location TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES booking_payments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'under_review', 'approved', 'processing', 'paid', 'rejected', 'cancelled')),
  provider_refund_id TEXT,
  reviewer_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS booking_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cancellation_reason TEXT,
  refund_amount NUMERIC(12, 2) DEFAULT 0,
  refund_status TEXT NOT NULL DEFAULT 'pending',
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_traveler_details_user_id ON traveler_details(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_flow_step ON bookings(flow_step);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id ON booking_passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_status ON booking_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_user_id ON vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_timeline_booking_id ON trip_timeline_events(booking_id, event_at);
CREATE INDEX IF NOT EXISTS idx_refund_requests_booking_id ON refund_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_user_id ON booking_cancellations(user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'traveler_details',
    'bookings',
    'booking_passengers',
    'booking_payments',
    'invoices',
    'vouchers',
    'refund_requests'
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

ALTER TABLE traveler_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_cancellations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  traveler_details,
  bookings,
  booking_items,
  booking_passengers,
  booking_payments,
  invoices,
  vouchers,
  trip_timeline_events,
  refund_requests,
  booking_cancellations
TO authenticated;

CREATE POLICY traveler_details_owner_all ON traveler_details
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookings_owner_all ON bookings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY booking_items_owner_all ON booking_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid()));

CREATE POLICY booking_passengers_owner_all ON booking_passengers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_passengers.booking_id AND bookings.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_passengers.booking_id AND bookings.user_id = auth.uid()));

CREATE POLICY booking_payments_owner_all ON booking_payments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_payments.booking_id AND bookings.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_payments.booking_id AND bookings.user_id = auth.uid()));

CREATE POLICY invoices_owner_all ON invoices
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY vouchers_owner_all ON vouchers
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY trip_timeline_events_owner_all ON trip_timeline_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY refund_requests_owner_all ON refund_requests
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY booking_cancellations_owner_all ON booking_cancellations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
