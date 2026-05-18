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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const PHOTO_MAX_BYTES = 1_500_000;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

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

type EmployeeFullFormFieldsProps =
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

export function EmployeeFullFormFields({ variant, control, form }: EmployeeFullFormFieldsProps) {
  const rhfControl = control as unknown as Control<FieldValues>;
  const watchedName =
    variant === "add"
      ? (form as UseFormReturn<PayrollEmployeeFormAddValues>).watch("fullName")
      : (form as UseFormReturn<PayrollEmployeeFormValues>).watch("fullName");

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Personal information</CardTitle>
          <CardDescription>Identity and contact details for this employee.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variant === "add" && (
            <FormField
              control={rhfControl}
              name="customEmployeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Leave blank to assign automatically (e.g. EMP-1007)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={rhfControl}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Priya Sharma" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 …" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={rhfControl}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Residential address" rows={3} className="resize-y" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
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
          </div>
          <FormField
            control={rhfControl}
            name="photoDataUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo</FormLabel>
                <div className="flex flex-wrap items-end gap-4">
                  <Avatar className="h-20 w-20 border border-border">
                    {field.value ? (
                      <AvatarImage src={field.value} alt="" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-sm font-semibold">
                      {initialsFromName(typeof watchedName === "string" ? watchedName : "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) {
                            field.onChange("");
                            return;
                          }
                          if (file.size > PHOTO_MAX_BYTES) {
                            form.setError("photoDataUrl", {
                              type: "validate",
                              message: "Image must be 1.5 MB or smaller.",
                            });
                            e.target.value = "";
                            return;
                          }
                          form.clearErrors("photoDataUrl");
                          const reader = new FileReader();
                          reader.onload = () => {
                            field.onChange(typeof reader.result === "string" ? reader.result : "");
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </FormControl>
                    {field.value ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => field.onChange("")}>
                        Remove photo
                      </Button>
                    ) : null}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Employment information</CardTitle>
          <CardDescription>Role, location, and work arrangement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Role title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Security" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City or region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="joiningDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment status</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="shiftType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Day / Night / Rotating" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={rhfControl}
            name="branchOrSite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site / branch</FormLabel>
                <FormControl>
                  <Input placeholder="Site or branch name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Government details</CardTitle>
          <CardDescription>Statutory identifiers (optional unless you enforce them).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="panNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN number</FormLabel>
                  <FormControl>
                    <Input placeholder="ABCDE1234F" className="font-mono uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="aadhaarNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="12 digits"
                      maxLength={14}
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 12);
                        field.onChange(d);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={rhfControl}
              name="uanNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UAN number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="pfNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PF number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="esicNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ESIC number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Banking information</CardTitle>
          <CardDescription>Salary account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="bankBranchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      className="font-mono"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="bankIfsc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC code</FormLabel>
                  <FormControl>
                    <Input placeholder="SBIN0001234" className="font-mono uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. Salary structure</CardTitle>
          <CardDescription>
            Monthly amounts in INR (except OT rate). Annual salary in the directory is twelve times the sum of the
            allowance fields below (Basic through Other allowance).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["salaryBasic", "Basic salary"],
                ["salaryDa", "DA"],
                ["salaryHra", "HRA"],
                ["salaryConveyance", "Conveyance"],
                ["salaryEducationAllowance", "Education allowance"],
                ["salaryLta", "LTA"],
                ["salaryWashingAllowance", "Washing allowance"],
                ["salaryOtherAllowance", "Other allowance"],
                ["salaryOtRate", "OT rate"],
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
