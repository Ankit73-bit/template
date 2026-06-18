"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, FileSpreadsheet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/empty-state";
import { AttendanceExcelImportDialog } from "@/features/attendance/attendance-excel-import-dialog";
import { createAttendanceColumns } from "@/features/attendance/attendance-table-columns";
import type { AttendanceRecord } from "@/lib/attendance-schema";
import { listAttendance } from "@/lib/attendance-api";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    years.push(y);
  }
  return years;
}

export function AttendanceManagement() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const yearOptions = useMemo(() => getYearOptions(), []);

  const refresh = useCallback(async () => {
    try {
      const list = await listAttendance(month, year);
      setRecords(list);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load attendance.");
      setRecords([]);
    }
  }, [month, year]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh().finally(() => setHydrated(true));
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  const columns = useMemo(() => createAttendanceColumns(), []);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-8">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage monthly attendance records.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setImportOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Excel
          </Button>
        </div>
      </div>

      {loadError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="shrink-0">
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap font-medium">Month</span>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap font-medium">Year</span>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
              Refresh
            </Button>
          </div>

          <div className="styled-scrollbar min-h-0 flex-1 overflow-auto rounded-lg border border-sky-200/70 bg-card shadow-sm [-webkit-overflow-scrolling:touch] dark:border-sky-900/40 [&_table]:min-w-max [&_thead]:bg-sky-100 [&_th]:whitespace-nowrap [&_th]:border-sky-200/60 [&_th]:px-2 [&_th]:py-2.5 [&_td]:px-2 [&_td]:py-2 dark:[&_thead]:bg-sky-950 dark:[&_th]:border-sky-800/60">
            <DataTable
              columns={columns}
              data={records}
              enableGlobalFilter
              globalFilterPlaceholder="Search by NAME, AGENCY NO…"
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              emptyState={
                <EmptyState
                  icon={CalendarClock}
                  title={
                    loadError
                      ? "Could not load attendance"
                      : records.length === 0
                        ? "No attendance records"
                        : "No records match filters"
                  }
                  description={
                    loadError
                      ? "Fix MongoDB connection (.env MONGODB_URI), then Refresh."
                      : "Upload an attendance Excel sheet to populate this table."
                  }
                  action={
                    !loadError && records.length === 0 ? (
                      <Button
                        type="button"
                        variant="default"
                        className="gap-2"
                        onClick={() => setImportOpen(true)}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Import Excel
                      </Button>
                    ) : undefined
                  }
                />
              }
            />
          </div>
        </CardContent>
      </Card>

      <AttendanceExcelImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={refresh}
      />
    </div>
  );
}
