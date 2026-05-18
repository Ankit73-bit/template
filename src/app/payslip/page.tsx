"use client";

import dynamic from "next/dynamic";

const PayslipPage = dynamic(() => import("../payslip-page"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Loading payslip…
    </div>
  ),
});

export default function PayslipRoutePage() {
  return <PayslipPage />;
}
