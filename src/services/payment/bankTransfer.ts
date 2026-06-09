import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

// Bank transfer is instruction-based; funds are verified manually or via webhook
export class BankTransferProvider implements IPaymentProvider {
  readonly name = "bank_transfer" as const;

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    // Generate a unique transfer reference for the user to include in their transfer
    const transferRef = `TRF-${request.bookingId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      transactionId: transferRef,
      gateway: "bank_transfer",
      status: "pending",
      gatewayResponse: {
        instructions: this.getInstructions(request.currency),
        transferReference: transferRef,
        amount: request.amount,
        currency: request.currency,
      },
    };
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    // In production: query your internal records or bank webhook events
    // transactionId here is the transfer reference
    console.log(
      `[BankTransfer] Manual verification required for: ${transactionId}`,
    );
    return "pending";
  }

  async refund(request: RefundRequest): Promise<boolean> {
    // Bank refunds are processed manually; log and notify ops team
    console.log(
      `[BankTransfer] Refund requested for ${request.transactionId}: ${request.amount} — ${request.reason}`,
    );
    return true;
  }

  private getInstructions(currency: string): Record<string, string> {
    const accounts: Record<string, Record<string, string>> = {
      BDT: {
        bankName: "Dutch-Bangla Bank Limited",
        accountName: "<your_company_name>",
        accountNumber: "<account_number>",
        routingNumber: "<routing_number>",
        branch: "<branch_name>",
      },
      USD: {
        bankName: "<your_bank_name>",
        accountName: "<your_company_name>",
        accountNumber: "<account_number>",
        swiftCode: "<swift_code>",
      },
    };
    return accounts[currency] ?? accounts["USD"];
  }
}
