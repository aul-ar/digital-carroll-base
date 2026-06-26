"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import { pricingPlans } from "@/data/pricing";
import { createInvoiceData, formatCurrency, parsePackagePrice, PaymentMethod, type Invoice } from "@/lib/invoice";
import type { EWalletProvider } from "@/lib/duitku";
import { getStoredInvoice, saveInvoice } from "@/lib/invoice-storage";
import { getWhatsAppLink } from "@/utils/whatsapp";

interface CheckoutCustomer {
  fullName: string;
  email: string;
  whatsapp: string;
  businessName: string;
  notes: string;
}

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: typeof CreditCard;
  badgeLabel?: string;
  disabled?: boolean;
  details?: {
    label: string;
    value: string;
  }[];
}

interface EWalletProviderOption {
  id: EWalletProvider;
  label: string;
}

interface PendingAutomaticPaymentPayload {
  planId: string;
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

interface DuitkuCreateTransactionResponse {
  success: boolean;
  code?: string;
  message?: string;
  detail?: string;
  paymentUrl?: string | null;
  redirectUrl?: string | null;
  data?: {
    reference?: string;
    paymentUrl?: string | null;
    vaNumber?: string;
    qrString?: string;
    status?: string;
    statusCode?: string;
    statusMessage?: string;
    merchantOrderId?: string;
    invoiceId?: string;
    orderId?: string;
  };
}

type PreparedPaymentStatus = "pending" | "ready" | "failed";

interface PreparedPayment {
  payloadHash: string;
  payload: PendingAutomaticPaymentPayload;
  status: PreparedPaymentStatus;
  paymentUrl?: string;
  response?: DuitkuCreateTransactionResponse;
  error?: string;
  createdAt: number;
}

const pendingPaymentStorageKey = "digital-carroll-base:pending-payment";
const preparedPaymentStorageKey = "digital-carroll-base:prepared-payment";
const preparedPaymentMaxAgeMs = 8 * 60 * 1000;
const preparedPaymentPendingReuseMs = 2 * 60 * 1000;
const backgroundPrepareDebounceMs = 1000;
const paymentMethods: readonly PaymentMethod[] = [
  "virtual_account",
  "qris",
  "ewallet",
  "bank_transfer_manual",
  "ewallet_manual",
];
const ewalletProviders: readonly EWalletProvider[] = [
  "ovo",
  "shopeepay",
  "linkaja",
];

const ewalletProviderOptions: EWalletProviderOption[] = [
  { id: "ovo", label: "OVO" },
  { id: "shopeepay", label: "ShopeePay" },
  { id: "linkaja", label: "LinkAja" },
];

const automaticPaymentOptions: PaymentOption[] = [
  {
    id: "virtual_account",
    title: "Virtual Account",
    description:
      "Pembayaran melalui nomor Virtual Account yang dibuat otomatis oleh sistem Duitku untuk setiap transaksi.",
    icon: Landmark,
  },
  {
    id: "qris",
    title: "QRIS All Payment",
    description:
      "Pembayaran melalui QRIS yang dapat digunakan oleh berbagai aplikasi seperti Mobile Banking, OVO, DANA, GoPay, dan ShopeePay.",
    icon: QrCode,
    badgeLabel: "Duitku",
    disabled: false,
  },
  {
    id: "ewallet",
    title: "E-Wallet",
    description:
      "Bayar menggunakan OVO, ShopeePay, atau LinkAja melalui sistem pembayaran otomatis Duitku.",
    icon: Wallet,
    badgeLabel: "Duitku",
    disabled: false,
  },
];

const manualPaymentOptions: PaymentOption[] = [
  {
    id: "bank_transfer_manual",
    title: "Transfer Bank BCA",
    description:
      "Alternatif pembayaran manual melalui transfer bank. Setelah transfer, customer perlu melakukan konfirmasi melalui WhatsApp.",
    icon: Landmark,
    details: [
      { label: "Bank", value: "BCA" },
      { label: "Nomor Rekening", value: "6580812382" },
      { label: "Atas Nama", value: "Aulia Abdul Rahman" },
    ],
  },
  {
    id: "ewallet_manual",
    title: "E-Wallet Manual",
    description:
      "Alternatif pembayaran manual melalui nomor e-wallet. Gunakan metode ini jika pembayaran otomatis belum tersedia atau mengalami kendala.",
    icon: Wallet,
    details: [
      { label: "Nomor", value: "081288430688" },
      { label: "Atas Nama", value: "Aulia Abdul Rahman" },
    ],
  },
];

const initialCustomer: CheckoutCustomer = {
  fullName: "",
  email: "",
  whatsapp: "",
  businessName: "",
  notes: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (paymentMethods as readonly string[]).includes(value)
  );
}

