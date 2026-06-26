"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Invoice, PaymentMethod } from "@/lib/invoice";
import { getStoredInvoice, saveInvoice } from "@/lib/invoice-storage";

type EWalletProvider = "ovo" | "shopeepay" | "linkaja";

interface PendingPaymentPayload {
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
    reference?: string | null;
    paymentUrl?: string | null;
    vaNumber?: string | null;
    qrString?: string | null;
    status?: string | null;
    statusCode?: string | null;
    statusMessage?: string | null;
    merchantOrderId?: string | null;
    invoiceId?: string | null;
    orderId?: string | null;
  };
}

interface PaymentStatusResponse {
  success: boolean;
  status?: "processing" | "ready" | "failed";
  code?: string;
  message?: string;
  data?: {
    invoiceId?: string;
    orderId?: string;
    merchantOrderId?: string | null;
    reference?: string | null;
    paymentUrl?: string | null;
    vaNumber?: string | null;
    qrString?: string | null;
    paymentStatus?: string | null;
    invoiceStatus?: string | null;
  };
}

type PreparedPaymentStatus = "pending" | "ready" | "failed";

interface PreparedPayment {
  payloadHash: string;
  payload: PendingPaymentPayload;
  status: PreparedPaymentStatus;
  paymentUrl?: string;
  response?: DuitkuCreateTransactionResponse;
  error?: string;
  createdAt: number;
}

type ProcessingState = "loading" | "missing" | "error";

const pendingPaymentStorageKey = "digital-carroll-base:pending-payment";
const preparedPaymentStorageKey = "digital-carroll-base:prepared-payment";
const preparedPaymentMaxAgeMs = 8 * 60 * 1000;
const paymentStatusPollIntervalMs = 700;
const paymentStatusPollTimeoutMs = 45 * 1000;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
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

function parsePendingPaymentPayload(value: unknown): PendingPaymentPayload | null {
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

function getPendingPaymentPayloadHash(payload: PendingPaymentPayload) {
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
): DuitkuCreateTransactionResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return {
      success: false,
      message: "Response transaksi tidak valid.",
    };
  }

  const transaction: DuitkuCreateTransactionResponse = {
    success: value.success,
    code: optionalString(value.code),
    message: optionalString(value.message),
    detail: optionalString(value.detail),
    paymentUrl: optionalString(value.paymentUrl),
    redirectUrl: optionalString(value.redirectUrl),
  };

  if (isRecord(value.data)) {
    transaction.data = {
      reference: optionalString(value.data.reference),
      paymentUrl: optionalString(value.data.paymentUrl),
      vaNumber: optionalString(value.data.vaNumber),
      qrString: optionalString(value.data.qrString),
      status: optionalString(value.data.status),
      statusCode: optionalString(value.data.statusCode),
      statusMessage: optionalString(value.data.statusMessage),
      merchantOrderId: optionalString(value.data.merchantOrderId),
      invoiceId: optionalString(value.data.invoiceId),
      orderId: optionalString(value.data.orderId),
    };
  }

  return transaction;
}

function parsePaymentStatusResponse(value: unknown): PaymentStatusResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return {
      success: false,
      message: "Response status pembayaran tidak valid.",
    };
  }

  const status =
    value.status === "processing" ||
    value.status === "ready" ||
    value.status === "failed"
      ? value.status
      : undefined;

  const result: PaymentStatusResponse = {
    success: value.success,
    status,
    code: optionalString(value.code),
    message: optionalString(value.message),
  };

  if (isRecord(value.data)) {
    result.data = {
      invoiceId: optionalString(value.data.invoiceId),
      orderId: optionalString(value.data.orderId),
      merchantOrderId: optionalString(value.data.merchantOrderId),
      reference: optionalString(value.data.reference),
      paymentUrl: optionalString(value.data.paymentUrl),
      vaNumber: optionalString(value.data.vaNumber),
      qrString: optionalString(value.data.qrString),
      paymentStatus: optionalString(value.data.paymentStatus),
      invoiceStatus: optionalString(value.data.invoiceStatus),
    };
  }

  return result;
}

async function readTransactionResponse(response: Response) {
  try {
    const parsed: unknown = await response.json();
    return parseDuitkuCreateTransactionResponse(parsed);
  } catch {
    return {
      success: false,
      message: "Server tidak mengembalikan JSON yang valid.",
    } satisfies DuitkuCreateTransactionResponse;
  }
}

