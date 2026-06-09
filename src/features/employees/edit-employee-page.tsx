"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EmployeeMasterFormFields } from "@/features/employees/employee-master-form-fields";
import { labelForMasterField } from "@/lib/payroll-employee-master-fields";
import {
  emptyPayrollEmployeeFormValues,
  payrollEmployeeFormSchema,
  payrollEmployeeToFormValues,
  type PayrollEmployee,
  type PayrollEmployeeFormValues,
} from "@/lib/payroll-employee-schema";
import {
  getPayrollEmployee,
  updatePayrollEmployee,
} from "@/lib/payroll-employees-api";

export function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<PayrollEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<PayrollEmployeeFormValues>({
    resolver: zodResolver(payrollEmployeeFormSchema),
    defaultValues: emptyPayrollEmployeeFormValues,
  });

  const loadEmployee = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const emp = await getPayrollEmployee(params.id);
      if (!emp) {
        setLoadError("Employee not found.");
        return;
      }
      setEmployee(emp);
      form.reset(payrollEmployeeToFormValues(emp));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load employee.");
    } finally {
      setLoading(false);
    }
  }, [params.id, form]);

  useEffect(() => {
    void loadEmployee();
  }, [loadEmployee]);

  async function onSubmit(values: PayrollEmployeeFormValues) {
    setSubmitting(true);
    setSaveError(null);
    try {
      const result = await updatePayrollEmployee(params.id, values);
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      router.push("/employees");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !employee) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        <Button variant="ghost" className="w-fit gap-2 px-0 sm:px-4" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-4 w-4" />
            Back to directory
          </Link>
        </Button>
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-6 py-8 text-center">
          <p className="text-sm text-destructive">{loadError ?? "Employee not found."}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadEmployee()}>
            Retry
          </Button>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-semibold tracking-tight">Edit employee</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Update details for{" "}
          <strong className="font-medium text-foreground">
            {employee.nameOfEmployee}
          </strong>
          . {labelForMasterField("agencyIdNo")} cannot be changed.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="agencyIdNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labelForMasterField("agencyIdNo")}</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-muted/50 font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <EmployeeMasterFormFields variant="edit" control={form.control} form={form} />

          {saveError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {saveError}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
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
