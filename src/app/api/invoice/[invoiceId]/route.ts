import { getInvoiceByInvoiceId } from "@/lib/invoice-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceByInvoiceId(invoiceId);

  if (!invoice) {
    return Response.json(
      {
        message: "Invoice tidak ditemukan.",
        invoiceId,
        invoice: null,
      },
      { status: 404 }
    );
  }

  return Response.json({
    invoiceId,
    invoice,
  });
}
