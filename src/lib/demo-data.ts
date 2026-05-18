export type EmploymentStatus = "active" | "on_leave" | "terminated";
export type PayrollStatus = "draft" | "processing" | "paid" | "failed";

export type EmployeeRow = {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  status: EmploymentStatus;
};

export type PayrollRunRow = {
  id: string;
  period: string;
  employees: number;
  netPay: number;
  status: PayrollStatus;
};

export const demoEmployees: EmployeeRow[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Security Lead",
    department: "Operations",
    salary: 720000,
    status: "active",
  },
  {
    id: "2",
    name: "Marcus Lee",
    role: "Site Supervisor",
    department: "Operations",
    salary: 540000,
    status: "active",
  },
  {
    id: "3",
    name: "Elena Rossi",
    role: "HR Partner",
    department: "People",
    salary: 680000,
    status: "on_leave",
  },
  {
    id: "4",
    name: "James Okonkwo",
    role: "Payroll Analyst",
    department: "Finance",
    salary: 610000,
    status: "active",
  },
  {
    id: "5",
    name: "Sofia Andersson",
    role: "Guard",
    department: "Field",
    salary: 312000,
    status: "terminated",
  },
];

export const demoPayrollRuns: PayrollRunRow[] = [
  {
    id: "pr-1",
    period: "Apr 2026",
    employees: 128,
    netPay: 18420000,
    status: "paid",
  },
  {
    id: "pr-2",
    period: "Mar 2026",
    employees: 126,
    netPay: 18105000,
    status: "paid",
  },
  {
    id: "pr-3",
    period: "May 2026",
    employees: 130,
    netPay: 0,
    status: "draft",
  },
];

export function formatCurrencyINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
