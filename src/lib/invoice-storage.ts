"use client";

import { Invoice, InvoiceStatus } from "@/lib/invoice";

const INVOICE_IDS_KEY = "dcb_invoice_ids";
const LATEST_KEY = "dcb_latest_invoice_id";

function getInvoiceKey(invoiceId: string) {
  return `dcb_invoice_${invoiceId}`;
}

function readInvoiceIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(INVOICE_IDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeInvoiceIds(invoiceIds: string[]) {
  window.localStorage.setItem(INVOICE_IDS_KEY, JSON.stringify(invoiceIds));
}

export function saveInvoice(invoice: Invoice) {
  const invoiceIds = readInvoiceIds();
  const nextInvoiceIds = [invoice.invoiceId, ...invoiceIds.filter((id) => id !== invoice.invoiceId)];

  window.localStorage.setItem(getInvoiceKey(invoice.invoiceId), JSON.stringify(invoice));
  writeInvoiceIds(nextInvoiceIds);
  window.sessionStorage.setItem(LATEST_KEY, invoice.invoiceId);
}

export function getStoredInvoice(invoiceId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getInvoiceKey(invoiceId));
    return raw ? (JSON.parse(raw) as Invoice) : null;
  } catch {
    return null;
  }
}

export function getLatestInvoiceId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(LATEST_KEY) ?? readInvoiceIds()[0] ?? null;
}

export function updateStoredInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const invoice = getStoredInvoice(invoiceId);

  if (!invoice) {
    return null;
  }

  const updated = {
    ...invoice,
    paymentStatus: status,
    paidAt: status === "paid" ? new Date().toISOString() : invoice.paidAt,
  };
  saveInvoice(updated);
  return updated;
}
