"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, CreditCard, Loader2, RefreshCcw } from "lucide-react";
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
    reference?: string;
    paymentUrl?: string | null;
    vaNumber?: string;
    qrString?: string;
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
const preparedPaymentPollIntervalMs = 400;
const preparedPaymentPollTimeoutMs = 8000;
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

    transaction.data = data;
  }

  return transaction;
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

function getPreparedPaymentUrl(preparedPayment: PreparedPayment) {
  return (
    preparedPayment.paymentUrl ??
    (preparedPayment.response
      ? getPaymentRedirectUrl(preparedPayment.response)
      : null)
  );
}

function updateStoredPaymentInvoice(
  payload: PendingPaymentPayload,
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

export default function PaymentProcessingPage() {
  const [state, setState] = useState<ProcessingState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("Menghubungkan ke Duitku...");
  const [payload, setPayload] = useState<PendingPaymentPayload | null>(null);
  const [isRequestInFlight, setIsRequestInFlight] = useState(false);
  const hasStartedRequestRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const redirectToPayment = useCallback(
    (
      pendingPayment: PendingPaymentPayload,
      paymentUrl: string,
      transaction?: DuitkuCreateTransactionResponse
    ) => {
      const transactionForInvoice =
        transaction ??
        ({
          success: true,
          data: { paymentUrl },
        } satisfies DuitkuCreateTransactionResponse);

      updateStoredPaymentInvoice(
        pendingPayment,
        transactionForInvoice,
        paymentUrl
      );
      window.location.assign(paymentUrl);
      window.sessionStorage.removeItem(pendingPaymentStorageKey);
    },
    []
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
      setLoadingStatus("Menghubungkan ke Duitku...");
      setErrorMessage("");

      const pendingPreparedPayment: PreparedPayment = {
        payloadHash,
        payload: pendingPayment,
        status: "pending",
        createdAt: Date.now(),
      };

      writePreparedPayment(pendingPreparedPayment);
      console.info("[PAYMENT PROCESSING] fallback_request_started", {
        payloadHash,
        orderId: pendingPayment.orderId,
        invoiceId: pendingPayment.invoiceId,
      });
      console.info("[PAYMENT PREP] started", {
        payloadHash,
        orderId: pendingPayment.orderId,
        invoiceId: pendingPayment.invoiceId,
        source: "processing",
      });

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

          console.info("[PAYMENT PREP] failed", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
            code: transaction.code,
            source: "processing",
          });

          setErrorMessage(nextErrorMessage);
          setState("error");
          requestInFlightRef.current = false;
          setIsRequestInFlight(false);
          return;
        }

        const paymentUrl = getPaymentRedirectUrl(transaction);

        if (!paymentUrl) {
          const nextErrorMessage =
            "Transaksi berhasil dibuat, tetapi halaman pembayaran Duitku belum tersedia.";

          writePreparedPayment({
            ...pendingPreparedPayment,
            status: "failed",
            response: transaction,
            error: nextErrorMessage,
            createdAt: Date.now(),
          });

          console.info("[PAYMENT PREP] failed", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
            reason: "missing_payment_url",
            source: "processing",
          });

          setErrorMessage(
            nextErrorMessage
          );
          setState("error");
          requestInFlightRef.current = false;
          setIsRequestInFlight(false);
          return;
        }

        writePreparedPayment({
          ...pendingPreparedPayment,
          status: "ready",
          paymentUrl,
          response: transaction,
          createdAt: Date.now(),
        });

        console.info("[PAYMENT PREP] ready", {
          payloadHash,
          orderId: pendingPayment.orderId,
          invoiceId: pendingPayment.invoiceId,
          source: "processing",
        });

        redirectToPayment(pendingPayment, paymentUrl, transaction);
      } catch {
        const nextErrorMessage =
          "Terjadi kendala jaringan saat menghubungkan ke Duitku.";

        writePreparedPayment({
          ...pendingPreparedPayment,
          status: "failed",
          error: nextErrorMessage,
          createdAt: Date.now(),
        });

        console.info("[PAYMENT PREP] failed", {
          payloadHash,
          orderId: pendingPayment.orderId,
          invoiceId: pendingPayment.invoiceId,
          reason: "network_error",
          source: "processing",
        });

        setErrorMessage(nextErrorMessage);
        setState("error");
        requestInFlightRef.current = false;
        setIsRequestInFlight(false);
      }
    },
    [redirectToPayment]
  );

  const waitForPreparedPayment = useCallback(
    (pendingPayment: PendingPaymentPayload, payloadHash: string) => {
      if (requestInFlightRef.current) {
        return;
      }

      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }

      const startedWaitingAt = Date.now();

      setState("loading");
      setLoadingStatus("Pembayaran sedang disiapkan...");
      setErrorMessage("");

      const pollPreparedPayment = () => {
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

          if (preparedPayment.status === "failed") {
            setErrorMessage(
              preparedPayment.error ??
                "Terjadi kendala saat membuat halaman pembayaran. Silakan coba lagi."
            );
            setState("error");
            pollTimeoutRef.current = null;
            return;
          }
        }

        if (Date.now() - startedWaitingAt >= preparedPaymentPollTimeoutMs) {
          pollTimeoutRef.current = null;
          void submitPendingPayment(pendingPayment, payloadHash);
          return;
        }

        pollTimeoutRef.current = setTimeout(
          pollPreparedPayment,
          preparedPaymentPollIntervalMs
        );
      };

      pollTimeoutRef.current = setTimeout(
        pollPreparedPayment,
        preparedPaymentPollIntervalMs
      );
    },
    [redirectToPayment, submitPendingPayment]
  );

  const startPaymentFlow = useCallback(
    (pendingPayment: PendingPaymentPayload) => {
      const payloadHash = getPendingPaymentPayloadHash(pendingPayment);
      const preparedPayment = readPreparedPayment();

      if (preparedPayment?.payloadHash === payloadHash) {
        const paymentUrl = getPreparedPaymentUrl(preparedPayment);

        if (preparedPayment.status === "ready" && paymentUrl) {
          console.info("[PAYMENT PREP] skipped_existing_ready", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
            source: "processing",
          });
          redirectToPayment(
            pendingPayment,
            paymentUrl,
            preparedPayment.response
          );
          return;
        }

        if (preparedPayment.status === "pending") {
          console.info("[PAYMENT PROCESSING] waiting_existing_pending", {
            payloadHash,
            orderId: pendingPayment.orderId,
            invoiceId: pendingPayment.invoiceId,
          });
          waitForPreparedPayment(pendingPayment, payloadHash);
          return;
        }

        if (preparedPayment.status === "failed") {
          setErrorMessage(
            preparedPayment.error ??
              "Terjadi kendala saat membuat halaman pembayaran. Silakan coba lagi."
          );
          setState("error");
          return;
        }
      }

      void submitPendingPayment(pendingPayment, payloadHash);
    },
    [redirectToPayment, submitPendingPayment, waitForPreparedPayment]
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
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${iconClassName}`}>
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
              Mohon tunggu sebentar, Anda akan diarahkan ke halaman pembayaran Duitku.
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
