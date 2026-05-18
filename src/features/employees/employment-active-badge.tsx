import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmploymentStatusActive } from "@/lib/payroll-employee-schema";

export function EmploymentActiveBadge({
  status,
  archived,
  className,
}: {
  status: EmploymentStatusActive;
  archived: boolean;
  className?: string;
}) {
  if (archived) {
    return (
      <Badge variant="secondary" className={cn("font-medium", className)}>
        Archived
      </Badge>
    );
  }
  if (status === "active") {
    return (
      <Badge variant="success" className={cn("font-medium", className)}>
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={cn("font-medium", className)}>
      Inactive
    </Badge>
  );
}
