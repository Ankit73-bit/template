"use client";

import dynamic from "next/dynamic";

const PayslipPage = dynamic(() => import("./payslip-page"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
      Loading payslip…
    </div>
  ),
});

export default function Page() {
  return <PayslipPage />;
}
