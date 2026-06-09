-- Extend booking_payments.payment_method to include BD payment methods
-- and bank_transfer (previously 'wallet' covered mobile money loosely)

ALTER TABLE booking_payments
  DROP CONSTRAINT IF EXISTS booking_payments_payment_method_check;

ALTER TABLE booking_payments
  ADD CONSTRAINT booking_payments_payment_method_check
  CHECK (payment_method IN ('card', 'wallet', 'bank_transfer', 'points', 'cash', 'bkash', 'nagad'));

-- Table to persist payment provider-specific state (e.g. bKash paymentID, Nagad referenceId)
-- used for polling/webhook verification before confirming booking_payments row
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_payment_id UUID REFERENCES booking_payments(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('bkash', 'nagad', 'card', 'bank_transfer')),
  gateway TEXT NOT NULL,
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  provider_response JSONB NOT NULL DEFAULT '{}',
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_id ON payment_transactions(provider_transaction_id);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON payment_transactions TO authenticated;

CREATE POLICY payment_transactions_owner_all ON payment_transactions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
DO $$
BEGIN
  DROP TRIGGER IF EXISTS payment_transactions_updated_at_trigger ON payment_transactions;
  CREATE TRIGGER payment_transactions_updated_at_trigger
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;
