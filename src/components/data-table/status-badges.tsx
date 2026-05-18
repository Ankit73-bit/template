import type { EmploymentStatus, PayrollStatus } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const employmentLabels: Record<EmploymentStatus, string> = {
  active: "Active",
  on_leave: "On leave",
  terminated: "Terminated",
};

const employmentVariant: Record<
  EmploymentStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  active: "success",
  on_leave: "warning",
  terminated: "destructive",
};

export function EmploymentStatusBadge({
  status,
  className,
}: {
  status: EmploymentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant={employmentVariant[status]}
      className={cn("font-medium capitalize", className)}
    >
      {employmentLabels[status]}
    </Badge>
  );
}

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
