"use client";

import { useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeFullFormFields } from "@/features/employees/employee-form-sections";
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
  const editForm = useForm<PayrollEmployeeFormValues>({
    resolver: zodResolver(payrollEmployeeFormSchema),
    defaultValues: emptyPayrollEmployeeFormValues,
  });

  useEffect(() => {
    if (!open || !employee) return;
    editForm.reset(payrollEmployeeToFormValues(employee));
  }, [open, employee, editForm]);

  async function handleSubmitEdit(values: PayrollEmployeeFormValues) {
    await onEdit(values);
    onOpenChange(false);
    editForm.reset(emptyPayrollEmployeeFormValues);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit employee</DrawerTitle>
          <DrawerDescription>
            Update employee details. The employee ID cannot be changed.
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="max-h-[calc(96vh-12rem)] px-4">
          <Form {...editForm}>
            <form
              id="employee-drawer-form"
              onSubmit={editForm.handleSubmit(handleSubmitEdit)}
              className="space-y-6 pb-6"
            >
              <FormField
                control={editForm.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <EmployeeFullFormFields variant="edit" control={editForm.control} form={editForm} />
            </form>
          </Form>
        </ScrollArea>
        <DrawerFooter className="flex-row justify-end gap-2 border-t border-border pt-4">
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
          <Button type="submit" form="employee-drawer-form">
            Save changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