function isEWalletProvider(value: unknown): value is EWalletProvider {
  return (
    typeof value === "string" &&
    (ewalletProviders as readonly string[]).includes(value)
  );
}

function isPreparedPaymentStatus(value: unknown): value is PreparedPaymentStatus {
  return value === "pending" || value === "ready" || value === "failed";
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function parsePendingAutomaticPaymentPayload(
  value: unknown
): PendingAutomaticPaymentPayload | null {
  if (!isRecord(value) || !isPaymentMethod(value.paymentMethod)) {
    return null;
  }

  if (
    typeof value.planId !== "string" ||
    typeof value.customerName !== "string" ||
    typeof value.customerEmail !== "string" ||
    typeof value.customerWhatsapp !== "string" ||
    typeof value.packageName !== "string" ||
    typeof value.packageDescription !== "string" ||
    typeof value.amount !== "number" ||
    typeof value.invoiceId !== "string" ||
    typeof value.orderId !== "string"
  ) {
    return null;
  }

  return {
    planId: value.planId,
    customerName: value.customerName,
    customerEmail: value.customerEmail,
    customerWhatsapp: value.customerWhatsapp,
    businessName: optionalString(value.businessName),
    packageName: value.packageName,
    packageDescription: value.packageDescription,
    amount: value.amount,
    paymentMethod: value.paymentMethod,
    ...(isEWalletProvider(value.ewalletProvider)
      ? { ewalletProvider: value.ewalletProvider }
      : {}),
    invoiceId: value.invoiceId,
    orderId: value.orderId,
    notes: optionalString(value.notes),
  };
}

function getPendingPaymentPayloadHash(payload: PendingAutomaticPaymentPayload) {
  return JSON.stringify({
    planId: payload.planId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerWhatsapp: payload.customerWhatsapp,
    businessName: payload.businessName ?? "",
    packageName: payload.packageName,
    packageDescription: payload.packageDescription,
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
    ewalletProvider: payload.ewalletProvider ?? null,
    invoiceId: payload.invoiceId,
    orderId: payload.orderId,
    notes: payload.notes ?? "",
  });
}

function parseDuitkuCreateTransactionResponse(
  value: unknown
): DuitkuCreateTransactionResponse | undefined {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return undefined;
  }

  const transaction: DuitkuCreateTransactionResponse = {
    success: value.success,
  };
  const code = optionalString(value.code);
  const message = optionalString(value.message);
  const detail = optionalString(value.detail);
  const paymentUrl = optionalString(value.paymentUrl);
  const redirectUrl = optionalString(value.redirectUrl);

  if (code !== undefined) {
    transaction.code = code;
  }

  if (message !== undefined) {
    transaction.message = message;
  }

  if (detail !== undefined) {
    transaction.detail = detail;
  }

  if (paymentUrl !== undefined) {
    transaction.paymentUrl = paymentUrl;
  }

  if (redirectUrl !== undefined) {
    transaction.redirectUrl = redirectUrl;
  }

  if (isRecord(value.data)) {
    const data: NonNullable<DuitkuCreateTransactionResponse["data"]> = {};
    const reference = optionalString(value.data.reference);
    const dataPaymentUrl = optionalString(value.data.paymentUrl);
    const vaNumber = optionalString(value.data.vaNumber);
    const qrString = optionalString(value.data.qrString);
    const status = optionalString(value.data.status);
    const statusCode = optionalString(value.data.statusCode);
    const statusMessage = optionalString(value.data.statusMessage);
    const merchantOrderId = optionalString(value.data.merchantOrderId);
    const invoiceId = optionalString(value.data.invoiceId);
    const orderId = optionalString(value.data.orderId);

    if (reference !== undefined) {
      data.reference = reference;
    }

    if (dataPaymentUrl !== undefined) {
      data.paymentUrl = dataPaymentUrl;
    }

    if (vaNumber !== undefined) {
      data.vaNumber = vaNumber;
    }

    if (qrString !== undefined) {
      data.qrString = qrString;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (statusCode !== undefined) {
      data.statusCode = statusCode;
    }

    if (statusMessage !== undefined) {
      data.statusMessage = statusMessage;
    }

    if (merchantOrderId !== undefined) {
      data.merchantOrderId = merchantOrderId;
    }

    if (invoiceId !== undefined) {
      data.invoiceId = invoiceId;
    }

    if (orderId !== undefined) {
      data.orderId = orderId;
    }

    transaction.data = data;
  }

  return transaction;
}

function readPendingPaymentPayload() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(pendingPaymentStorageKey);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return parsePendingAutomaticPaymentPayload(parsed);
  } catch {
    return null;
  }
}

