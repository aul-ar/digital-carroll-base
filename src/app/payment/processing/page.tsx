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

type ProcessingState = "loading" | "missing" | "error";

const pendingPaymentStorageKey = "digital-carroll-base:pending-payment";
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

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readPendingPaymentPayload() {
  try {
    const raw = window.sessionStorage.getItem(pendingPaymentStorageKey);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || !isPaymentMethod(parsed.paymentMethod)) {
      return null;
    }

    if (
      typeof parsed.planId !== "string" ||
      typeof parsed.customerName !== "string" ||
      typeof parsed.customerEmail !== "string" ||
      typeof parsed.customerWhatsapp !== "string" ||
      typeof parsed.packageName !== "string" ||
      typeof parsed.packageDescription !== "string" ||
      typeof parsed.amount !== "number" ||
      typeof parsed.invoiceId !== "string" ||
      typeof parsed.orderId !== "string"
    ) {
      return null;
    }

    return {
      planId: parsed.planId,
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      customerWhatsapp: parsed.customerWhatsapp,
      businessName: optionalString(parsed.businessName),
      packageName: parsed.packageName,
      packageDescription: parsed.packageDescription,
      amount: parsed.amount,
      paymentMethod: parsed.paymentMethod,
      ...(isEWalletProvider(parsed.ewalletProvider)
        ? { ewalletProvider: parsed.ewalletProvider }
        : {}),
      invoiceId: parsed.invoiceId,
      orderId: parsed.orderId,
      notes: optionalString(parsed.notes),
    } satisfies PendingPaymentPayload;
  } catch {
    return null;
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
  const [payload, setPayload] = useState<PendingPaymentPayload | null>(null);
  const hasStartedRef = useRef(false);
  const requestInFlightRef = useRef(false);

  const submitPendingPayment = useCallback(
    async (pendingPayment: PendingPaymentPayload) => {
      if (requestInFlightRef.current) {
        return;
      }

      requestInFlightRef.current = true;
      setState("loading");
      setErrorMessage("");

      try {
        const response = await fetch("/api/duitku/create-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingPayment),
        });
        const transaction = await readTransactionResponse(response);

        if (!response.ok || !transaction.success) {
          setErrorMessage(
            getDuitkuErrorMessage(
              transaction.code,
              transaction.message,
              transaction.detail
            )
          );
          setState("error");
          requestInFlightRef.current = false;
          return;
        }

        const paymentUrl = getPaymentRedirectUrl(transaction);

        if (!paymentUrl) {
          setErrorMessage(
            "Transaksi berhasil dibuat, tetapi halaman pembayaran Duitku belum tersedia."
          );
          setState("error");
          requestInFlightRef.current = false;
          return;
        }

        updateStoredPaymentInvoice(pendingPayment, transaction, paymentUrl);
        window.location.href = paymentUrl;
        window.sessionStorage.removeItem(pendingPaymentStorageKey);
      } catch {
        setErrorMessage("Terjadi kendala jaringan saat menghubungkan ke Duitku.");
        setState("error");
        requestInFlightRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const pendingPayment = readPendingPaymentPayload();

    if (!pendingPayment) {
      setState("missing");
      return;
    }

    setPayload(pendingPayment);
    void submitPendingPayment(pendingPayment);
  }, [submitPendingPayment]);

  function handleRetry() {
    const pendingPayment = payload ?? readPendingPaymentPayload();

    if (!pendingPayment) {
      setState("missing");
      return;
    }

    setPayload(pendingPayment);
    void submitPendingPayment(pendingPayment);
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
              Menghubungkan ke Duitku...
            </p>
          </>
        )}

        {(state === "error" || state === "missing") && (
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {state === "error" && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={requestInFlightRef.current}
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
