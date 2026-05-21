"use client";

import type { Control, FieldValues, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MASTER_DATA_EMPLOYEE_FIELDS,
  labelForMasterField,
  type MasterEmployeeFieldKey,
} from "@/lib/payroll-employee-master-fields";
import type {
  Gender,
  PayrollEmployeeFormAddValues,
  PayrollEmployeeFormValues,
} from "@/lib/payroll-employee-schema";

const GENDER_OPTIONS: readonly Gender[] = ["male", "female", "other", "prefer_not_to_say"];

const genderLabels: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

function digitAmountInputProps(
  value: number,
  onChange: (n: number) => void,
): Pick<
  React.ComponentProps<typeof Input>,
  "type" | "inputMode" | "value" | "onChange" | "autoComplete"
> {
  return {
    type: "text",
    inputMode: "numeric",
    autoComplete: "off",
    value: value === 0 ? "" : String(value),
    onChange: (e) => {
      const digits = e.target.value.replace(/\D/g, "");
      onChange(digits === "" ? 0 : Number.parseInt(digits, 10));
    },
  };
}

type Props =
  | {
      variant: "add";
      control: Control<PayrollEmployeeFormAddValues>;
      form: UseFormReturn<PayrollEmployeeFormAddValues>;
    }
  | {
      variant: "edit";
      control: Control<PayrollEmployeeFormValues>;
      form: UseFormReturn<PayrollEmployeeFormValues>;
    };

function renderMasterField(
  fieldKey: MasterEmployeeFieldKey,
  rhfControl: Control<FieldValues>,
  label: string,
  formType: (typeof MASTER_DATA_EMPLOYEE_FIELDS)[number]["formType"],
) {
  if (fieldKey === "agencyIdNo" && formType === "text") {
    return (
      <FormField
        key={fieldKey}
        control={rhfControl}
        name={fieldKey}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                placeholder="From Excel AGENCY ID NO — leave blank for auto ID"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (formType === "textarea") {
    return (
      <FormField
        key={fieldKey}
        control={rhfControl}
        name={fieldKey}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-y text-sm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (formType === "date") {
    return (
      <FormField
        key={fieldKey}
        control={rhfControl}
        name={fieldKey}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input type="date" className="text-sm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (formType === "gender") {
    return (
      <FormField
        key={fieldKey}
        control={rhfControl}
        name={fieldKey}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {genderLabels[opt]}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (formType === "employmentYn") {
    return (
      <FormField
        key={fieldKey}
        control={rhfControl}
        name={fieldKey}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={field.value || "Y"}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      key={fieldKey}
      control={rhfControl}
      name={fieldKey}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input className="text-sm" {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EmployeeMasterFormFields({ variant, control }: Props) {
  const rhfControl = control as unknown as Control<FieldValues>;

  const fields =
    variant === "edit"
      ? MASTER_DATA_EMPLOYEE_FIELDS.filter((f) => f.key !== "agencyIdNo")
      : MASTER_DATA_EMPLOYEE_FIELDS;

  return (
    <div className="space-y-8">
      <Card className="border-sky-200/80 bg-gradient-to-b from-sky-50/80 to-background dark:border-sky-900/50 dark:from-sky-950/30">
        <CardHeader>
          <CardTitle className="text-lg">Master Data — Agency Manpower</CardTitle>
          <CardDescription>
            Field names match your KRC Excel sheet exactly ({MASTER_DATA_EMPLOYEE_FIELDS.length}{" "}
            columns).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((def) =>
              renderMasterField(def.key, rhfControl, def.label, def.formType),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payroll (system)</CardTitle>
          <CardDescription>
            Not in the Excel sheet — used for annual salary in the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["salaryBasic", "BASIC SALARY (monthly)"],
                ["salaryDa", "DA"],
                ["salaryHra", "HRA"],
                ["salaryConveyance", "CONVEYANCE"],
                ["salaryEducationAllowance", "EDUCATION ALLOWANCE"],
                ["salaryLta", "LTA"],
                ["salaryWashingAllowance", "WASHING ALLOWANCE"],
                ["salaryOtherAllowance", "OTHER ALLOWANCE"],
                ["salaryOtRate", "OT RATE"],
              ] as const
            ).map(([name, label]) => (
              <FormField
                key={name}
                control={rhfControl}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        placeholder="0"
                        {...digitAmountInputProps(field.value as number, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { labelForMasterField };
