"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Table } from "@tanstack/react-table";
import Link from "next/link";
import { FileSpreadsheet, Plus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/empty-state";
import { EmployeeDeleteDialog } from "@/features/employees/employee-delete-dialog";
import { EmployeeExcelImportDialog } from "@/features/employees/employee-excel-import-dialog";
import { createPayrollEmployeeColumns } from "@/features/employees/payroll-employee-table-columns";
import type { PayrollEmployeeListItem } from "@/lib/payroll-employee-schema";
import {
  archivePayrollEmployee,
  listPayrollEmployees,
  restorePayrollEmployee,
} from "@/lib/payroll-employees-api";
import { uniqueSitesFromEmployees } from "@/lib/payroll-employees-logic";
import type { VisibilityState } from "@/components/data-table/data-table";

const DEFAULT_HIDDEN_COLUMNS: VisibilityState = {
  stateCity: false,
  siteName: false,
  employmentStatusYn: false,
  agencyName: false,
  krcSiteBiometricIdNo: false,
  lastWorkingDay: false,
  empFatherSpouseName: false,
  dateOfBirth: false,
  gender: false,
  bloodGroup: false,
  employmentApplicationStatus: false,
  educationCertificate: false,
  aadharNumber: false,
  panNumber: false,
  uanPfNo: false,
  esicNo: false,
  bankName: false,
  bankAccountNumber: false,
  bankIfscNumber: false,
  pccApplicationNo: false,
  pccApplicationDate: false,
  pccNo: false,
  pccIssueDate: false,
  policeVerificationValidity: false,
  permanentAddress: false,
  nextOfKinName: false,
  nextOfKinContactNumber: false,
  salary: false,
  recordStatus: false,
};

function BranchFilter({
  table,
  branches,
}: {
  table: Table<PayrollEmployeeListItem>;
  branches: string[];
}) {
  const column = table.getColumn("siteName");
  if (!column) return null;
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="whitespace-nowrap">SITE NAME</span>
      <select
        className="h-9 max-w-[160px] rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm"
        value={(column.getFilterValue() as string) ?? "all"}
        onChange={(e) =>
          column.setFilterValue(e.target.value === "all" ? undefined : e.target.value)
        }
      >
        <option value="all">All sites</option>
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusFilter({ table }: { table: Table<PayrollEmployeeListItem> }) {
  const column = table.getColumn("employmentStatus");
  if (!column) return null;
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="whitespace-nowrap">Status</span>
      <select
        className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm"
        value={(column.getFilterValue() as string) ?? "all"}
        onChange={(e) =>
          column.setFilterValue(e.target.value === "all" ? undefined : e.target.value)
        }
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </label>
  );
}

export function EmployeesManagement() {
  const [employees, setEmployees] = useState<PayrollEmployeeListItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PayrollEmployeeListItem | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await listPayrollEmployees();
      setEmployees(list);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load employees.");
      setEmployees([]);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh().finally(() => setHydrated(true));
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  const branches = useMemo(() => uniqueSitesFromEmployees(employees), [employees]);

  const tableData = useMemo(
    () =>
      employees
        .filter((e) => includeArchived || e.deletedAt === null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [employees, includeArchived],
  );

  const onArchive = useCallback((row: PayrollEmployeeListItem) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  }, []);

  const onRestore = useCallback(
    async (row: PayrollEmployeeListItem) => {
      const result = await restorePayrollEmployee(row.id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const columns = useMemo(
    () =>
      createPayrollEmployeeColumns({
        onArchive,
        onRestore,
      }),
    [onArchive, onRestore],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await archivePayrollEmployee(deleteTarget.id);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    setDeleteTarget(null);
    await refresh();
  }, [deleteTarget, refresh]);

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
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
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
          <Button className="gap-2" asChild>
            <Link href="/employees/add">
              <Plus className="h-4 w-4" />
              Add employee
            </Link>
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
          <CardTitle>Workforce directory</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
          <div className="styled-scrollbar min-h-0 flex-1 overflow-auto rounded-lg border border-sky-200/70 bg-card shadow-sm [-webkit-overflow-scrolling:touch] dark:border-sky-900/40 [&_table]:min-w-max [&_thead]:bg-sky-100 [&_th]:whitespace-nowrap [&_th]:border-sky-200/60 [&_th]:px-2 [&_th]:py-2.5 [&_td]:px-2 [&_td]:py-2 dark:[&_thead]:bg-sky-950 dark:[&_th]:border-sky-800/60">
            <DataTable
              columns={columns}
              data={tableData}
              initialColumnVisibility={DEFAULT_HIDDEN_COLUMNS}
              enableGlobalFilter
              globalFilterPlaceholder="Search NAME OF EMPLOYEE, AGENCY ID NO, PHONE NUMBER, SITE NAME…"
              pageSize={5}
              pageSizeOptions={[5, 10, 20]}
              toolbarExtras={(table) => (
                <>
                  <BranchFilter table={table} branches={branches} />
                  <StatusFilter table={table} />
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={includeArchived}
                      onChange={(e) => setIncludeArchived(e.target.checked)}
                    />
                    Include archived
                  </label>
                  <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
                    Refresh
                  </Button>
                </>
              )}
              emptyState={
                <EmptyState
                  icon={Users}
                  title={
                    loadError
                      ? "Could not load employees"
                      : employees.length === 0
                        ? "No employees yet"
                        : "No employees match filters"
                  }
                  description={
                    loadError
                      ? "Fix MongoDB connection (.env.local MONGODB_URI), then Refresh."
                      : employees.length === 0
                        ? "Import your KRC master sheet or add employees one at a time."
                        : "Clear search and filters, or include archived records."
                  }
                  action={
                    !loadError && employees.length === 0 ? (
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button
                          type="button"
                          variant="default"
                          className="gap-2"
                          onClick={() => setImportOpen(true)}
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          Import Excel
                        </Button>
                        <Button variant="outline" className="gap-2" asChild>
                          <Link href="/employees/add">
                            <Plus className="h-4 w-4" />
                            Add one employee
                          </Link>
                        </Button>
                      </div>
                    ) : undefined
                  }
                />
              }
            />
          </div>
        </CardContent>
      </Card>

      <EmployeeDeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        employee={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />

      <EmployeeExcelImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={refresh}
      />
    </div>
  );
}
