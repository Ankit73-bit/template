"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PayrollEmployee } from "@/lib/payroll-employee-schema";

type EmployeeDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: PayrollEmployee | null;
  onConfirm: () => void | Promise<void>;
};

export function EmployeeDeleteDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
}: EmployeeDeleteDialogProps) {
  const name = employee?.nameOfEmployee ?? "this employee";

  async function handleConfirm() {
    await onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archive employee?</DialogTitle>
          <DialogDescription>
            {employee ? (
              <>
                <span className="font-medium text-foreground">{name}</span> will
                be marked inactive and removed from active payroll lists. Historical
                records stay available when you include archived employees.
              </>
            ) : (
              "Select an employee to archive."
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!employee}
            onClick={() => void handleConfirm()}
          >
            Archive employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
