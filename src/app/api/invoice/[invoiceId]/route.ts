export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  return Response.json(
    {
      message: "Invoice tidak tersedia di server storage MVP.",
      invoiceId,
      invoice: null,
    },
    { status: 404 }
  );
}
