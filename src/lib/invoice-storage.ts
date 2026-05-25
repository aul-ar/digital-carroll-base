"use client";

import { Invoice, InvoiceStatus } from "@/lib/invoice";

const STORAGE_KEY = "dcb_invoices";
const LATEST_KEY = "dcb_latest_invoice_id";

function readAll(): Invoice[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Invoice[]) : [];
  } catch {
    return [];
  }
}

function writeAll(invoices: Invoice[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function saveInvoice(invoice: Invoice) {
  const invoices = readAll();
  const nextInvoices = [invoice, ...invoices.filter((item) => item.invoiceId !== invoice.invoiceId)];
  writeAll(nextInvoices);
  window.sessionStorage.setItem(LATEST_KEY, invoice.invoiceId);
}

export function getStoredInvoice(invoiceId: string) {
  return readAll().find((invoice) => invoice.invoiceId === invoiceId) ?? null;
}

export function getLatestInvoiceId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(LATEST_KEY) ?? readAll()[0]?.invoiceId ?? null;
}

export function updateStoredInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const invoices = readAll();
  const invoice = invoices.find((item) => item.invoiceId === invoiceId);

  if (!invoice) {
    return null;
  }

  const updated = { ...invoice, status };
  writeAll(invoices.map((item) => (item.invoiceId === invoiceId ? updated : item)));
  return updated;
}
