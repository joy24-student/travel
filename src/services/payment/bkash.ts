import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

// Replace with real bKash API credentials via environment variables
const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL ?? "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const BKASH_APP_KEY = process.env.BKASH_APP_KEY ?? "<bkash_app_key>";
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET ?? "<bkash_app_secret>";

export class BkashProvider implements IPaymentProvider {
  readonly name = "bkash" as const;

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const token = await this.getToken();

      const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
        method: "POST",
        headers: this.headers(token),
        body: JSON.stringify({
          mode: "0011",
          payerReference: request.userId,
          callbackURL: "https://your-app.com/payment/callback",
          amount: String(request.amount),
          currency: request.currency,
          intent: "sale",
          merchantInvoiceNumber: request.bookingId,
        }),
      });

      const data = await res.json();

      if (data.statusCode !== "0000") {
        return {
          success: false,
          transactionId: "",
          gateway: "bkash",
          status: "failed",
          error: data.statusMessage,
        };
      }

      return {
        success: true,
        transactionId: data.paymentID,
        gateway: "bkash",
        status: "processing",
        gatewayResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: "",
        gateway: "bkash",
        status: "failed",
        error: err.message,
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    const token = await this.getToken();
    const res = await fetch(
      `${BKASH_BASE_URL}/tokenized/checkout/payment/status`,
      {
        method: "POST",
        headers: this.headers(token),
        body: JSON.stringify({ paymentID: transactionId }),
      },
    );
    const data = await res.json();
    if (data.transactionStatus === "Completed") return "completed";
    if (data.transactionStatus === "Initiated") return "processing";
    return "failed";
  }

  async refund(request: RefundRequest): Promise<boolean> {
    const token = await this.getToken();
    const res = await fetch(
      `${BKASH_BASE_URL}/tokenized/checkout/payment/refund`,
      {
        method: "POST",
        headers: this.headers(token),
        body: JSON.stringify({
          paymentID: request.transactionId,
          amount: String(request.amount),
          trxID: request.transactionId,
          sku: "refund",
          reason: request.reason,
        }),
      },
    );
    const data = await res.json();
    return data.statusCode === "0000";
  }

  private async getToken(): Promise<string> {
    const res = await fetch(
      `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          username: BKASH_APP_KEY,
          password: BKASH_APP_SECRET,
        },
        body: JSON.stringify({
          app_key: BKASH_APP_KEY,
          app_secret: BKASH_APP_SECRET,
        }),
      },
    );
    const data = await res.json();
    return data.id_token;
  }

  private headers(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: token,
      "X-APP-Key": BKASH_APP_KEY,
    };
  }
}
