export type InvoiceStatus = "pending" | "paid" | "failed" | "expired";

export type PaymentMethod =
  | "virtual_account"
  | "qris"
  | "ewallet"
  | "bank_transfer_manual"
  | "ewallet_manual";

export interface InvoiceData {
  invoiceId: string;
  orderId: string;
  createdAt: string;
  paidAt?: string;
  paymentStatus: InvoiceStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  businessName?: string;
  packageName: string;
  packageDescription: string;
  quantity: number;
  price: number;
  subtotal: number;
  total: number;
  notes?: string;
  provider?: "duitku";
  providerReference?: string;
  providerPaymentUrl?: string;
  vaNumber?: string;
  qrString?: string;
  merchantOrderId?: string;
}

export type Invoice = InvoiceData;

export const manualPaymentDetails = {
  bank: {
    label: "Transfer Bank BCA",
    bankName: "BCA",
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
  virtual_account: "Virtual Account via Duitku",
  qris: "QRIS All Payment via Duitku",
  ewallet: "E-Wallet via Duitku",
  bank_transfer_manual: "Transfer Bank BCA Manual",
  ewallet_manual: "E-Wallet Manual",
};

export function getPaymentMethodLabel(method: PaymentMethod) {
  return paymentMethodLabels[method];
}

export const statusLabels: Record<InvoiceStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Pembayaran Berhasil",
  failed: "Pembayaran Gagal",
  expired: "Pembayaran Kedaluwarsa",
};

function getDatePart(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

function getSequence() {
  return String(Math.floor(Math.random() * 900) + 100).padStart(3, "0");
}

export function generateOrderId(sequence = getSequence()) {
  return `DCB-${getDatePart()}-${sequence}`;
}

export function generateInvoiceId(sequence = getSequence()) {
  return `INV-DCB-${getDatePart()}-${sequence}`;
}

export function generateOrderInvoiceIds() {
  const sequence = getSequence();

  return {
    orderId: generateOrderId(sequence),
    invoiceId: generateInvoiceId(sequence),
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatInvoiceDate(value: string) {
  return formatDate(value);
}

export function parsePackagePrice(price: string) {
  const match = price.match(/Rp\s*([\d.]+)/i);

  if (!match) {
    return 0;
  }

  return Number(match[1].replace(/\./g, ""));
}

export function isManualPayment(method: PaymentMethod) {
  return method === "bank_transfer_manual" || method === "ewallet_manual";
}

export function createInvoiceData(input: {
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  businessName?: string;
  packageName: string;
  packageDescription: string;
  packagePrice: string | number;
  notes?: string;
}): Invoice {
  const { orderId, invoiceId } = generateOrderInvoiceIds();
  const price =
    typeof input.packagePrice === "number"
      ? input.packagePrice
      : parsePackagePrice(input.packagePrice);

  return {
    invoiceId,
    orderId,
    createdAt: new Date().toISOString(),
    paymentStatus: "pending" as const,
    paymentMethod: input.paymentMethod,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerWhatsapp: input.customerWhatsapp,
    businessName: input.businessName,
    packageName: input.packageName,
    packageDescription: input.packageDescription,
    quantity: 1,
    price,
    subtotal: price,
    total: price,
    notes: input.notes,
  };
}

export function buildWhatsAppInvoiceMessage(invoice: InvoiceData) {
  return [
    "Halo Digital Carroll Base, saya ingin konfirmasi pembayaran/pemesanan.",
    "",
    `Invoice: ${invoice.invoiceId}`,
    `Order ID: ${invoice.orderId}`,
    `Nama: ${invoice.customerName}`,
    `Bisnis/Brand: ${invoice.businessName || "-"}`,
    `Layanan: ${invoice.packageName}`,
    `Total: ${formatCurrency(invoice.total)}`,
    `Metode: ${getPaymentMethodLabel(invoice.paymentMethod)}`,
  ].join("\n");
}
