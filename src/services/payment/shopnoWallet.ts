/**
 * Shopno Wallet Payment Provider
 * Internal wallet system for the app
 */

import { supabase } from "../../utils/supabase";
import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

export class ShopnoWalletProvider implements IPaymentProvider {
  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Check wallet balance
      const balance = await this.getBalance(request.userId);

      if (balance < request.amount) {
        return {
          success: false,
          status: "failed",
          gateway: "shopno_wallet",
          errorMessage: "Insufficient wallet balance",
        };
      }

      // Deduct from wallet
      const { data, error } = await supabase
        .from("wallet_transactions")
        .insert([
          {
            user_id: request.userId,
            amount: -request.amount,
            type: "payment",
            status: "completed",
            reference: request.reference,
            booking_id: request.bookingId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        status: "completed",
        transactionId: data.id,
        gateway: "shopno_wallet",
        gatewayResponse: data,
        paymentId: data.id,
      };
    } catch (error: any) {
      return {
        success: false,
        status: "failed",
        gateway: "shopno_wallet",
        errorMessage: error.message || "Wallet payment failed",
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("status")
        .eq("id", transactionId)
        .single();

      if (error) return "failed";
      return data.status as PaymentStatus;
    } catch {
      return "failed";
    }
  }

  async refund(request: RefundRequest): Promise<boolean> {
    try {
      const { data: transaction } = await supabase
        .from("wallet_transactions")
        .select("user_id")
        .eq("id", request.transactionId)
        .single();

      if (!transaction) return false;

      const { error } = await supabase.from("wallet_transactions").insert([
        {
          user_id: transaction.user_id,
          amount: request.amount,
          type: "refund",
          status: "completed",
          reference: `Refund for ${request.transactionId}`,
        },
      ]);

      return !error;
    } catch {
      return false;
    }
  }

  static async getBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", userId);

      if (error) throw error;

      const balance = data.reduce((sum, t) => sum + t.amount, 0);
      return Math.max(0, balance);
    } catch {
      return 0;
    }
  }

  async getBalance(userId: string): Promise<number> {
    return ShopnoWalletProvider.getBalance(userId);
  }

  static async topUp(userId: string, amount: number): Promise<boolean> {
    try {
      const { error } = await supabase.from("wallet_transactions").insert([
        {
          user_id: userId,
          amount: amount,
          type: "topup",
          status: "completed",
        },
      ]);

      return !error;
    } catch {
      return false;
    }
  }
}
