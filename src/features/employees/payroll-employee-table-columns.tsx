"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrencyINR } from "@/lib/demo-data";
import {
  MASTER_DATA_EMPLOYEE_FIELDS,
  labelForMasterField,
} from "@/lib/payroll-employee-master-fields";
import type { MasterEmployeeFieldKey } from "@/lib/payroll-employee-master-fields";
import type { PayrollEmployee } from "@/lib/payroll-employee-schema";
import { EmploymentActiveBadge } from "@/features/employees/employment-active-badge";

function formatJoiningDate(isoDate: string): string {
  if (!isoDate?.trim()) return "—";
  const t = Date.parse(isoDate);
  if (Number.isNaN(t)) return isoDate;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(t));
}

function cellValue(employee: PayrollEmployee, key: MasterEmployeeFieldKey): string {
  const raw = employee[key];
  if (raw == null || raw === "") return "—";
  if (key === "dateOfJoining" || key === "dateOfBirth" || key === "pccApplicationDate" || key === "pccIssueDate") {
    return formatJoiningDate(String(raw));
  }
  if (key === "gender") {
    const g = String(raw);
    if (g === "male") return "MALE";
    if (g === "female") return "FEMALE";
    return g.toUpperCase();
  }
  return String(raw);
}

export function createPayrollEmployeeColumns(handlers: {
  onEdit: (row: PayrollEmployee) => void;
  onArchive: (row: PayrollEmployee) => void;
  onRestore: (row: PayrollEmployee) => void;
}): ColumnDef<PayrollEmployee>[] {
  const dataColumns: ColumnDef<PayrollEmployee>[] = MASTER_DATA_EMPLOYEE_FIELDS.map(
    (def, index) => ({
      accessorKey: def.key,
      header: () => (
        <span
          className="block min-w-[max(100%,var(--col-min))] whitespace-normal text-[10px] font-semibold uppercase leading-tight tracking-wide text-sky-900 dark:text-sky-100"
          style={{ ["--col-min" as string]: `${def.tableMinWidth ?? 100}px` }}
        >
          {def.label}
        </span>
      ),
      cell: ({ row }) => {
        const val = cellValue(row.original, def.key);
        const isName = def.key === "nameOfEmployee";
        return (
          <span
            className={
              isName
                ? "block min-w-[140px] font-medium text-foreground"
                : "block max-w-[220px] truncate text-xs text-foreground/90"
            }
            title={val}
          >
            {val}
          </span>
        );
      },
      enableHiding: def.key !== "nameOfEmployee",
      meta: {
        sticky: index === 0 ? "left" : undefined,
        minWidth: def.tableMinWidth ?? 100,
      },
    }),
  );

  return [
    ...dataColumns,
    {
      accessorKey: "salary",
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-900 dark:text-sky-100">
          ANNUAL SALARY (APP)
        </span>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs font-medium tabular-nums">
          {formatCurrencyINR(row.getValue("salary"))}
        </span>
      ),
      meta: { minWidth: 110 },
    },
    {
      id: "recordStatus",
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-900 dark:text-sky-100">
          RECORD STATUS
        </span>
      ),
      cell: ({ row }) => {
        const e = row.original;
        return (
          <EmploymentActiveBadge
            status={e.employmentStatus}
            archived={Boolean(e.deletedAt)}
            ynLabel={e.employmentStatusYn}
          />
        );
      },
      filterFn: (row, _id, value) => {
        if (!value || value === "all") return true;
        return row.original.employmentStatus === value;
      },
      meta: { minWidth: 100 },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-900">
          ACTIONS
        </span>
      ),
      cell: ({ row }) => {
        const e = row.original;
        const archived = Boolean(e.deletedAt);
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2.5"
              onClick={() => handlers.onEdit(e)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>More</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlers.onArchive(e)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                {archived ? (
                  <DropdownMenuItem onClick={() => handlers.onRestore(e)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      meta: { minWidth: 120, sticky: "right" },
    },
  ];
}

export { labelForMasterField };
