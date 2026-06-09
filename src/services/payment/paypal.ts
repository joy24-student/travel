import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

const PAYPAL_BASE_URL =
  process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "<paypal_client_id>";
const PAYPAL_CLIENT_SECRET =
  process.env.PAYPAL_CLIENT_SECRET ?? "<paypal_client_secret>";

export class PaypalProvider implements IPaymentProvider {
  readonly name = "card" as const;

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: request.bookingId,
              amount: {
                currency_code: request.currency,
                value: request.amount.toFixed(2),
              },
            },
          ],
          application_context: {
            return_url: "https://your-app.com/payment/success",
            cancel_url: "https://your-app.com/payment/cancel",
          },
        }),
      });
      const data = await res.json();
      if (data.status !== "CREATED") {
        return {
          success: false,
          transactionId: "",
          gateway: "paypal",
          status: "failed",
          error: data.message,
        };
      }
      const approveLink = data.links?.find(
        (l: any) => l.rel === "approve",
      )?.href;
      return {
        success: true,
        transactionId: data.id,
        gateway: "paypal",
        status: "pending",
        gatewayResponse: { orderId: data.id, approveUrl: approveLink },
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: "",
        gateway: "paypal",
        status: "failed",
        error: err.message,
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    const token = await this.getAccessToken();
    const res = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${transactionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    const map: Record<string, PaymentStatus> = {
      COMPLETED: "completed",
      APPROVED: "processing",
      CREATED: "pending",
      VOIDED: "failed",
    };
    return map[data.status] ?? "pending";
  }

  async refund(request: RefundRequest): Promise<boolean> {
    const token = await this.getAccessToken();
    const res = await fetch(
      `${PAYPAL_BASE_URL}/v2/payments/captures/${request.transactionId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: { value: request.amount.toFixed(2), currency_code: "USD" },
          note_to_payer: request.reason,
        }),
      },
    );
    const data = await res.json();
    return data.status === "COMPLETED" || data.status === "PENDING";
  }

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");
    const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    return data.access_token;
  }
}
