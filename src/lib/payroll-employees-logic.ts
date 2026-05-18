import {
  annualSalaryFromMonthlyComponents,
  type PayrollEmployee,
  type PayrollEmployeeFormAddValues,
  type PayrollEmployeeFormValues,
} from "@/lib/payroll-employee-schema";

export function randomEmployeeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function nextEmployeeIdFromList(list: Pick<PayrollEmployee, "employeeId">[]): string {
  const nums = list.map((e) => {
    const m = /^EMP-(\d+)$/i.exec(e.employeeId.trim());
    return m ? Number.parseInt(m[1], 10) : 0;
  });
  const max = nums.length ? Math.max(0, ...nums) : 1000;
  return `EMP-${max + 1}`;
}

export function createEmployeeWithAutoId(
  list: PayrollEmployee[],
  values: PayrollEmployeeFormAddValues,
): { created: PayrollEmployee } | { error: string } {
  const { customEmployeeId, ...data } = values;
  const salary = annualSalaryFromMonthlyComponents(data);
  const want = (customEmployeeId ?? "").trim();
  if (want) {
    const taken = list.some((e) => e.employeeId.trim().toLowerCase() === want.toLowerCase());
    if (taken) {
      return { error: "Employee ID already exists." };
    }
  }
  const employeeId = want || nextEmployeeIdFromList(list);
  const t = nowIso();
  const created: PayrollEmployee = {
    ...data,
    employeeId,
    salary,
    id: randomEmployeeId(),
    deletedAt: null,
    createdAt: t,
    updatedAt: t,
  };
  return { created };
}

export function updateEmployeeInList(
  list: PayrollEmployee[],
  id: string,
  values: PayrollEmployeeFormValues,
): { updated: PayrollEmployee } | { error: string } {
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) {
    return { error: "Employee not found." };
  }
  const current = list[idx]!;
  if (values.employeeId.trim() !== current.employeeId.trim()) {
    return { error: "Employee ID cannot be changed." };
  }
  const clash = list.some(
    (e, i) =>
      i !== idx && e.employeeId.trim().toLowerCase() === values.employeeId.trim().toLowerCase(),
  );
  if (clash) {
    return { error: "Employee ID already exists." };
  }
  const t = nowIso();
  const salary = annualSalaryFromMonthlyComponents(values);
  const updated: PayrollEmployee = {
    ...values,
    salary,
    id: current.id,
    deletedAt: current.deletedAt,
    createdAt: current.createdAt,
    updatedAt: t,
  };
  return { updated };
}

export function softDeleteEmployeeInList(list: PayrollEmployee[], id: string): PayrollEmployee[] {
  const t = nowIso();
  return list.map((e) =>
    e.id === id
      ? {
          ...e,
          deletedAt: t,
          employmentStatus: "inactive" as const,
          updatedAt: t,
        }
      : e,
  );
}

export function restoreEmployeeInList(list: PayrollEmployee[], id: string): PayrollEmployee[] {
  const t = nowIso();
  return list.map((e) =>
    e.id === id
      ? {
          ...e,
          deletedAt: null,
          employmentStatus: "active" as const,
          updatedAt: t,
        }
      : e,
  );
}

export function uniqueBranchesFromEmployees(list: PayrollEmployee[]): string[] {
  const set = new Set(list.map((e) => e.branchOrSite.trim()).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b));
}
