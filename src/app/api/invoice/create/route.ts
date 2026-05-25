import { createInvoiceData, PaymentMethod } from "@/lib/invoice";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customer?: {
        fullName: string;
        email: string;
        whatsapp: string;
        businessName: string;
      };
      paymentMethod?: PaymentMethod;
      packageName?: string;
      packageDescription?: string;
      packagePrice?: string | number;
      notes?: string;
    };

    if (!body.customer || !body.paymentMethod || !body.packageName || !body.packageDescription) {
      return Response.json({ message: "Data invoice tidak lengkap." }, { status: 400 });
    }

    const invoice = createInvoiceData({
      paymentMethod: body.paymentMethod,
      customerName: body.customer.fullName,
      customerEmail: body.customer.email,
      customerWhatsapp: body.customer.whatsapp,
      businessName: body.customer.businessName,
      packageName: body.packageName,
      packageDescription: body.packageDescription,
      packagePrice: body.packagePrice ?? 0,
      notes: body.notes ?? "",
    });

    return Response.json({ invoice });
  } catch {
    return Response.json({ message: "Invoice gagal dibuat." }, { status: 500 });
  }
}
