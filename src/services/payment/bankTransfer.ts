/**
 * Bank Transfer Payment Provider
 */

import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

export class BankTransferProvider implements IPaymentProvider {
  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const transactionId = `BANK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        status: "pending",
        transactionId: transactionId,
        gateway: "bank_transfer",
        gatewayResponse: {
          message: "Bank transfer initiated",
        },
        paymentId: transactionId,
      };
    } catch (error: any) {
      return {
        success: false,
        status: "failed",
        gateway: "bank_transfer",
        errorMessage: error.message || "Failed to initiate bank transfer",
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
