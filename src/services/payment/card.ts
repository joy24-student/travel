import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY ?? "<stripe_secret_key>";
const STRIPE_BASE_URL = "https://api.stripe.com/v1";

export class CardProvider implements IPaymentProvider {
  readonly name = "card" as const;

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const body = new URLSearchParams({
        amount: String(Math.round(request.amount * 100)), // cents
        currency: request.currency.toLowerCase(),
        "metadata[booking_id]": request.bookingId,
        "metadata[user_id]": request.userId,
        "payment_method_types[]": "card",
        confirm: "false",
      });

      const res = await fetch(`${STRIPE_BASE_URL}/payment_intents`, {
        method: "POST",
        headers: this.headers(),
        body,
      });

      const data = await res.json();

      if (data.error) {
        return {
          success: false,
          transactionId: "",
          gateway: "stripe",
          status: "failed",
          error: data.error.message,
        };
      }

      return {
        success: true,
        transactionId: data.id,
        gateway: "stripe",
        status: "pending",
        gatewayResponse: {
          clientSecret: data.client_secret,
          status: data.status,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: "",
        gateway: "stripe",
        status: "failed",
        error: err.message,
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    const res = await fetch(
      `${STRIPE_BASE_URL}/payment_intents/${transactionId}`,
      {
        headers: this.headers(),
      },
    );
    const data = await res.json();
    const map: Record<string, PaymentStatus> = {
      succeeded: "completed",
      processing: "processing",
      requires_payment_method: "failed",
      canceled: "failed",
    };
    return map[data.status] ?? "pending";
  }

  async refund(request: RefundRequest): Promise<boolean> {
    const body = new URLSearchParams({
      payment_intent: request.transactionId,
      amount: String(Math.round(request.amount * 100)),
      reason: "requested_by_customer",
    });

    const res = await fetch(`${STRIPE_BASE_URL}/refunds`, {
      method: "POST",
      headers: this.headers(),
      body,
    });

    const data = await res.json();
    return data.status === "succeeded" || data.status === "pending";
  }

  private headers() {
    return {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }
}
