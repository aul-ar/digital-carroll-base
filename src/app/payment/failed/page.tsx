import { Suspense } from "react";
import { PaymentResult } from "@/components/PaymentResult";

export const metadata = {
  title: "Pembayaran Gagal | Digital Carroll Base",
};

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResult status="failed" />
    </Suspense>
  );
}
