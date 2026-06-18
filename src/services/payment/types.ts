/**
 * Payment Service Types
 * Complete type definitions for all payment methods
 */

export type PaymentMethod =
  | "google_pay"
  | "bkash"
  | "nagad"
  | "card"
  | "wallet"
  | "bank_transfer"
  | "rocket"
  | "paypal";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export interface PaymentRequest {
  bookingId?: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  phone?: string;
  email?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  gateway: string;
  gatewayResponse?: any;
  redirectUrl?: string;
  errorMessage?: string;
  paymentId?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface IPaymentProvider {
  initiate(request: PaymentRequest): Promise<PaymentResult>;
  verify(transactionId: string): Promise<PaymentStatus>;
  refund(request: RefundRequest): Promise<boolean>;
}

export interface GooglePayConfig {
  merchantId: string;
  merchantName: string;
  gatewayId: string;
  gatewayMerchantId: string;
}

export interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  baseUrl: string;
  sandboxMode: boolean;
}

export interface NagadConfig {
  merchantId: string;
  merchantNumber: string;
  publicKey: string;
  privateKey: string;
  baseUrl: string;
  sandboxMode: boolean;
}
