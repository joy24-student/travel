export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "card"
  | "paypal"
  | "bank_transfer"
  | "wallet";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface PaymentRequest {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  gateway: string;
  status: PaymentStatus;
  gatewayResponse?: Record<string, unknown>;
  error?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

export interface IPaymentProvider {
  readonly name: PaymentMethod;
  initiate(request: PaymentRequest): Promise<PaymentResult>;
  verify(transactionId: string): Promise<PaymentStatus>;
  refund(request: RefundRequest): Promise<boolean>;
}
