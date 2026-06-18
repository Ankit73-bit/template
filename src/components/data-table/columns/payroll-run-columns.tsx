"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PayrollRunRow } from "@/lib/payroll-run-types";
import { formatCurrencyINR } from "@/lib/format-currency";
import { PayrollStatusBadge } from "@/components/data-table/status-badges";

export const payrollRunColumns: ColumnDef<PayrollRunRow>[] = [
  {
    accessorKey: "period",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 px-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Period
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "employees",
    header: "Employees",
  },
  {
    accessorKey: "netPay",
    header: "Net pay",
    cell: ({ row }) => {
      const v = row.getValue("netPay") as number;
      return v === 0 ? "—" : formatCurrencyINR(v);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <PayrollStatusBadge status={row.getValue("status")} />
    ),
  },
];
