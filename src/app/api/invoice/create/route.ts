import { createInvoicePayload, CustomerData, PaymentMethod } from "@/lib/invoice";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customer?: CustomerData;
      paymentMethod?: PaymentMethod;
      planId?: string;
    };

    if (!body.customer || !body.paymentMethod || !body.planId) {
      return Response.json({ message: "Data invoice tidak lengkap." }, { status: 400 });
    }

    const invoice = createInvoicePayload({
      customer: body.customer,
      paymentMethod: body.paymentMethod,
      planId: body.planId,
    });

    return Response.json({ invoice });
  } catch {
    return Response.json({ message: "Invoice gagal dibuat." }, { status: 500 });
  }
}
