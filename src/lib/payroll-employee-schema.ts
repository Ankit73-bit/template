import { z } from "zod";

export const employmentStatusSchema = z.enum(["active", "inactive"]);

export type EmploymentStatusActive = z.infer<typeof employmentStatusSchema>;

export const genderSchema = z.enum(["male", "female", "other", "prefer_not_to_say"]);

export type Gender = z.infer<typeof genderSchema>;

const salaryComponentFields = {
  salaryBasic: z.number().min(0),
  salaryDa: z.number().min(0),
  salaryHra: z.number().min(0),
  salaryConveyance: z.number().min(0),
  salaryEducationAllowance: z.number().min(0),
  salaryLta: z.number().min(0),
  salaryWashingAllowance: z.number().min(0),
  salaryOtherAllowance: z.number().min(0),
  salaryOtRate: z.number().min(0),
};

const salaryComponentShape = z.object(salaryComponentFields);

export function monthlySalaryComponentSum(
  v: Pick<
    z.infer<typeof salaryComponentShape>,
    | "salaryBasic"
    | "salaryDa"
    | "salaryHra"
    | "salaryConveyance"
    | "salaryEducationAllowance"
    | "salaryLta"
    | "salaryWashingAllowance"
    | "salaryOtherAllowance"
  >,
): number {
  return (
    v.salaryBasic +
    v.salaryDa +
    v.salaryHra +
    v.salaryConveyance +
    v.salaryEducationAllowance +
    v.salaryLta +
    v.salaryWashingAllowance +
    v.salaryOtherAllowance
  );
}

export function annualSalaryFromMonthlyComponents(
  v: Parameters<typeof monthlySalaryComponentSum>[0],
): number {
  return monthlySalaryComponentSum(v) * 12;
}

const employeeDataSchema = z
  .object({
    fullName: z.string().min(2, "Enter full name").max(120),
    phone: z
      .string()
      .min(7, "Enter a valid phone")
      .max(24, "Phone is too long")
      .regex(/^[\d\s+().-]+$/, "Invalid phone characters"),
    email: z.string().email("Enter a valid email"),
    address: z.string().min(1, "Address is required").max(500),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
    gender: genderSchema,
    photoDataUrl: z.string().max(2_500_000),
    designation: z.string().min(1, "Designation is required").max(80),
    department: z.string().min(1, "Department is required").max(120),
    location: z.string().min(1, "Location is required").max(120),
    joiningDate: z
      .string()
      .min(1, "Joining date is required")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
    employmentStatus: employmentStatusSchema,
    shiftType: z.string().min(1, "Shift type is required").max(80),
    branchOrSite: z.string().min(1, "Site or branch is required").max(120),
    panNumber: z
      .string()
      .max(20)
      .refine((s) => s === "" || /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(s), "Invalid PAN format"),
    aadhaarNumber: z
      .string()
      .max(20)
      .refine((s) => s === "" || /^\d{12}$/.test(s.replace(/\s/g, "")), "Aadhaar must be 12 digits"),
    uanNumber: z.string().max(20),
    pfNumber: z.string().max(40),
    esicNumber: z.string().max(40),
    bankName: z.string().max(120),
    bankAccountNumber: z.string().max(40),
    bankIfsc: z
      .string()
      .max(20)
      .refine(
        (s) => s === "" || /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(s),
        "Invalid IFSC format",
      ),
    bankBranchName: z.string().max(120),
  })
  .merge(salaryComponentShape)
  .superRefine((data, ctx) => {
    const sum = monthlySalaryComponentSum(data);
    if (sum <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Monthly salary components must add up to more than zero.",
        path: ["salaryBasic"],
      });
    }
  });

export const payrollEmployeeFormSchema = employeeDataSchema.extend({
  employeeId: z.string().min(1, "Employee ID is required").max(40),
});

export type PayrollEmployeeFormValues = z.infer<typeof payrollEmployeeFormSchema>;

export const payrollEmployeeFormAddSchema = employeeDataSchema.extend({
  customEmployeeId: z.string().max(40),
});

export type PayrollEmployeeFormAddValues = z.infer<typeof payrollEmployeeFormAddSchema>;

/** Empty add form; set `joiningDate` in the page to today. */
export const emptyPayrollEmployeeFormAddValues: PayrollEmployeeFormAddValues = {
  customEmployeeId: "",
  fullName: "",
  phone: "",
  email: "",
  address: "",
  dateOfBirth: "",
  gender: "prefer_not_to_say",
  photoDataUrl: "",
  designation: "",
  department: "",
  location: "",
  joiningDate: "",
  employmentStatus: "active",
  shiftType: "",
  branchOrSite: "",
  panNumber: "",
  aadhaarNumber: "",
  uanNumber: "",
  pfNumber: "",
  esicNumber: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankBranchName: "",
  salaryBasic: 0,
  salaryDa: 0,
  salaryHra: 0,
  salaryConveyance: 0,
  salaryEducationAllowance: 0,
  salaryLta: 0,
  salaryWashingAllowance: 0,
  salaryOtherAllowance: 0,
  salaryOtRate: 0,
};

