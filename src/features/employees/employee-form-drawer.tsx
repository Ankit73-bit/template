"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

type EmployeeFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: PayrollEmployee | null;
  onEdit: (values: PayrollEmployeeFormValues) => void | Promise<void>;
};

export function EmployeeFormDrawer({
  open,
  onOpenChange,
  employee,
  onEdit,
}: EmployeeFormDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const editForm = useForm<PayrollEmployeeFormValues>({
    resolver: zodResolver(payrollEmployeeFormSchema),
    defaultValues: emptyPayrollEmployeeFormValues,
  });

  useEffect(() => {
    if (!open || !employee) return;
    setSaveError(null);
    editForm.reset(payrollEmployeeToFormValues(employee));
  }, [open, employee, editForm]);

  async function handleSubmitEdit(values: PayrollEmployeeFormValues) {
    setSaving(true);
    setSaveError(null);
    try {
      await onEdit(values);
      onOpenChange(false);
      editForm.reset(emptyPayrollEmployeeFormValues);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-[min(96dvh,96vh)] max-h-[min(96dvh,96vh)] flex-col overflow-hidden">
        <DrawerHeader className="shrink-0 text-left">
          <DrawerTitle>Edit employee</DrawerTitle>
          <DrawerDescription>
            Update master sheet fields. {labelForMasterField("agencyIdNo")} cannot be changed.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 [-webkit-overflow-scrolling:touch]">
          <Form {...editForm}>
            <form
              id="employee-drawer-form"
              onSubmit={editForm.handleSubmit(handleSubmitEdit)}
              className="space-y-6 pb-6"
            >
              <FormField
                control={editForm.control}
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
              <EmployeeMasterFormFields variant="edit" control={editForm.control} form={editForm} />
            </form>
          </Form>
        </div>
        {saveError ? (
          <p className="shrink-0 px-4 pb-2 text-sm text-destructive">{saveError}</p>
        ) : null}
        <DrawerFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background pt-4">
          <DrawerClose asChild>
            <Button type="button" variant="outline" disabled={saving}>
              Cancel
            </Button>
          </DrawerClose>
          <Button type="submit" form="employee-drawer-form" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
