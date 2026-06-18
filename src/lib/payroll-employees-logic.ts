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

export function nextAgencyIdFromList(list: Pick<PayrollEmployee, "agencyIdNo">[]): string {
  const nums = list.map((e) => {
    const m = /^EMP-(\d+)$/i.exec(e.agencyIdNo.trim());
    return m ? Number.parseInt(m[1], 10) : 0;
  });
  const max = nums.length ? Math.max(0, ...nums) : 1000;
  return `EMP-${max + 1}`;
}

export function createEmployeeWithAutoId(
  list: Pick<PayrollEmployee, "agencyIdNo">[],
  values: PayrollEmployeeFormAddValues,
): { created: PayrollEmployee } | { error: string } {
  const salary = annualSalaryFromMonthlyComponents(values);
  const want = (values.agencyIdNo ?? "").trim();
  if (want) {
    const taken = list.some((e) => e.agencyIdNo.trim().toLowerCase() === want.toLowerCase());
    if (taken) {
      return { error: "AGENCY ID NO already exists." };
    }
  }
  const agencyIdNo = want || nextAgencyIdFromList(list);
  const t = nowIso();
  const created: PayrollEmployee = {
    ...values,
    agencyIdNo,
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
  if (values.agencyIdNo.trim() !== current.agencyIdNo.trim()) {
    return { error: "AGENCY ID NO cannot be changed." };
  }
  const clash = list.some(
    (e, i) =>
      i !== idx && e.agencyIdNo.trim().toLowerCase() === values.agencyIdNo.trim().toLowerCase(),
  );
  if (clash) {
    return { error: "AGENCY ID NO already exists." };
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
          employmentStatusYn: "N",
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
          employmentStatusYn: "Y",
          updatedAt: t,
        }
      : e,
  );
}

export function uniqueSitesFromEmployees(
  list: Pick<PayrollEmployee, "siteName">[],
): string[] {
  const set = new Set(list.map((e) => e.siteName.trim()).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b));
}
