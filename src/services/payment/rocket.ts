import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

const ROCKET_BASE_URL =
  process.env.ROCKET_BASE_URL ?? "https://api.dutchbanglabank.com/rocket/v1";
const ROCKET_APP_KEY = process.env.ROCKET_APP_KEY ?? "<rocket_app_key>";
const ROCKET_APP_SECRET =
  process.env.ROCKET_APP_SECRET ?? "<rocket_app_secret>";

export class RocketProvider implements IPaymentProvider {
  readonly name = "bank_transfer" as const;

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const res = await fetch(`${ROCKET_BASE_URL}/checkout/init`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          app_key: ROCKET_APP_KEY,
          store_id: request.bookingId,
          amount: String(request.amount),
          currency: request.currency,
          order_id: `RKT-${request.bookingId.slice(0, 8)}-${Date.now()}`,
          success_url: "https://your-app.com/payment/success",
          fail_url: "https://your-app.com/payment/fail",
          cancel_url: "https://your-app.com/payment/cancel",
        }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        return {
          success: false,
          transactionId: "",
          gateway: "rocket",
          status: "failed",
          error: data.message,
        };
      }
      return {
        success: true,
        transactionId: data.session_key ?? data.tran_id,
        gateway: "rocket",
        status: "processing",
        gatewayResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: "",
        gateway: "rocket",
        status: "failed",
        error: err.message,
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    const res = await fetch(`${ROCKET_BASE_URL}/checkout/verify`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        app_key: ROCKET_APP_KEY,
        session_key: transactionId,
      }),
    });
    const data = await res.json();
    if (data.pay_status === "Successful") return "completed";
    if (data.pay_status === "Pending") return "processing";
    return "failed";
  }

  async refund(request: RefundRequest): Promise<boolean> {
    const res = await fetch(`${ROCKET_BASE_URL}/checkout/refund`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        app_key: ROCKET_APP_KEY,
        tran_id: request.transactionId,
        amount: String(request.amount),
        remarks: request.reason,
      }),
    });
    const data = await res.json();
    return data.status === "success";
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ROCKET_APP_KEY}`,
      "X-App-Secret": ROCKET_APP_SECRET,
    };
  }
}
