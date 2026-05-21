import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmploymentStatusActive } from "@/lib/payroll-employee-schema";

export function EmploymentActiveBadge({
  status,
  archived,
  ynLabel,
  className,
}: {
  status: EmploymentStatusActive;
  archived: boolean;
  ynLabel?: string;
  className?: string;
}) {
  if (archived) {
    return (
      <Badge variant="secondary" className={cn("font-medium", className)}>
        Archived
      </Badge>
    );
  }
  const yn = ynLabel?.trim().toUpperCase();
  if (yn === "Y" || yn === "N") {
    return (
      <Badge
        variant={yn === "Y" ? "success" : "secondary"}
        className={cn("font-mono text-xs font-semibold", className)}
      >
        {yn}
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
