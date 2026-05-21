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
  void form;

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
                      placeholder="From sheet: Agency ID no. Leave blank for auto (e.g. EMP-1007)"
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
                <FormLabel>Name of employee</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Priya Sharma" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="currentAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Current residential address" rows={3} className="resize-y" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={rhfControl}
            name="permanentAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permanent address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Permanent address (or SAME as current)"
                    rows={3}
                    className="resize-y"
                    {...field}
                  />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Master sheet details</CardTitle>
          <CardDescription>
            Fields from the employee import template (physical, education, verification).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={rhfControl}
            name="fatherOrSpouseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s / husband name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={rhfControl}
              name="ageYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (yrs)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        field.onChange(d === "" ? 0 : Number.parseInt(d, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (yrs)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        field.onChange(d === "" ? 0 : Number.parseInt(d, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="employeeCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAT (SK/USK/SSK)</FormLabel>
                  <FormControl>
                    <Input placeholder="SK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood group</FormLabel>
                  <FormControl>
                    <Input placeholder="B+" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={rhfControl}
              name="heightCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        field.onChange(d === "" ? 0 : Number.parseInt(d, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="weightKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        field.onChange(d === "" ? 0 : Number.parseInt(d, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="chestNormalInches"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chest normal (in)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        field.onChange(d === "" ? 0 : Number.parseInt(d, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="chestExpandInches"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chest expand (in)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        field.onChange(d === "" ? 0 : Number.parseInt(d, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={rhfControl}
            name="educationQualification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education / qualification</FormLabel>
                <FormControl>
                  <Input placeholder="Graduate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={rhfControl}
              name="voterCardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voter card no</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="drivingLicenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driving licence</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={rhfControl}
              name="policeVerification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Police verification</FormLabel>
                  <FormControl>
                    <Input placeholder="YES / NO" {...field} />
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
          <CardTitle className="text-lg">3. Employment information</CardTitle>
          <CardDescription>Role, site, and work arrangement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={rhfControl}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee designation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ASO, Security Officer" {...field} />
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
                <FormLabel>Site name</FormLabel>
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
          <CardTitle className="text-lg">4. Government details</CardTitle>
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
          <CardTitle className="text-lg">5. Banking information</CardTitle>
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
          <CardTitle className="text-lg">6. Salary structure</CardTitle>
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
