import { Suspense } from "react";
import { PaymentResult } from "@/components/PaymentResult";

export const metadata = {
  title: "Pembayaran Pending | Digital Carroll Base",
};

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResult status="pending" />
    </Suspense>
  );
}
