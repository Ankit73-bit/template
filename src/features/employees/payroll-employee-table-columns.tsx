"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrencyINR } from "@/lib/demo-data";
import type { PayrollEmployee } from "@/lib/payroll-employee-schema";
import { EmploymentActiveBadge } from "@/features/employees/employment-active-badge";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

function formatJoiningDate(isoDate: string): string {
  const t = Date.parse(isoDate);
  if (Number.isNaN(t)) return isoDate;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(t));
}

export function createPayrollEmployeeColumns(handlers: {
  onEdit: (row: PayrollEmployee) => void;
  onArchive: (row: PayrollEmployee) => void;
  onRestore: (row: PayrollEmployee) => void;
}): ColumnDef<PayrollEmployee>[] {
  return [
    {
      id: "employee",
      accessorFn: (row) => row.fullName,
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
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              {e.photoDataUrl ? (
                <AvatarImage src={e.photoDataUrl} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-muted text-xs font-semibold">
                {initialsFromName(e.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium leading-tight">{e.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{e.email}</p>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs sm:text-sm">{row.getValue("employeeId")}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue("phone")}
        </span>
      ),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <span className="max-w-[140px] truncate text-sm">{row.getValue("designation")}</span>
      ),
    },
    {
      accessorKey: "salary",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Salary
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrencyINR(row.getValue("salary")),
    },
    {
      accessorKey: "joiningDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joining
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatJoiningDate(row.getValue("joiningDate"))}
        </span>
      ),
    },
    {
      accessorKey: "employmentStatus",
      header: "Status",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <EmploymentActiveBadge
            status={e.employmentStatus}
            archived={Boolean(e.deletedAt)}
          />
        );
      },
      filterFn: (row, id, value) => {
        if (!value || value === "all") return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "branchOrSite",
      header: "Branch / site",
      cell: ({ row }) => (
        <span className="max-w-[120px] truncate text-sm">{row.getValue("branchOrSite")}</span>
      ),
      filterFn: (row, id, value) => {
        if (!value || value === "all") return true;
        return row.getValue(id) === value;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
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
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>More</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlers.onEdit(e)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit employee
              </DropdownMenuItem>
              {!archived && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handlers.onArchive(e)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {archived && (
                <DropdownMenuItem onClick={() => handlers.onRestore(e)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