async function readPaymentStatusResponse(response: Response) {
  try {
    const parsed: unknown = await response.json();
    return parsePaymentStatusResponse(parsed);
  } catch {
    return {
      success: false,
      message: "Server tidak mengembalikan JSON status yang valid.",
    } satisfies PaymentStatusResponse;
  }
}

function readPendingPaymentPayload() {
  try {
    const raw = window.sessionStorage.getItem(pendingPaymentStorageKey);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return parsePendingPaymentPayload(parsed);
  } catch {
    return null;
  }
}

function readPreparedPayment() {
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

    const payload = parsePendingPaymentPayload(parsed.payload);

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
      response: isRecord(parsed.response)
        ? parseDuitkuCreateTransactionResponse(parsed.response)
        : undefined,
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
  } catch {
    // Session storage failure should not block checkout.
  }
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
      continue;
    }
  }

  return null;
}

function getPreparedPaymentUrl(preparedPayment: PreparedPayment) {
  if (preparedPayment.paymentUrl) {
    return preparedPayment.paymentUrl;
  }

  if (preparedPayment.response) {
    return getPaymentRedirectUrl(preparedPayment.response);
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

function getDuitkuErrorMessage(
  code?: string,
  serverMessage?: string,
  detail?: string
) {
  if (code === "MISSING_DUITKU_ENV") {
    return "Konfigurasi Duitku belum lengkap. Periksa Environment Variables di Vercel.";
  }

  if (code === "INVALID_PAYMENT_METHOD") {
    return (
      serverMessage || "Metode pembayaran ini belum aktif di Duitku Production."
    );
  }

  if (code === "DUITKU_REQUEST_FAILED") {
    const baseMessage =
      "Duitku menolak transaksi. Periksa konfigurasi channel pembayaran atau signature.";

    return detail ? `${baseMessage} Detail: ${detail}` : baseMessage;
  }

  return serverMessage || "Gagal menyiapkan transaksi Duitku. Silakan coba lagi.";
}

function updateStoredInvoice(
  pendingPayment: PendingPaymentPayload,
  paymentUrl: string,
  transaction?: DuitkuCreateTransactionResponse,
  status?: PaymentStatusResponse
) {
  const existingInvoice = getStoredInvoice(pendingPayment.invoiceId);

  if (!existingInvoice) {
    return;
  }

  const updatedInvoice: Invoice = {
    ...existingInvoice,
    provider: "duitku",
    providerReference:
      status?.data?.reference ??
      transaction?.data?.reference ??
      existingInvoice.providerReference,
    providerPaymentUrl: paymentUrl,
    vaNumber:
      status?.data?.vaNumber ??
      transaction?.data?.vaNumber ??
      existingInvoice.vaNumber,
    qrString:
      status?.data?.qrString ??
      transaction?.data?.qrString ??
      existingInvoice.qrString,
    merchantOrderId:
      status?.data?.merchantOrderId ??
      transaction?.data?.merchantOrderId ??
      existingInvoice.merchantOrderId,
  };

  saveInvoice(updatedInvoice);
}

export default function PaymentProcessingPage() {
  const [state, setState] = useState<ProcessingState>("loading");
  const [loadingStatus, setLoadingStatus] = useState(
    "Menyiapkan transaksi..."
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState<PendingPaymentPayload | null>(null);
  const [isRequestInFlight, setIsRequestInFlight] = useState(false);

  const hasStartedRequestRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const redirectToPayment = useCallback(
    (
      pendingPayment: PendingPaymentPayload,
      paymentUrl: string,
      transaction?: DuitkuCreateTransactionResponse,
      status?: PaymentStatusResponse
    ) => {
      updateStoredInvoice(pendingPayment, paymentUrl, transaction, status);

      writePreparedPayment({
        payloadHash: getPendingPaymentPayloadHash(pendingPayment),
        payload: pendingPayment,
        status: "ready",
        paymentUrl,
        response: transaction,
        createdAt: Date.now(),
      });

      window.location.assign(paymentUrl);
    },
    []
  );

  const waitForProviderPayment = useCallback(
    (pendingPayment: PendingPaymentPayload, payloadHash: string) => {
      const startedAt = Date.now();

      setState("loading");
      setLoadingStatus("Menunggu halaman pembayaran Duitku...");
      setErrorMessage("");

      const poll = async () => {
        try {
          const response = await fetch(
            `/api/duitku/payment-status?invoiceId=${encodeURIComponent(
              pendingPayment.invoiceId
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

          const status = await readPaymentStatusResponse(response);

          if (!response.ok || !status.success) {
            throw new Error(
              status.message || "Gagal membaca status pembayaran."
            );
          }

          if (status.status === "ready" && status.data?.paymentUrl) {
            const transaction: DuitkuCreateTransactionResponse = {
              success: true,
              data: {
                reference: status.data.reference,
                paymentUrl: status.data.paymentUrl,
                vaNumber: status.data.vaNumber,
                qrString: status.data.qrString,
                merchantOrderId: status.data.merchantOrderId,
                invoiceId: status.data.invoiceId,
                orderId: status.data.orderId,
              },
            };

            redirectToPayment(
              pendingPayment,
              status.data.paymentUrl,
              transaction,
              status
            );
            return;
          }

          if (status.status === "failed") {
            const nextErrorMessage =
              "Duitku gagal menyiapkan halaman pembayaran. Silakan coba lagi.";

            writePreparedPayment({
              payloadHash,
              payload: pendingPayment,
              status: "failed",
              error: nextErrorMessage,
              createdAt: Date.now(),
            });

            setErrorMessage(nextErrorMessage);
            setState("error");
            requestInFlightRef.current = false;
            setIsRequestInFlight(false);
            return;
          }

          setLoadingStatus("Pembayaran sedang diproses oleh Duitku...");
        } catch {
          setLoadingStatus("Mencoba membaca ulang status pembayaran...");
        }

        if (Date.now() - startedAt >= paymentStatusPollTimeoutMs) {
          const nextErrorMessage =
            "Halaman pembayaran belum tersedia. Silakan coba lagi.";

          writePreparedPayment({
            payloadHash,
            payload: pendingPayment,
            status: "failed",
            error: nextErrorMessage,
            createdAt: Date.now(),
          });

          setErrorMessage(nextErrorMessage);
          setState("error");
          requestInFlightRef.current = false;
          setIsRequestInFlight(false);
          return;
        }

        pollTimeoutRef.current = setTimeout(poll, paymentStatusPollIntervalMs);
      };

      pollTimeoutRef.current = setTimeout(poll, paymentStatusPollIntervalMs);
    },
    [redirectToPayment]
  );

  const submitPendingPayment = useCallback(
    async (
      pendingPayment: PendingPaymentPayload,
      payloadHash = getPendingPaymentPayloadHash(pendingPayment)
    ) => {
      if (requestInFlightRef.current) {
        return;
      }

      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }

      requestInFlightRef.current = true;
      setIsRequestInFlight(true);
      setState("loading");
      setLoadingStatus("Mendaftarkan transaksi...");
      setErrorMessage("");

      const pendingPreparedPayment: PreparedPayment = {
        payloadHash,
        payload: pendingPayment,
        status: "pending",
        createdAt: Date.now(),
      };

      writePreparedPayment(pendingPreparedPayment);

      try {
        const response = await fetch("/api/duitku/create-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingPayment),
        });

        const transaction = await readTransactionResponse(response);

        if (!response.ok || !transaction.success) {
          const nextErrorMessage = getDuitkuErrorMessage(
            transaction.code,
            transaction.message,
            transaction.detail
          );

          writePreparedPayment({
            ...pendingPreparedPayment,
            status: "failed",
            response: transaction,
            error: nextErrorMessage,
            createdAt: Date.now(),
          });

          setErrorMessage(nextErrorMessage);
          setState("error");
          requestInFlightRef.current = false;
          setIsRequestInFlight(false);
          return;
        }

        const paymentUrl = getPaymentRedirectUrl(transaction);

        if (paymentUrl) {
          writePreparedPayment({
            ...pendingPreparedPayment,
            status: "ready",
            paymentUrl,
            response: transaction,
            createdAt: Date.now(),
          });

          redirectToPayment(pendingPayment, paymentUrl, transaction);
          return;
        }

        if (isPaymentPreparingResponse(transaction)) {
          writePreparedPayment({
            ...pendingPreparedPayment,
            status: "pending",
            response: transaction,
            createdAt: Date.now(),
          });

          requestInFlightRef.current = false;
          setIsRequestInFlight(false);
          waitForProviderPayment(pendingPayment, payloadHash);
          return;
        }

        const nextErrorMessage =
          "Transaksi berhasil dibuat, tetapi halaman pembayaran Duitku belum tersedia.";

        writePreparedPayment({
          ...pendingPreparedPayment,
          status: "failed",
          response: transaction,
          error: nextErrorMessage,
          createdAt: Date.now(),
        });

        setErrorMessage(nextErrorMessage);
        setState("error");
        requestInFlightRef.current = false;
        setIsRequestInFlight(false);
      } catch {
        const nextErrorMessage =
          "Terjadi kendala jaringan saat menghubungkan ke Duitku.";

        writePreparedPayment({
          ...pendingPreparedPayment,
          status: "failed",
          error: nextErrorMessage,
          createdAt: Date.now(),
        });

        setErrorMessage(nextErrorMessage);
        setState("error");
        requestInFlightRef.current = false;
        setIsRequestInFlight(false);
      }
    },
    [redirectToPayment, waitForProviderPayment]
  );

  const startPaymentFlow = useCallback(
    (pendingPayment: PendingPaymentPayload) => {
      const payloadHash = getPendingPaymentPayloadHash(pendingPayment);
      const preparedPayment = readPreparedPayment();

      if (preparedPayment?.payloadHash === payloadHash) {
        const paymentUrl = getPreparedPaymentUrl(preparedPayment);

        if (preparedPayment.status === "ready" && paymentUrl) {
          redirectToPayment(
            pendingPayment,
            paymentUrl,
            preparedPayment.response
          );
          return;
        }

        if (preparedPayment.status === "pending") {
          waitForProviderPayment(pendingPayment, payloadHash);
          return;
        }

        if (preparedPayment.status === "failed") {
          setErrorMessage(
            preparedPayment.error ||
              "Terjadi kendala saat membuat halaman pembayaran. Silakan coba lagi."
          );
          setState("error");
          return;
        }
      }

      void submitPendingPayment(pendingPayment, payloadHash);
    },
    [redirectToPayment, submitPendingPayment, waitForProviderPayment]
  );

  useEffect(() => {
    if (hasStartedRequestRef.current) {
      return;
    }

    hasStartedRequestRef.current = true;

    queueMicrotask(() => {
      const pendingPayment = readPendingPaymentPayload();

      if (!pendingPayment) {
        setState("missing");
        return;
      }

      setPayload(pendingPayment);
      startPaymentFlow(pendingPayment);
    });

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [startPaymentFlow]);

  function handleRetry() {
    const pendingPayment = payload ?? readPendingPaymentPayload();

    if (!pendingPayment) {
      setState("missing");
      return;
    }

    setPayload(pendingPayment);
    void submitPendingPayment(
      pendingPayment,
      getPendingPaymentPayloadHash(pendingPayment)
    );
  }

  const checkoutHref = payload?.planId
    ? `/checkout?plan=${encodeURIComponent(payload.planId)}`
    : "/checkout";

  const isLoading = state === "loading";
  const Icon = isLoading ? Loader2 : AlertCircle;
  const iconClassName = isLoading
    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300"
    : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300";

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className={`h-7 w-7 ${isLoading ? "animate-spin" : ""}`} />
        </div>

        {state === "missing" ? (
          <>
            <h1 className="mt-5 text-2xl font-extrabold text-slate-950 dark:text-white">
              Data pembayaran tidak ditemukan.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Silakan kembali ke checkout untuk mengisi ulang data pembayaran.
            </p>
          </>
        ) : state === "error" ? (
          <>
            <h1 className="mt-5 text-2xl font-extrabold text-slate-950 dark:text-white">
              Gagal menyiapkan pembayaran
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Terjadi kendala saat membuat halaman pembayaran. Silakan coba lagi.
            </p>

            {errorMessage && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/25 dark:text-red-300">
                {errorMessage}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <CreditCard className="mr-1 inline h-4 w-4 align-[-3px]" />
              Pembayaran
            </p>

            <h1 className="mt-3 text-2xl font-extrabold text-slate-950 dark:text-white">
              Menyiapkan Pembayaran
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Mohon tunggu sebentar, Anda akan diarahkan ke halaman pembayaran
              Duitku.
            </p>

            <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {loadingStatus}
            </p>
          </>
        )}

        {(state === "error" || state === "missing") && (
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {state === "error" && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRequestInFlight}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw className="h-4 w-4" />
                Coba Lagi
              </button>
            )}

            <Link
              href={checkoutHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Checkout
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}