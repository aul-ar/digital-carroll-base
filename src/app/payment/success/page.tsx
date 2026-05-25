import { Suspense } from "react";
import { PaymentResult } from "@/components/PaymentResult";

export const metadata = {
  title: "Pembayaran Berhasil | Digital Carroll Base",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResult status="paid" />
    </Suspense>
  );
}