function writePendingPaymentPayload(payload: PendingAutomaticPaymentPayload) {
  try {
    window.sessionStorage.setItem(
      pendingPaymentStorageKey,
      JSON.stringify(payload)
    );
    return true;
  } catch {
    return false;
  }
}

function readPreparedPayment() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(preparedPaymentStorageKey);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
        if (
      !isRecord(parsed) ||
      typeof parsed.payloadHash !== "string" ||
      !isPreparedPaymentStatus(parsed.status) ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }

    const payload = parsePendingAutomaticPaymentPayload(parsed.payload);

    if (!payload) {
      return null;
    }

    if (Date.now() - parsed.createdAt > preparedPaymentMaxAgeMs) {
      window.sessionStorage.removeItem(preparedPaymentStorageKey);
      return null;
    }

    return {
      payloadHash: parsed.payloadHash,
      payload,
      status: parsed.status,
      paymentUrl: optionalString(parsed.paymentUrl),
      response: parseDuitkuCreateTransactionResponse(parsed.response),
      error: optionalString(parsed.error),
      createdAt: parsed.createdAt,
    } satisfies PreparedPayment;
  } catch {
    return null;
  }
}

function writePreparedPayment(preparedPayment: PreparedPayment) {
  try {
    window.sessionStorage.setItem(
      preparedPaymentStorageKey,
      JSON.stringify(preparedPayment)
    );
    return true;
  } catch {
    return false;
  }
}

function getDuitkuErrorMessage(
  code?: string,
  serverMessage?: string,
  detail?: string
) {
  if (code === "MISSING_DUITKU_ENV") {
    return "Konfigurasi Duitku belum lengkap. Periksa Environment Variables di Vercel.";
  }

  if (code === "INVALID_PAYMENT_METHOD") {
    return serverMessage || "Metode pembayaran ini belum aktif di Duitku Production.";
  }

  if (code === "DUITKU_REQUEST_FAILED") {
    const baseMessage =
      "Duitku menolak transaksi. Periksa konfigurasi channel pembayaran atau signature.";

    return detail ? `${baseMessage} Detail: ${detail}` : baseMessage;
  }

  return serverMessage || "Gagal menyiapkan transaksi Duitku. Silakan coba lagi.";
}

function getPaymentRedirectUrl(transaction: DuitkuCreateTransactionResponse) {
  const candidates = [
    transaction.data?.paymentUrl,
    transaction.paymentUrl,
    transaction.redirectUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string" || !candidate.trim()) {
      continue;
    }

    try {
      return new URL(candidate, window.location.origin).toString();
    } catch {
      return null;
    }
  }

  return null;
}

function isPaymentPreparingResponse(transaction: DuitkuCreateTransactionResponse) {
  return (
    transaction.success &&
    (transaction.code === "PAYMENT_PREPARING" ||
      transaction.data?.status === "preparing_payment" ||
      transaction.data?.statusCode === "PROCESSING")
  );
}

function getPreparedPaymentUrl(preparedPayment: PreparedPayment) {
  return (
    preparedPayment.paymentUrl ??
    (preparedPayment.response
      ? getPaymentRedirectUrl(preparedPayment.response)
      : null)
  );
}

function updateStoredPreparedInvoice(
  payload: PendingAutomaticPaymentPayload,
  transaction: DuitkuCreateTransactionResponse,
  paymentUrl: string
) {
  const invoice = getStoredInvoice(payload.invoiceId);

  if (!invoice) {
    return;
  }

  const updatedInvoice: Invoice = {
    ...invoice,
    provider: "duitku",
    providerReference: transaction.data?.reference,
    providerPaymentUrl: paymentUrl,
    vaNumber: transaction.data?.vaNumber,
    qrString: transaction.data?.qrString,
    merchantOrderId: payload.orderId,
    paymentStatus: "pending",
  };

  saveInvoice(updatedInvoice);
}

async function readTransactionResponse(response: Response) {
  try {
    return (await response.json()) as DuitkuCreateTransactionResponse;
  } catch {
    return {
      success: false,
      message: "Server tidak mengembalikan respons pembayaran yang valid.",
    } satisfies DuitkuCreateTransactionResponse;
  }
}

function isManualPayment(method: PaymentMethod | "") {
  return method === "bank_transfer_manual" || method === "ewallet_manual";
}

function isAutomaticPaymentActive(method: PaymentMethod | ""): method is PaymentMethod {
  return (
    method === "virtual_account" ||
    method === "qris" ||
    method === "ewallet"
  );
}

