-- Shopno Wallet system

CREATE TABLE IF NOT EXISTS shopno_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'BDT',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shopno_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES shopno_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'BDT',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shopno_wallets_user_id ON shopno_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_shopno_wallet_txn_wallet_id ON shopno_wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_shopno_wallet_txn_user_id ON shopno_wallet_transactions(user_id);

ALTER TABLE shopno_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopno_wallet_transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON shopno_wallets TO authenticated;
GRANT SELECT, INSERT ON shopno_wallet_transactions TO authenticated;

CREATE POLICY shopno_wallets_owner ON shopno_wallets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY shopno_wallet_txn_owner ON shopno_wallet_transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  DROP TRIGGER IF EXISTS shopno_wallets_updated_at_trigger ON shopno_wallets;
  CREATE TRIGGER shopno_wallets_updated_at_trigger
    BEFORE UPDATE ON shopno_wallets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;

-- Extend booking_payments.payment_method to include all new providers
ALTER TABLE booking_payments
  DROP CONSTRAINT IF EXISTS booking_payments_payment_method_check;

ALTER TABLE booking_payments
  ADD CONSTRAINT booking_payments_payment_method_check
  CHECK (payment_method IN ('card', 'wallet', 'bank_transfer', 'points', 'cash', 'bkash', 'nagad', 'rocket', 'paypal'));
