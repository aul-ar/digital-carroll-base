import "server-only";

import crypto from "node:crypto";
import { PaymentMethod } from "@/lib/invoice";

export type EWalletProvider = "ovo" | "shopeepay" | "linkaja";

export interface DuitkuTransactionPayload {
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;

  businessName?: string;

  packageName: string;
  packageDescription: string;

  amount: number;
  paymentMethod: PaymentMethod;
  ewalletProvider?: EWalletProvider;

  invoiceId: string;
  orderId: string;

  notes?: string;
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

const ewalletProviders: readonly EWalletProvider[] = [
  "ovo",
  "shopeepay",
  "linkaja",
];

export function isEWalletProvider(value: unknown): value is EWalletProvider {
  return (
    typeof value === "string" &&
    (ewalletProviders as readonly string[]).includes(value)
  );
}

function getPaymentCode(
  ...codes: (string | undefined)[]
) {
  for (const code of codes) {
    const normalizedCode = code?.trim();

    if (normalizedCode) {
      return normalizedCode;
    }
  }

  return null;
}

export function mapPaymentMethodToDuitkuCode(
  paymentMethod: PaymentMethod,
  ewalletProvider: EWalletProvider = "ovo"
) {
  switch (paymentMethod) {
    case "virtual_account":
      return getPaymentCode(
        process.env.DUITKU_VA_PAYMENT_CODE,
        "BC"
      );
    case "qris":
      return getPaymentCode(
        process.env.DUITKU_QRIS_PAYMENT_CODE,
        "SQ"
      );
    case "ewallet":
      switch (ewalletProvider) {
        case "ovo":
          return getPaymentCode(
            process.env.DUITKU_OVO_PAYMENT_CODE,
            process.env.DUITKU_EWALLET_PAYMENT_CODE,
            "OV"
          );
        case "shopeepay":
          return getPaymentCode(
            process.env.DUITKU_SHOPEEPAY_PAYMENT_CODE,
            "SA"
          );
        case "linkaja":
          return getPaymentCode(
            process.env.DUITKU_LINKAJA_PAYMENT_CODE,
            "LF"
          );
        default:
          return null;
      }
    default:
      return null;
  }
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
    .update(
      `${input.merchantCode}${input.merchantOrderId}${input.amount}${input.apiKey}`
    )
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
    .update(
      `${input.merchantCode}${input.merchantOrderId}${input.amount}${input.apiKey}`
    )
    .digest("hex");
}

export function buildDuitkuCreateInvoiceSignature(input: {
  merchantCode: string;
  timestamp: string;
  apiKey: string;
}) {
  return crypto
    .createHmac("sha256", input.apiKey)
    .update(
      `${input.merchantCode}${input.timestamp}`
    )
    .digest("hex");
}

export function buildDuitkuCallbackSignature(input: {
  merchantCode: string;
  amount: string | number;
  merchantOrderId: string;
  apiKey: string;
}) {
  return crypto
    .createHmac("sha256", input.apiKey)
    .update(
      `${input.merchantCode}${input.amount}${input.merchantOrderId}`
    )
    .digest("hex");
}

export function normalizePhoneNumber(
  phoneNumber: string
) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export function validateDuitkuRequestPayload(
  payload: Partial<DuitkuTransactionPayload>
) {
  const requiredFields: (keyof DuitkuTransactionPayload)[] =
    [
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

  const missingFields = requiredFields.filter(
    (field) => {
      const value = payload[field];

      return (
        value === undefined ||
        value === null ||
        value === ""
      );
    }
  );

  if (missingFields.length > 0) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message: `Field wajib belum lengkap: ${missingFields.join(
        ", "
      )}.`,
    };
  }

  if (
    typeof payload.amount !== "number" ||
    !Number.isFinite(payload.amount) ||
    payload.amount <= 0
  ) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message:
        "Amount harus berupa number dan lebih besar dari 0.",
    };
  }

  if (
    payload.paymentMethod ===
      "bank_transfer_manual" ||
    payload.paymentMethod ===
      "ewallet_manual"
  ) {
    return {
      valid: false,
      code: "INVALID_PAYMENT_METHOD",
      message:
        "Metode pembayaran belum aktif atau tidak dapat diproses melalui Duitku.",
    };
  }

  if (
    payload.paymentMethod === "ewallet" &&
    !isEWalletProvider(payload.ewalletProvider ?? "ovo")
  ) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message:
        "Provider e-wallet harus salah satu dari ovo, shopeepay, atau linkaja.",
    };
  }

  return {
    valid: true,
    code: "OK",
    message: "Payload valid.",
  };
}
