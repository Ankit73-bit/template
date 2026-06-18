"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AttendanceRecord } from "@/lib/attendance-schema";

export function createAttendanceColumns(): ColumnDef<AttendanceRecord>[] {
  return [
    {
      accessorKey: "agencyNo",
      header: () => <span className="text-white">AGENCY NO</span>,
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "name",
      header: () => <span className="text-white">NAME</span>,
      cell: ({ getValue }) => String(getValue() ?? "—"),
    },
    {
      accessorKey: "daysWorked",
      header: () => <span className="text-white">DAYS WORKED</span>,
      cell: ({ getValue }) => String(getValue() ?? "0"),
    },
    {
      accessorKey: "weeklyOff",
      header: () => <span className="text-white">WEEKLY OFF</span>,
      cell: ({ getValue }) => String(getValue() ?? "0"),
    },
    {
      accessorKey: "total",
      header: () => <span className="text-white">TOTAL</span>,
      cell: ({ getValue }) => (
        <span className="font-semibold">{String(getValue() ?? "0")}</span>
      ),
    },
  ];
}
