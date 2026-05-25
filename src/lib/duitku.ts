import "server-only";

import crypto from "node:crypto";
import { PaymentMethod } from "@/lib/invoice";

export interface DuitkuTransactionPayload {
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  packageName: string;
  packageDescription: string;
  amount: number;
  paymentMethod: PaymentMethod;
  invoiceId: string;
  orderId: string;
}

export function getDuitkuConfig() {
  const sandboxBaseUrl = process.env.DUITKU_SANDBOX_BASE_URL ?? "https://sandbox.duitku.com";

  return {
    merchantCode: process.env.DUITKU_MERCHANT_CODE ?? "",
    apiKey: process.env.DUITKU_API_KEY ?? "",
    sandboxBaseUrl: sandboxBaseUrl.replace(/\/$/, ""),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://carrollbase.com",
    mockEnabled: process.env.NEXT_PUBLIC_ENABLE_DUITKU_MOCK === "true",
  };
}

export function mapPaymentMethodToDuitkuCode(paymentMethod: PaymentMethod) {
  // Sesuaikan paymentMethod code dengan channel yang aktif di dashboard Duitku Sandbox.
  const paymentMethodCodes: Partial<Record<PaymentMethod, string>> = {
    virtual_account: process.env.DUITKU_VA_PAYMENT_CODE || "VC",
    qris: process.env.DUITKU_QRIS_PAYMENT_CODE || "SP",
    ewallet: process.env.DUITKU_EWALLET_PAYMENT_CODE || "OV",
  };

  return paymentMethodCodes[paymentMethod] ?? null;
}

export function createMerchantOrderId(orderId: string) {
  return orderId;
}

export function buildDuitkuSignature(input: {
  merchantCode: string;
  merchantOrderId: string;
  amount: number;
  apiKey: string;
}) {
  // Duitku API v2 inquiry signature:
  // stringToSign = merchantCode + merchantOrderId + paymentAmount
  // signature = HMAC_SHA256(stringToSign, apiKey)
  return crypto
    .createHmac("sha256", input.apiKey)
    .update(`${input.merchantCode}${input.merchantOrderId}${input.amount}`)
    .digest("hex");
}

export function buildDuitkuInquirySignature(input: {
  merchantCode: string;
  merchantOrderId: string;
  amount: number;
  apiKey: string;
}) {
  // Duitku API v2 inquiry endpoint uses HMAC SHA256 over:
  // merchantCode + merchantOrderId + paymentAmount.
  return crypto
    .createHmac("sha256", input.apiKey)
    .update(`${input.merchantCode}${input.merchantOrderId}${input.amount}`)
    .digest("hex");
}

export function buildDuitkuCallbackSignature(input: {
  merchantCode: string;
  amount: string | number;
  merchantOrderId: string;
  apiKey: string;
}) {
  // Duitku callback signature:
  // stringToSign = merchantCode + amount + merchantOrderId
  // signature = HMAC_SHA256(stringToSign, apiKey)
  return crypto
    .createHmac("sha256", input.apiKey)
    .update(`${input.merchantCode}${input.amount}${input.merchantOrderId}`)
    .digest("hex");
}

export function normalizePhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export function validateDuitkuRequestPayload(payload: Partial<DuitkuTransactionPayload>) {
  const requiredFields: (keyof DuitkuTransactionPayload)[] = [
    "customerName",
    "customerEmail",
    "customerWhatsapp",
    "packageName",
    "packageDescription",
    "amount",
    "paymentMethod",
    "invoiceId",
    "orderId",
  ];

  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message: `Field wajib belum lengkap: ${missingFields.join(", ")}.`,
    };
  }

  if (typeof payload.amount !== "number" || !Number.isFinite(payload.amount) || payload.amount <= 0) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message: "Amount harus berupa number dan lebih besar dari 0.",
    };
  }

  if (
    payload.paymentMethod === "bank_transfer_manual" ||
    payload.paymentMethod === "ewallet_manual" ||
    !mapPaymentMethodToDuitkuCode(payload.paymentMethod as PaymentMethod)
  ) {
    return {
      valid: false,
      code: "INVALID_PAYMENT_METHOD",
      message: "Metode pembayaran tidak dapat diproses melalui Duitku Sandbox.",
    };
  }

  return {
    valid: true,
    code: "OK",
    message: "Payload valid.",
  };
}