export const emptyPayrollEmployeeFormValues: PayrollEmployeeFormValues = (() => {
  const { customEmployeeId, ...rest } = emptyPayrollEmployeeFormAddValues;
  void customEmployeeId;
  return { ...rest, employeeId: "" };
})();

export const payrollEmployeeSchema = employeeDataSchema.extend({
  id: z.string().min(1),
  employeeId: z.string().min(1).max(40),
  salary: z.number().min(0),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PayrollEmployee = z.infer<typeof payrollEmployeeSchema>;

export function payrollEmployeeToFormValues(employee: PayrollEmployee): PayrollEmployeeFormValues {
  const { id, salary, deletedAt, createdAt, updatedAt, ...rest } = employee;
  void id;
  void salary;
  void deletedAt;
  void createdAt;
  void updatedAt;
  return rest;
}

/** Merged before Zod parse so older localStorage rows stay valid. */
export const payrollEmployeeStorageDefaults: Record<string, unknown> = {
  address: "",
  dateOfBirth: "",
  gender: "prefer_not_to_say",
  photoDataUrl: "",
  department: "",
  location: "",
  shiftType: "",
  panNumber: "",
  aadhaarNumber: "",
  uanNumber: "",
  pfNumber: "",
  esicNumber: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankBranchName: "",
  salaryBasic: 0,
  salaryDa: 0,
  salaryHra: 0,
  salaryConveyance: 0,
  salaryEducationAllowance: 0,
  salaryLta: 0,
  salaryWashingAllowance: 0,
  salaryOtherAllowance: 0,
  salaryOtRate: 0,
};

function coerceLegacyEmployeeFields(row: Record<string, unknown>): Record<string, unknown> {
  const next = { ...row };
  const branch = String(next.branchOrSite ?? "").trim();
  if (!String(next.address ?? "").trim()) {
    next.address = "Not provided";
  }
  if (!String(next.dateOfBirth ?? "").trim()) {
    next.dateOfBirth = "1990-01-01";
  }
  if (!String(next.gender ?? "").trim()) {
    next.gender = "prefer_not_to_say";
  } else {
    const g = String(next.gender).trim();
    if (!genderSchema.safeParse(g).success) {
      next.gender = "prefer_not_to_say";
    }
  }
  if (!String(next.department ?? "").trim()) {
    next.department = "Operations";
  }
  if (!String(next.location ?? "").trim()) {
    next.location = branch || "Head office";
  }
  if (!String(next.shiftType ?? "").trim()) {
    next.shiftType = "General";
  }
  if (!String(next.branchOrSite ?? "").trim()) {
    next.branchOrSite = "Head office";
  }
  const pan = String(next.panNumber ?? "").trim();
  if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan)) {
    next.panNumber = "";
  }
  const aad = String(next.aadhaarNumber ?? "").replace(/\s/g, "");
  if (aad && !/^\d{12}$/.test(aad)) {
    next.aadhaarNumber = "";
  }
  const ifsc = String(next.bankIfsc ?? "").trim();
  if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
    next.bankIfsc = "";
  }
  return next;
}

function migrateLegacySalaryRow(row: Record<string, unknown>): Record<string, unknown> {
  const sum =
    Number(row.salaryBasic ?? 0) +
    Number(row.salaryDa ?? 0) +
    Number(row.salaryHra ?? 0) +
    Number(row.salaryConveyance ?? 0) +
    Number(row.salaryEducationAllowance ?? 0) +
    Number(row.salaryLta ?? 0) +
    Number(row.salaryWashingAllowance ?? 0) +
    Number(row.salaryOtherAllowance ?? 0);
  const salary = Number(row.salary);
  if (sum <= 0 && Number.isFinite(salary) && salary > 0) {
    return { ...row, salaryBasic: Math.round(salary / 12) };
  }
  return row;
}

export function parsePayrollEmployees(raw: unknown): PayrollEmployee[] {
  const arr = Array.isArray(raw) ? raw : [];
  const out: PayrollEmployee[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const merged = migrateLegacySalaryRow(
      coerceLegacyEmployeeFields({
        ...payrollEmployeeStorageDefaults,
        ...(item as Record<string, unknown>),
      }),
    );
    const parsed = payrollEmployeeSchema.safeParse(merged);
    if (parsed.success) {
      out.push(parsed.data);
    }
  }
  return out;
}
