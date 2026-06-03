import "server-only";

import nodemailer from "nodemailer";

export interface AdminNotificationInput {
  orderId: string;
  invoiceId: string;
  paymentId?: string | null;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  orderStatus: string;
  paymentStatus: string;
  invoiceStatus: string;
  createdAt: Date | string;
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getSmtpPort() {
  const port = Number(process.env.SMTP_PORT ?? 587);

  return Number.isFinite(port) ? port : 587;
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = getSmtpPort();

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildNotificationRows(input: AdminNotificationInput) {
  return [
    ["Order ID", input.orderId],
    ["Invoice ID", input.invoiceId],
    ["Payment ID", input.paymentId || "-"],
    ["Customer Email", input.customerEmail],
    ["Customer Phone", input.customerPhone],
    ["Amount", formatCurrency(input.amount)],
    ["Order Status", input.orderStatus],
    ["Payment Status", input.paymentStatus],
    ["Invoice Status", input.invoiceStatus],
    ["Created At", formatDate(input.createdAt)],
  ] as const;
}

function buildTextBody(title: string, input: AdminNotificationInput) {
  const rows = buildNotificationRows(input)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return [`Digital Carroll Base`, title, "", rows].join("\n");
}

function buildHtmlBody(title: string, input: AdminNotificationInput) {
  const rows = buildNotificationRows(input)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(String(value))}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;">
      <h2 style="margin:0 0 4px;">Digital Carroll Base</h2>
      <p style="margin:0 0 16px;color:#475569;">${escapeHtml(title)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px;font-size:14px;">
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

async function sendAdminNotification(subject: string, title: string, input: AdminNotificationInput) {
  try {
    const transporter = getTransporter();
    const to = process.env.ADMIN_NOTIFICATION_EMAIL;
    const from = process.env.SMTP_FROM;

    if (!transporter || !to || !from) {
      console.error("Admin email notification skipped: SMTP env is incomplete.");
      return;
    }

    await transporter.sendMail({
      from,
      to,
      subject,
      text: buildTextBody(title, input),
      html: buildHtmlBody(title, input),
    });
  } catch (reason) {
    console.error("Admin email notification failed", {
      subject,
      message: reason instanceof Error ? reason.message : "Unknown error",
    });
  }
}

export function sendAdminOrderCreatedEmail(input: AdminNotificationInput) {
  return sendAdminNotification(
    `[Digital Carroll Base] New Order Created - ${input.orderId}`,
    "New order created",
    input
  );
}

export function sendAdminPaymentPaidEmail(input: AdminNotificationInput) {
  return sendAdminNotification(
    `[Digital Carroll Base] Payment PAID - ${input.orderId}`,
    "Payment marked as PAID",
    input
  );
}

export function sendAdminInvoiceExpiredEmail(input: AdminNotificationInput) {
  return sendAdminNotification(
    `[Digital Carroll Base] Invoice EXPIRED - ${input.invoiceId}`,
    "Invoice expired",
    input
  );
}
