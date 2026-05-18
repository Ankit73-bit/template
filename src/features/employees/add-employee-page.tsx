"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EmployeeFullFormFields } from "@/features/employees/employee-form-sections";
import {
  emptyPayrollEmployeeFormAddValues,
  payrollEmployeeFormAddSchema,
  type PayrollEmployeeFormAddValues,
} from "@/lib/payroll-employee-schema";
import { createPayrollEmployee } from "@/lib/payroll-employees-api";

export function AddEmployeePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<PayrollEmployeeFormAddValues>({
    resolver: zodResolver(payrollEmployeeFormAddSchema),
    defaultValues: {
      ...emptyPayrollEmployeeFormAddValues,
      joiningDate: new Date().toISOString().slice(0, 10),
      employmentStatus: "active",
    },
  });

  async function onSubmit(values: PayrollEmployeeFormAddValues) {
    setSubmitting(true);
    try {
      const result = await createPayrollEmployee(values);
      if (!result.ok) {
        form.setError("customEmployeeId", { type: "manual", message: result.error });
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
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add employee</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Complete each section below. A unique employee ID is assigned when you save unless you
          provide one. Annual salary in the directory is calculated from the monthly salary structure
          (twelve times the sum of Basic through Other allowance). Records are saved to MongoDB.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <EmployeeFullFormFields variant="add" control={form.control} form={form} />
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
    </div>
  );
}
