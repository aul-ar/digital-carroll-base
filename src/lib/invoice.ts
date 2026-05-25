import { pricingPlans } from "@/data/pricing";

export type InvoiceStatus = "pending" | "paid" | "failed" | "expired";

export type PaymentMethod =
  | "virtual_account"
  | "qris"
  | "ewallet"
  | "bank_transfer_manual"
  | "ewallet_manual";

export interface CustomerData {
  fullName: string;
  email: string;
  whatsapp: string;
  businessName: string;
}

export interface InvoiceItem {
  serviceName: string;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Invoice {
  orderId: string;
  invoiceId: string;
  createdAt: string;
  status: InvoiceStatus;
  customer: CustomerData;
  item: InvoiceItem;
  paymentMethod: PaymentMethod;
  total: number;
  duitkuReference?: string;
  paymentUrl?: string;
}

export const manualPaymentDetails = {
  bank: {
    label: "Transfer Bank BCA",
    accountNumber: "6580812382",
    accountName: "Aulia Abdul Rahman",
  },
  ewallet: {
    label: "E-Wallet Manual",
    phoneNumber: "081288430688",
    accountName: "Aulia Abdul Rahman",
  },
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  virtual_account: "Virtual Account via Duitku Sandbox",
  qris: "QRIS via Duitku Sandbox",
  ewallet: "E-Wallet via Duitku Sandbox",
  bank_transfer_manual: "Transfer Bank BCA Manual",
  ewallet_manual: "E-Wallet Manual",
};

export const statusLabels: Record<InvoiceStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
};

export function isManualPayment(method: PaymentMethod) {
  return method === "bank_transfer_manual" || method === "ewallet_manual";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatInvoiceDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getPlanById(planId: string) {
  return pricingPlans.find((plan) => plan.id === planId) ?? pricingPlans[0];
}

export function getPlanAmount(price: string) {
  const match = price.match(/Rp\s*([\d.]+)/i);
  if (!match) {
    return 0;
  }

  return Number(match[1].replace(/\./g, ""));
}

export function getPlanCheckoutDescription(planId: string) {
  const plan = getPlanById(planId);
  return `${plan.description} Estimasi pengerjaan ${plan.deliveryTime}.`;
}

export function generateOrderPair(sequence?: number) {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = String(sequence ?? Math.floor(Math.random() * 900) + 100).padStart(3, "0");

  return {
    orderId: `DCB-${datePart}-${suffix}`,
    invoiceId: `INV-DCB-${datePart}-${suffix}`,
  };
}

export function createInvoicePayload(input: {
  customer: CustomerData;
  paymentMethod: PaymentMethod;
  planId: string;
  sequence?: number;
}): Invoice {
  const plan = getPlanById(input.planId);
  const amount = getPlanAmount(plan.price);
  const { orderId, invoiceId } = generateOrderPair(input.sequence);

  return {
    orderId,
    invoiceId,
    createdAt: new Date().toISOString(),
    status: "pending",
    customer: input.customer,
    paymentMethod: input.paymentMethod,
    total: amount,
    item: {
      serviceName: plan.name,
      description: getPlanCheckoutDescription(plan.id),
      quantity: 1,
      price: amount,
      subtotal: amount,
    },
  };
}

export function buildWhatsAppInvoiceMessage(invoice: Invoice) {
  return [
    "Halo Digital Carroll Base, saya ingin konfirmasi pembayaran/pemesanan.",
    "",
    `Invoice: ${invoice.invoiceId}`,
    `Order ID: ${invoice.orderId}`,
    `Nama: ${invoice.customer.fullName}`,
    `Bisnis/Brand: ${invoice.customer.businessName}`,
    `Layanan: ${invoice.item.serviceName}`,
    `Total: ${formatCurrency(invoice.total)}`,
    `Metode: ${paymentMethodLabels[invoice.paymentMethod]}`,
  ].join("\n");
}
