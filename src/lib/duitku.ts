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
  const baseUrl =
    process.env.DUITKU_BASE_URL ??
    process.env.DUITKU_SANDBOX_BASE_URL ??
    "https://api-prod.duitku.com";

  return {
    merchantCode: process.env.DUITKU_MERCHANT_CODE ?? "",
    apiKey: process.env.DUITKU_API_KEY ?? "",
    baseUrl: baseUrl.replace(/\/$/, ""),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://carrollbase.com",
    mockEnabled: process.env.NEXT_PUBLIC_ENABLE_DUITKU_MOCK === "true",
  };
}

export function mapPaymentMethodToDuitkuCode(paymentMethod: PaymentMethod) {
  const paymentMethodCodes: Partial<Record<PaymentMethod, string>> = {
    virtual_account: process.env.DUITKU_VA_PAYMENT_CODE || "BC",
    qris: process.env.DUITKU_QRIS_PAYMENT_CODE || "",
    ewallet: process.env.DUITKU_EWALLET_PAYMENT_CODE || "",
  };

  const paymentCode = paymentMethodCodes[paymentMethod]?.trim();

  return paymentCode || null;
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
  return crypto
    .createHash("md5")
    .update(`${input.merchantCode}${input.merchantOrderId}${input.amount}${input.apiKey}`)
    .digest("hex");
}

export function buildDuitkuInquirySignature(input: {
  merchantCode: string;
  merchantOrderId: string;
  amount: number;
  apiKey: string;
}) {
  return crypto
    .createHash("md5")
    .update(`${input.merchantCode}${input.merchantOrderId}${input.amount}${input.apiKey}`)
    .digest("hex");
}

export function buildDuitkuCreateInvoiceSignature(input: {
  merchantCode: string;
  timestamp: string;
  apiKey: string;
}) {
  return crypto
    .createHmac("sha256", input.apiKey)
    .update(`${input.merchantCode}${input.timestamp}`)
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

  if (payload.paymentMethod === "bank_transfer_manual" || payload.paymentMethod === "ewallet_manual") {
    return {
      valid: false,
      code: "INVALID_PAYMENT_METHOD",
      message: "Metode pembayaran belum aktif atau tidak dapat diproses melalui Duitku.",
    };
  }

  return {
    valid: true,
    code: "OK",
    message: "Payload valid.",
  };
}
