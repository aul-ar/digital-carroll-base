"use client";

import { InvoiceData, InvoiceStatus } from "@/lib/invoice";

const STORAGE_KEY = "dcb_invoices";
const LATEST_KEY = "dcb_latest_invoice_id";

function readAll(): InvoiceData[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InvoiceData[]) : [];
  } catch {
    return [];
  }
}

function writeAll(invoices: InvoiceData[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function saveInvoice(invoice: InvoiceData) {
  const invoices = readAll();
  const nextInvoices = [invoice, ...invoices.filter((item) => item.invoiceId !== invoice.invoiceId)];
  writeAll(nextInvoices);
  window.sessionStorage.setItem(LATEST_KEY, invoice.invoiceId);
}

export function getStoredInvoice(invoiceId: string) {
  const localInvoice = readAll().find((invoice) => invoice.invoiceId === invoiceId);

  if (localInvoice) {
    return localInvoice;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const invoices = raw ? (JSON.parse(raw) as InvoiceData[]) : [];
    return invoices.find((invoice) => invoice.invoiceId === invoiceId) ?? null;
  } catch {
    return null;
  }
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

  const updated = { ...invoice, paymentStatus: status, paidAt: status === "paid" ? new Date().toISOString() : invoice.paidAt };
  writeAll(invoices.map((item) => (item.invoiceId === invoiceId ? updated : item)));
  return updated;
}
