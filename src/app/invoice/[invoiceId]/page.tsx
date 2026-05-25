import { InvoiceViewer } from "@/components/InvoiceViewer";

export const metadata = {
  title: "Invoice | Digital Carroll Base",
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  return <InvoiceViewer invoiceId={invoiceId} />;
}