interface CheckoutClientProps {
  initialPlanId?: string | null;
}

export function CheckoutClient({ initialPlanId }: CheckoutClientProps) {
  const router = useRouter();
  const selectedPlan = useMemo(
    () => pricingPlans.find((plan) => plan.id === initialPlanId) ?? null,
    [initialPlanId]
  );

  const [customer, setCustomer] = useState<CheckoutCustomer>(initialCustomer);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | "">("");
  const [selectedEWalletProvider, setSelectedEWalletProvider] = useState<EWalletProvider>("ovo");
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInvoiceId, setManualInvoiceId] = useState("");
  const [preparedPaymentStatus, setPreparedPaymentStatus] = useState<
    PreparedPaymentStatus | "idle"
  >("idle");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePayloadHashRef = useRef<string | null>(null);
  const activeRequestRef = useRef<Promise<void> | null>(null);
  const isPreparingRef = useRef(false);

  const selectedAmount = selectedPlan ? parsePackagePrice(selectedPlan.price) : 0;
  const hasCheckoutAmount = selectedAmount > 0;
  const hasRequiredAutomaticPaymentFields = Boolean(
    customer.fullName.trim() &&
      customer.email.trim() &&
      isValidEmail(customer.email) &&
      customer.whatsapp.trim()
  );

  const createPendingInvoice = useCallback(
    (method: PaymentMethod) => {
      if (!selectedPlan) {
        throw new Error("Checkout plan is not available.");
      }

      const invoice = createInvoiceData({
        paymentMethod: method,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerWhatsapp: customer.whatsapp,
        businessName: customer.businessName,
        packageName: selectedPlan.name,
        packageDescription: selectedPlan.description,
        packagePrice: selectedAmount,
        notes: customer.notes,
      });

      saveInvoice(invoice);
      return invoice;
    },
    [
      customer.businessName,
      customer.email,
      customer.fullName,
      customer.notes,
      customer.whatsapp,
            selectedAmount,
      selectedPlan,
    ]
  );

  const buildPendingPaymentPayload = useCallback(
    (invoice: Invoice, method: PaymentMethod): PendingAutomaticPaymentPayload => {
      if (!selectedPlan) {
        throw new Error("Checkout plan is not available.");
      }

      return {
        planId: selectedPlan.id,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerWhatsapp: invoice.customerWhatsapp,
        businessName: invoice.businessName,
        packageName: invoice.packageName,
        packageDescription: invoice.packageDescription,
        amount: invoice.total,
        paymentMethod: invoice.paymentMethod,
        ...(method === "ewallet" ? { ewalletProvider: selectedEWalletProvider } : {}),
        invoiceId: invoice.invoiceId,
        orderId: invoice.orderId,
        notes: invoice.notes,
      };
    },
    [selectedEWalletProvider, selectedPlan]
  );

  const isPreparedPaymentForCurrentCheckout = useCallback(
    (pendingPayment: PendingAutomaticPaymentPayload, method: PaymentMethod) => {
      if (!selectedPlan) {
        return false;
      }

      const expectedEWalletProvider =
        method === "ewallet" ? selectedEWalletProvider : undefined;

      return (
        pendingPayment.planId === selectedPlan.id &&
        pendingPayment.customerName === customer.fullName &&
        pendingPayment.customerEmail === customer.email &&
        pendingPayment.customerWhatsapp === customer.whatsapp &&
        (pendingPayment.businessName ?? "") === customer.businessName &&
        pendingPayment.packageName === selectedPlan.name &&
        pendingPayment.packageDescription === selectedPlan.description &&
        pendingPayment.amount === selectedAmount &&
        pendingPayment.paymentMethod === method &&
        (pendingPayment.ewalletProvider ?? undefined) === expectedEWalletProvider &&
        (pendingPayment.notes ?? "") === customer.notes
      );
    },
    [
      customer.businessName,
      customer.email,
      customer.fullName,
      customer.notes,
      customer.whatsapp,
      selectedAmount,
      selectedEWalletProvider,
      selectedPlan,
    ]
  );

  const getOrCreatePendingAutomaticPayment = useCallback(
    (method: PaymentMethod) => {
      const existingPendingPayment = readPendingPaymentPayload();

      if (
        existingPendingPayment &&
        isPreparedPaymentForCurrentCheckout(existingPendingPayment, method)
      ) {
        return existingPendingPayment;
      }

      const invoice = createPendingInvoice(method);
      const pendingPayment = buildPendingPaymentPayload(invoice, method);
      writePendingPaymentPayload(pendingPayment);
      return pendingPayment;
    },
    [
      buildPendingPaymentPayload,
      createPendingInvoice,
      isPreparedPaymentForCurrentCheckout,
    ]
  );

  const prepareAutomaticPayment = useCallback(
    async (method: PaymentMethod) => {
      const existingPreparedPayment = readPreparedPayment();

      if (
        existingPreparedPayment &&
        isPreparedPaymentForCurrentCheckout(existingPreparedPayment.payload, method)
      ) {
        const existingPaymentUrl = getPreparedPaymentUrl(existingPreparedPayment);

        if (
          existingPreparedPayment.status === "pending" &&
          Date.now() - existingPreparedPayment.createdAt <
            preparedPaymentPendingReuseMs
        ) {
          activePayloadHashRef.current = existingPreparedPayment.payloadHash;
          console.info("[PAYMENT PREP] skipped_existing_pending", {
            payloadHash: existingPreparedPayment.payloadHash,
            orderId: existingPreparedPayment.payload.orderId,
            invoiceId: existingPreparedPayment.payload.invoiceId,
          });
          setPreparedPaymentStatus("pending");
          return;
        }

        if (existingPreparedPayment.status === "ready" && existingPaymentUrl) {
          activePayloadHashRef.current = existingPreparedPayment.payloadHash;
          console.info("[PAYMENT PREP] skipped_existing_ready", {
            payloadHash: existingPreparedPayment.payloadHash,
            orderId: existingPreparedPayment.payload.orderId,
            invoiceId: existingPreparedPayment.payload.invoiceId,
          });
          setPreparedPaymentStatus("ready");
          return;
        }

        setPreparedPaymentStatus(existingPreparedPayment.status);
        return;
      }

      let payloadHash: string | null = null;
      let pendingPayment: PendingAutomaticPaymentPayload | null = null;
      let requestPromise: Promise<void> | null = null;

      try {
        pendingPayment = getOrCreatePendingAutomaticPayment(method);
        payloadHash = getPendingPaymentPayloadHash(pendingPayment);

        if (activePayloadHashRef.current === payloadHash) {
          console.info("[PAYMENT PREP] skipped_active_hash", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
          });
          setPreparedPaymentStatus("pending");
          return;
        }

        const preparedPayment = readPreparedPayment();
        const preparedPaymentUrl = preparedPayment
          ? getPreparedPaymentUrl(preparedPayment)
          : null;

        if (
          preparedPayment?.payloadHash === payloadHash &&
          preparedPayment.status === "pending" &&
          Date.now() - preparedPayment.createdAt < preparedPaymentPendingReuseMs
        ) {
          activePayloadHashRef.current = payloadHash;
          console.info("[PAYMENT PREP] skipped_existing_pending", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
          });
          setPreparedPaymentStatus("pending");
          return;
        }

        if (
          preparedPayment?.payloadHash === payloadHash &&
          preparedPayment.status === "ready" &&
          preparedPaymentUrl
        ) {
          activePayloadHashRef.current = payloadHash;
          console.info("[PAYMENT PREP] skipped_existing_ready", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
          });
          setPreparedPaymentStatus("ready");
          return;
        }

        activePayloadHashRef.current = payloadHash;
        isPreparingRef.current = true;

        const pendingPreparedPayment: PreparedPayment = {
          payloadHash,
          payload: pendingPayment,
          status: "pending",
          createdAt: Date.now(),
        };

        writePendingPaymentPayload(pendingPayment);
        writePreparedPayment(pendingPreparedPayment);
        setPreparedPaymentStatus("pending");

        console.info("[PAYMENT PREP] started", {
          payloadHash,
          orderId: pendingPayment.orderId,
          invoiceId: pendingPayment.invoiceId,
        });

        requestPromise = (async () => {
          const response = await fetch("/api/duitku/create-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pendingPayment),
          });
          const transaction = await readTransactionResponse(response);

          if (!response.ok || !transaction.success) {
            const errorMessage = getDuitkuErrorMessage(
              transaction.code,
              transaction.message,
              transaction.detail
            );

            if (activePayloadHashRef.current === payloadHash) {
              writePreparedPayment({
                ...pendingPreparedPayment,
                status: "failed",
                response: transaction,
                error: errorMessage,
                createdAt: Date.now(),
              });
            }

            console.info("[PAYMENT PREP] failed", {
              payloadHash,
              orderId: pendingPayment?.orderId,
              invoiceId: pendingPayment?.invoiceId,
              code: transaction.code,
            });

            if (isPreparedPaymentForCurrentCheckout(pendingPayment, method)) {
              setPreparedPaymentStatus("failed");
            }

            return;
          }

          const paymentUrl = getPaymentRedirectUrl(transaction);

          if (!paymentUrl) {
            if (isPaymentPreparingResponse(transaction)) {
              if (activePayloadHashRef.current === payloadHash) {
                writePreparedPayment({
                  ...pendingPreparedPayment,
                  status: "pending",
                  response: transaction,
                  createdAt: Date.now(),
                });
              }

              console.info("[PAYMENT PREP] ready_pending_provider", {
                payloadHash,
                orderId: pendingPayment.orderId,
                invoiceId: pendingPayment.invoiceId,
              });

              if (isPreparedPaymentForCurrentCheckout(pendingPayment, method)) {
                setPreparedPaymentStatus("pending");
              }

              return;
            }

            const errorMessage =
              "Transaksi berhasil dibuat, tetapi halaman pembayaran Duitku belum tersedia.";

            if (activePayloadHashRef.current === payloadHash) {
              writePreparedPayment({
                ...pendingPreparedPayment,
                status: "failed",
                error: errorMessage,
                response: transaction,
                createdAt: Date.now(),
              });
            }

            console.info("[PAYMENT PREP] failed", {
              payloadHash,
              orderId: pendingPayment?.orderId,
              invoiceId: pendingPayment?.invoiceId,
              reason: "missing_payment_url",
            });

            if (isPreparedPaymentForCurrentCheckout(pendingPayment, method)) {
              setPreparedPaymentStatus("failed");
            }

            return;
          }

          if (activePayloadHashRef.current === payloadHash) {
            updateStoredPreparedInvoice(pendingPayment, transaction, paymentUrl);

            writePreparedPayment({
              ...pendingPreparedPayment,
              status: "ready",
              paymentUrl,
              response: transaction,
              createdAt: Date.now(),
            });
          }

          console.info("[PAYMENT PREP] ready", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
          });

          if (isPreparedPaymentForCurrentCheckout(pendingPayment, method)) {
            setPreparedPaymentStatus("ready");
          }
        })();

        activeRequestRef.current = requestPromise;
        await requestPromise;
      } catch (reason) {
        if (
          payloadHash &&
          pendingPayment &&
          activePayloadHashRef.current === payloadHash
        ) {
          writePreparedPayment({
            payloadHash,
            payload: pendingPayment,
            status: "failed",
            error: "Terjadi kendala jaringan saat menghubungkan ke Duitku.",
            createdAt: Date.now(),
          });

          console.info("[PAYMENT PREP] failed", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
            reason: reason instanceof Error ? reason.message : "network_error",
          });

          if (isPreparedPaymentForCurrentCheckout(pendingPayment, method)) {
            setPreparedPaymentStatus("failed");
          }
        }
      } finally {
        if (activeRequestRef.current === requestPromise) {
          activeRequestRef.current = null;
        }

        if (activePayloadHashRef.current === payloadHash) {
          isPreparingRef.current = false;
        }
      }
    },
    [
      getOrCreatePendingAutomaticPayment,
      isPreparedPaymentForCurrentCheckout,
    ]
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (
      !selectedPlan ||
      !hasCheckoutAmount ||
      !selectedPaymentMethod ||
      !isAutomaticPaymentActive(selectedPaymentMethod) ||
      !hasRequiredAutomaticPaymentFields
    ) {
      return;
    }

    const method = selectedPaymentMethod;

    debounceTimerRef.current = setTimeout(() => {
      void prepareAutomaticPayment(method);
    }, backgroundPrepareDebounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    hasCheckoutAmount,
    hasRequiredAutomaticPaymentFields,
    prepareAutomaticPayment,
    selectedPaymentMethod,
    selectedPlan,
  ]);

  if (!selectedPlan) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950/25 dark:text-red-200 sm:p-6">
        <h2 className="text-lg font-bold">Paket checkout tidak ditemukan</h2>
        <p className="mt-2 leading-relaxed">
          Silakan pilih paket dari halaman harga agar nama paket, deskripsi, dan nominal pembayaran sesuai data terbaru.
        </p>
        <Link
          href="/harga"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Halaman Harga
        </Link>
      </div>
    );
  }

  const consultationLink = getWhatsAppLink(
    `Halo Digital Carroll Base, saya ingin konsultasi untuk paket ${selectedPlan.name}.`
  );

  if (!hasCheckoutAmount) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/25 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Paket Perlu Konsultasi</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            Paket ini belum memiliki nominal tetap, jadi tidak akan dikirim ke Duitku. Silakan konsultasi dulu agar tim Digital Carroll Base dapat menentukan scope dan estimasi biaya yang tepat.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={consultationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-500"
            >
              Konsultasi via WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/harga"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Halaman Harga
            </Link>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-28">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Ringkasan Pesanan</p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">{selectedPlan.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selectedPlan.description}</p>

          <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Plan ID</span>
              <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{selectedPlan.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Harga</span>
              <span className="text-right font-extrabold text-slate-950 dark:text-white">{selectedPlan.price}</span>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  const checkoutPlan = selectedPlan;
  const checkoutAmount = selectedAmount;

  function updateCustomer(field: keyof CheckoutCustomer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function validateForm() {
    if (!customer.fullName.trim()) {
      return "Nama lengkap wajib diisi.";
    }

    if (!customer.email.trim()) {
      return "Email wajib diisi.";
    }

    if (!isValidEmail(customer.email)) {
      return "Format email belum valid.";
    }

    if (!customer.whatsapp.trim()) {
      return "Nomor WhatsApp wajib diisi.";
    }

    return "";
  }

  function validateCheckout() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      return false;
    }
        if (!selectedPaymentMethod) {
      setPaymentError("Silakan pilih metode pembayaran terlebih dahulu.");
      return false;
    }

    if (!hasCheckoutAmount) {
      setPaymentError("Paket ini belum memiliki nominal pembayaran otomatis. Silakan konsultasi via WhatsApp.");
      return false;
    }

    setError("");
    setPaymentError("");
    return true;
  }

  function handleAutomaticPayment(method: PaymentMethod) {
    setIsProcessing(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    try {
      const pendingPayment = getOrCreatePendingAutomaticPayment(method);
      const payloadHash = getPendingPaymentPayloadHash(pendingPayment);
      const preparedPayment = readPreparedPayment();

      if (preparedPayment?.payloadHash === payloadHash) {
        const paymentUrl = getPreparedPaymentUrl(preparedPayment);

        if (preparedPayment.status === "ready" && paymentUrl) {
          console.info("[PAYMENT PREP] skipped_existing_ready", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
          });
          window.location.assign(paymentUrl);
          return;
        }
      }

      if (!writePendingPaymentPayload(pendingPayment)) {
        setPaymentError("Gagal menyiapkan data pembayaran. Silakan coba lagi.");
        setIsProcessing(false);
        return;
      }

      router.push("/payment/processing");
    } catch {
      setPaymentError("Gagal menyiapkan data pembayaran. Silakan coba lagi.");
      setIsProcessing(false);
    }
  }

  function handleManualPayment(method: PaymentMethod) {
    setIsProcessing(true);
    const invoice = createPendingInvoice(method);
    const message = `Halo Digital Carroll Base, saya ingin konfirmasi pembayaran untuk pesanan ${checkoutPlan.name}. Nama saya ${customer.fullName}.`;
    setManualInvoiceId(invoice.invoiceId);
    window.open(getWhatsAppLink(message), "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      setIsProcessing(false);
      router.push(`/invoice/${invoice.invoiceId}`);
    }, 500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCheckout()) {
      return;
    }

    const method = selectedPaymentMethod;

    if (!method) {
      return;
    }

    if (isManualPayment(method)) {
      handleManualPayment(method);
      return;
    }

    if (!isAutomaticPaymentActive(method)) {
      setPaymentError("Metode pembayaran ini belum aktif di Duitku Production.");
      return;
    }

    handleAutomaticPayment(method);
  }

  function renderPaymentCard(option: PaymentOption) {
    const Icon = option.icon;
    const selected = selectedPaymentMethod === option.id;
    const badgeLabel = option.badgeLabel ?? (isManualPayment(option.id) ? "Manual" : "Duitku");
    const badgeClassName = option.disabled
      ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
      : isManualPayment(option.id)
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    const cardClassName = `w-full rounded-2xl border p-4 text-left transition ${
      option.disabled
        ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-75 dark:border-slate-800 dark:bg-slate-900"
        : selected
        ? "border-blue-500 bg-blue-50/80 ring-4 ring-blue-500/10 dark:bg-blue-950/25"
        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
    }`;

    return (
      <div key={option.id} className={cardClassName}>
        <button
          type="button"
          disabled={option.disabled}
          onClick={() => {
            setSelectedPaymentMethod(option.id);
            setPaymentError("");
          }}
          className="w-full text-left disabled:cursor-not-allowed"
        >
          <div className="flex gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                selected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">{option.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badgeClassName}`}>
                  {badgeLabel}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{option.description}</p>
              {option.details && (
                <dl className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900">
                  {option.details.map((detail) => (
                    <div key={detail.label} className="flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-slate-400">{detail.label}</dt>
                      <dd className="text-right font-bold text-slate-800 dark:text-slate-100">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </button>

        {option.id === "ewallet" && selected && (
          <fieldset className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <legend className="sr-only">Pilih provider e-wallet</legend>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Pilih aplikasi e-wallet yang ingin digunakan.
            </p>
            <div className="mt-3 grid gap-2">
              {ewalletProviderOptions.map((provider) => {
                const providerSelected = selectedEWalletProvider === provider.id;

                return (
                  <label
                    key={provider.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      providerSelected
                        ? "border-blue-500 bg-white text-blue-700 dark:bg-slate-950 dark:text-blue-300"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ewalletProvider"
                      value={provider.id}
                      checked={providerSelected}
                      onChange={() => {
                        setSelectedPaymentMethod("ewallet");
                        setSelectedEWalletProvider(provider.id);
                        setPaymentError("");
                      }}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span>{provider.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </div>
    );
  }

  const automaticPreparationMessage =
    selectedPaymentMethod &&
    isAutomaticPaymentActive(selectedPaymentMethod) &&
    hasRequiredAutomaticPaymentFields
      ? preparedPaymentStatus === "pending"
        ? "Sedang menyiapkan pembayaran agar proses lebih cepat..."
        : preparedPaymentStatus === "ready"
          ? "Pembayaran siap. Anda akan diarahkan lebih cepat."
          : preparedPaymentStatus === "failed"
            ? "Pembayaran akan diproses setelah Anda klik lanjut."
          : ""
      : "";

  const submitLabel = isProcessing
    ? "Memproses..."
    : isManualPayment(selectedPaymentMethod)
      ? "Konfirmasi via WhatsApp"
      : "Lanjutkan Pembayaran";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Form Data Pemesan</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Lengkapi data utama agar tim Digital Carroll Base dapat menyiapkan proses briefing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nama lengkap
              <input
                value={customer.fullName}
                onChange={(event) => updateCustomer("fullName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Nama Anda"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Email
              <input
                type="email"
                value={customer.email}
                onChange={(event) => updateCustomer("email", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="email@domain.com"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nomor WhatsApp
              <input
                value={customer.whatsapp}
                onChange={(event) => updateCustomer("whatsapp", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="08xxxxxxxxxx"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nama bisnis / brand
              <input
                value={customer.businessName}
                onChange={(event) => updateCustomer("businessName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Nama bisnis Anda"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:col-span-2">
              Catatan kebutuhan website
              <textarea
                rows={4}
                value={customer.notes}
                onChange={(event) => updateCustomer("notes", event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Contoh: butuh landing page untuk iklan, referensi desain, jumlah halaman, atau fitur khusus."
              />
            </label>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/25 dark:text-red-300">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Pilih Metode Pembayaran</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Silakan pilih metode pembayaran yang paling sesuai. Pembayaran otomatis akan diproses melalui Duitku, sedangkan pembayaran manual memerlukan konfirmasi melalui WhatsApp.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pembayaran Otomatis via Duitku
              </p>
              <div className="grid gap-3 md:grid-cols-3">{automaticPaymentOptions.map(renderPaymentCard)}</div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pembayaran Manual
              </p>
              <div className="grid gap-3 md:grid-cols-2">{manualPaymentOptions.map(renderPaymentCard)}</div>
            </div>
          </div>

          {paymentError && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/25 dark:text-red-300">
              {paymentError}
            </p>
          )}

          {automaticPreparationMessage && (
            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {automaticPreparationMessage}
            </p>
          )}

          {manualInvoiceId && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-200">
              Invoice manual berhasil dibuat.{" "}
              <Link href={`/invoice/${manualInvoiceId}`} className="font-bold underline underline-offset-4">
                Lihat Invoice
              </Link>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isProcessing || !hasCheckoutAmount}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitLabel}
              {!isProcessing && <ArrowRight className="h-4 w-4" />}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Ringkasan Pesanan</p>
        <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">{checkoutPlan.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{checkoutPlan.description}</p>

        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Plan ID</span>
            <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{checkoutPlan.id}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Harga</span>
            <span className="text-right font-extrabold text-slate-950 dark:text-white">{checkoutPlan.price}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Total</span>
            <span className="text-right font-extrabold text-slate-950 dark:text-white">{formatCurrency(checkoutAmount)}</span>
          </div>
        </div>

        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          Harga dapat menyesuaikan scope final, domain, hosting, aset premium, dan integrasi tambahan.
        </p>
      </aside>
    </form>
  );
}