import type { PayrollStatus } from "@/lib/payroll-run-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const payrollLabels: Record<PayrollStatus, string> = {
  draft: "Draft",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
};

const payrollVariant: Record<
  PayrollStatus,
  "secondary" | "default" | "success" | "destructive"
> = {
  draft: "secondary",
  processing: "default",
  paid: "success",
  failed: "destructive",
};

export function PayrollStatusBadge({
  status,
  className,
}: {
  status: PayrollStatus;
  className?: string;
}) {
  return (
    <Badge
      variant={payrollVariant[status]}
      className={cn("font-medium", className)}
    >
      {payrollLabels[status]}
    </Badge>
  );
}
