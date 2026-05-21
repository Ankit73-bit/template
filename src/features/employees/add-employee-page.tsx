"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EmployeeExcelImportDialog } from "@/features/employees/employee-excel-import-dialog";
import { EmployeeMasterFormFields } from "@/features/employees/employee-master-form-fields";
import {
  emptyPayrollEmployeeFormAddValues,
  payrollEmployeeFormAddSchema,
  type PayrollEmployeeFormAddValues,
} from "@/lib/payroll-employee-schema";
import { createPayrollEmployee } from "@/lib/payroll-employees-api";

export function AddEmployeePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const form = useForm<PayrollEmployeeFormAddValues>({
    resolver: zodResolver(payrollEmployeeFormAddSchema),
    defaultValues: {
      ...emptyPayrollEmployeeFormAddValues,
      dateOfJoining: new Date().toISOString().slice(0, 10),
      employmentStatus: "active",
    },
  });

  async function onSubmit(values: PayrollEmployeeFormAddValues) {
    setSubmitting(true);
    try {
      const result = await createPayrollEmployee(values);
      if (!result.ok) {
        form.setError("agencyIdNo", { type: "manual", message: result.error });
        return;
      }
      router.push("/employees");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="w-fit gap-2 px-0 sm:px-4" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-4 w-4" />
            Back to directory
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-fit gap-2"
          onClick={() => setImportOpen(true)}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Import from Excel
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add employee</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Add a single employee using the form below, or use{" "}
          <button
            type="button"
            className="font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => setImportOpen(true)}
          >
            Import from Excel
          </button>{" "}
          to load many rows from your master sheet (e.g. KRC Cinevista Kanjur). After saving, edit
          anyone from the directory with the Edit button.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <EmployeeMasterFormFields variant="add" control={form.control} form={form} />
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Create employee"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/employees">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>

      <EmployeeExcelImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => router.push("/employees")}
      />
    </div>
  );
}
