import { supabase } from "../../utils/supabase";
import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

export class ShopnoWalletProvider implements IPaymentProvider {
  readonly name = "wallet" as const;

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const { data: wallet, error } = await supabase
        .from("shopno_wallets")
        .select("id, balance, currency")
        .eq("user_id", request.userId)
        .single();

      if (error || !wallet) {
        return {
          success: false,
          transactionId: "",
          gateway: "shopno_wallet",
          status: "failed",
          error: "Wallet not found. Please top up your Shopno Wallet.",
        };
      }

      if (wallet.balance < request.amount) {
        return {
          success: false,
          transactionId: "",
          gateway: "shopno_wallet",
          status: "failed",
          error: `Insufficient balance. Available: ${wallet.currency} ${wallet.balance}`,
        };
      }

      const transactionId = `SWL-${Date.now().toString(36).toUpperCase()}`;

      // Deduct balance
      await supabase
        .from("shopno_wallets")
        .update({
          balance: wallet.balance - request.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      // Record transaction
      await supabase.from("shopno_wallet_transactions").insert([
        {
          wallet_id: wallet.id,
          user_id: request.userId,
          transaction_id: transactionId,
          booking_id: request.bookingId,
          type: "debit",
          amount: request.amount,
          currency: request.currency,
          description: `Payment for booking ${request.bookingId}`,
          status: "completed",
        },
      ]);

      return {
        success: true,
        transactionId,
        gateway: "shopno_wallet",
        status: "completed",
        gatewayResponse: {
          walletId: wallet.id,
          remainingBalance: wallet.balance - request.amount,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: "",
        gateway: "shopno_wallet",
        status: "failed",
        error: err.message,
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    const { data } = await supabase
      .from("shopno_wallet_transactions")
      .select("status")
      .eq("transaction_id", transactionId)
      .single();
    return (data?.status as PaymentStatus) ?? "failed";
  }

  async refund(request: RefundRequest): Promise<boolean> {
    const { data: tx } = await supabase
      .from("shopno_wallet_transactions")
      .select("wallet_id, user_id")
      .eq("transaction_id", request.transactionId)
      .single();

    if (!tx) return false;

    const { data: wallet } = await supabase
      .from("shopno_wallets")
      .select("balance")
      .eq("id", tx.wallet_id)
      .single();

    await supabase
      .from("shopno_wallets")
      .update({
        balance: (wallet?.balance ?? 0) + request.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tx.wallet_id);

    await supabase.from("shopno_wallet_transactions").insert([
      {
        wallet_id: tx.wallet_id,
        user_id: tx.user_id,
        transaction_id: `REF-${request.transactionId}`,
        type: "credit",
        amount: request.amount,
        description: `Refund: ${request.reason}`,
        status: "completed",
      },
    ]);

    return true;
  }

  // Extra: get wallet balance
  static async getBalance(userId: string) {
    const { data } = await supabase
      .from("shopno_wallets")
      .select("balance, currency")
      .eq("user_id", userId)
      .single();
    return data ?? { balance: 0, currency: "BDT" };
  }

  // Extra: top up wallet
  static async topUp(userId: string, amount: number) {
    const { data: wallet } = await supabase
      .from("shopno_wallets")
      .select("id, balance")
      .eq("user_id", userId)
      .single();

    if (wallet) {
      await supabase
        .from("shopno_wallets")
        .update({
          balance: wallet.balance + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);
    } else {
      await supabase
        .from("shopno_wallets")
        .insert([{ user_id: userId, balance: amount, currency: "BDT" }]);
    }
  }
}
