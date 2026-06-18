/**
 * Card Payment Provider
 * Standard credit/debit card processing
 */

import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

export class CardProvider implements IPaymentProvider {
  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const transactionId = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        status: "pending",
        transactionId: transactionId,
        gateway: "card",
        gatewayResponse: {
          message: "Card payment initiated",
        },
        paymentId: transactionId,
      };
    } catch (error: any) {
      return {
        success: false,
        status: "failed",
        gateway: "card",
        errorMessage: error.message || "Failed to initiate card payment",
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    return "completed";
  }

  async refund(request: RefundRequest): Promise<boolean> {
    return true;
  }
}
