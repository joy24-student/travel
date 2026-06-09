import { supabase } from "../utils/supabase";
import { BkashProvider } from "./payment/bkash";
import { NagadProvider } from "./payment/nagad";
import { RocketProvider } from "./payment/rocket";
import { CardProvider } from "./payment/card";
import { PaypalProvider } from "./payment/paypal";
import { BankTransferProvider } from "./payment/bankTransfer";
import { ShopnoWalletProvider } from "./payment/shopnoWallet";
import type {
  IPaymentProvider,
  PaymentMethod,
  PaymentRequest,
  PaymentResult,
  RefundRequest,
} from "./payment/types";

const providers: Record<PaymentMethod, IPaymentProvider> = {
  bkash: new BkashProvider(),
  nagad: new NagadProvider(),
  rocket: new RocketProvider(),
  card: new CardProvider(),
  paypal: new PaypalProvider(),
  bank_transfer: new BankTransferProvider(),
  wallet: new ShopnoWalletProvider(),
};

export const paymentService = {
  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const provider = providers[request.method];
    const result = await provider.initiate(request);

    await supabase.from("booking_payments").insert([
      {
        booking_id: request.bookingId,
        amount: request.amount,
        currency: request.currency,
        payment_method:
          request.method === "rocket"
            ? "wallet"
            : request.method === "paypal"
              ? "card"
              : request.method,
        payment_status: result.status,
        transaction_id: result.transactionId || null,
        payment_gateway: result.gateway,
        payment_gateway_response: result.gatewayResponse ?? {},
        processed_at: result.success ? new Date().toISOString() : null,
      },
    ]);

    return result;
  },

  async verify(method: PaymentMethod, transactionId: string) {
    const status = await providers[method].verify(transactionId);
    await supabase
      .from("booking_payments")
      .update({
        payment_status: status,
        processed_at: new Date().toISOString(),
      })
      .eq("transaction_id", transactionId);
    return status;
  },

  async refund(
    method: PaymentMethod,
    request: RefundRequest,
  ): Promise<boolean> {
    const success = await providers[method].refund(request);
    if (success) {
      await supabase
        .from("booking_payments")
        .update({ payment_status: "refunded" })
        .eq("transaction_id", request.transactionId);
    }
    return success;
  },

  getSupportedMethods(): PaymentMethod[] {
    return Object.keys(providers) as PaymentMethod[];
  },

  getWalletBalance: ShopnoWalletProvider.getBalance,
  topUpWallet: ShopnoWalletProvider.topUp,
};
