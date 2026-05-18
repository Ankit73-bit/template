"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmployeeRow } from "@/lib/demo-data";
import { formatCurrencyINR } from "@/lib/demo-data";
import { EmploymentStatusBadge } from "@/components/data-table/status-badges";

export const employeeColumns: ColumnDef<EmployeeRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 px-2 text-left font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Employee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("role")}</span>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "salary",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 px-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Annual salary
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrencyINR(row.getValue("salary")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <EmploymentStatusBadge status={row.getValue("status")} />
    ),
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true;
      return row.getValue(id) === value;
    },
  },
];
