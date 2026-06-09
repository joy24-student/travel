import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  RefundRequest,
} from "./types";

const NAGAD_BASE_URL =
  process.env.NAGAD_BASE_URL ??
  "https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0";
const NAGAD_MERCHANT_ID =
  process.env.NAGAD_MERCHANT_ID ?? "<nagad_merchant_id>";
const NAGAD_PUBLIC_KEY = process.env.NAGAD_PUBLIC_KEY ?? "<nagad_public_key>";
const NAGAD_PRIVATE_KEY =
  process.env.NAGAD_PRIVATE_KEY ?? "<nagad_private_key>";

export class NagadProvider implements IPaymentProvider {
  readonly name = "nagad" as const;

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const orderId = `${request.bookingId}-${Date.now()}`;

      // Step 1: Initialize
      const initRes = await fetch(
        `${NAGAD_BASE_URL}/api/dfs/check-out/initialize/${NAGAD_MERCHANT_ID}/${orderId}`,
        {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify({
            accountNumber: request.metadata?.phoneNumber ?? "",
            dateTime: new Date()
              .toISOString()
              .replace(/[-:.TZ]/g, "")
              .slice(0, 14),
            sensitiveData: this.encrypt({
              merchantId: NAGAD_MERCHANT_ID,
              orderId,
            }),
            signature: this.sign({ merchantId: NAGAD_MERCHANT_ID, orderId }),
          }),
        },
      );

      const initData = await initRes.json();
      if (!initData.sensitiveData) {
        return {
          success: false,
          transactionId: "",
          gateway: "nagad",
          status: "failed",
          error: "Init failed",
        };
      }

      // Step 2: Complete
      const completeRes = await fetch(
        `${NAGAD_BASE_URL}/api/dfs/check-out/complete/${initData.paymentReferenceId}`,
        {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify({
            sensitiveData: this.encrypt({
              merchantId: NAGAD_MERCHANT_ID,
              orderId,
              amount: String(request.amount),
              currencyCode: "050",
            }),
            signature: this.sign({
              merchantId: NAGAD_MERCHANT_ID,
              orderId,
              amount: String(request.amount),
            }),
          }),
        },
      );

      const completeData = await completeRes.json();

      if (completeData.status !== "Success") {
        return {
          success: false,
          transactionId: "",
          gateway: "nagad",
          status: "failed",
          error: completeData.status,
        };
      }

      return {
        success: true,
        transactionId:
          completeData.merchantCallbackURL ?? completeData.paymentReferenceId,
        gateway: "nagad",
        status: "processing",
        gatewayResponse: completeData,
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: "",
        gateway: "nagad",
        status: "failed",
        error: err.message,
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentStatus> {
    const res = await fetch(
      `${NAGAD_BASE_URL}/api/dfs/verify/payment/${transactionId}`,
      { method: "GET", headers: this.headers() },
    );
    const data = await res.json();
    if (data.status === "Success") return "completed";
    if (data.status === "Pending") return "processing";
    return "failed";
  }

  async refund(_request: RefundRequest): Promise<boolean> {
    // Nagad refunds are handled via merchant dashboard / callback
    // Integrate with Nagad refund API when available in your merchant tier
    return false;
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      "X-KM-Api-Version": "v-0.2.0",
      "X-KM-IP-V4": "127.0.0.1",
      "X-KM-Client-Type": "MOBILE_APP",
    };
  }

  // Placeholder — replace with real RSA encryption using NAGAD_PUBLIC_KEY
  private encrypt(data: object): string {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  }

  // Placeholder — replace with real RSA signing using NAGAD_PRIVATE_KEY
  private sign(data: object): string {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  }
}
