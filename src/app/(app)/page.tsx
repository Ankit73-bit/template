import { Suspense } from "react";
import { DashboardHome } from "@/components/pages/dashboard-home";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/loading-skeletons";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <CardGridSkeleton />
        </div>
      }
    >
      <DashboardHome />
    </Suspense>
  );
}
