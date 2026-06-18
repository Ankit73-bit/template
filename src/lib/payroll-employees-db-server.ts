import { getDb } from "@/lib/mongodb";
import {
  parsePayrollEmployeeListItems,
  parsePayrollEmployees,
  type PayrollEmployeeListItem,
} from "@/lib/payroll-employee-schema";
import { PAYROLL_EMPLOYEES_COLLECTION } from "@/lib/payroll-employees-mongo-constants";

const PAYROLL_SALARY_FIELD_PROJECTION = {
  salaryBasic: 0,
  salaryDa: 0,
  salaryHra: 0,
  salaryConveyance: 0,
  salaryEducationAllowance: 0,
  salaryLta: 0,
  salaryWashingAllowance: 0,
  salaryOtherAllowance: 0,
  salaryOtRate: 0,
  updatedAt: 0,
} as const;

function serializePayrollEmployeeDocs(
  docs: Record<string, unknown>[],
): Record<string, unknown>[] {
  return docs.map((d) => {
    const o = { ...d };
    delete o._id;
    return o;
  });
}

export async function loadAllPayrollEmployeesFromDb() {
  const db = await getDb();
  const docs = await db.collection(PAYROLL_EMPLOYEES_COLLECTION).find({}).toArray();
  return parsePayrollEmployees(serializePayrollEmployeeDocs(docs));
}

export async function loadPayrollEmployeesListFromDb(): Promise<PayrollEmployeeListItem[]> {
  const db = await getDb();
  const docs = await db
    .collection(PAYROLL_EMPLOYEES_COLLECTION)
    .find({})
    .project(PAYROLL_SALARY_FIELD_PROJECTION)
    .sort({ createdAt: -1 })
    .toArray();
  return parsePayrollEmployeeListItems(serializePayrollEmployeeDocs(docs));
}

export async function countActivePayrollEmployeesFromDb(): Promise<number> {
  const db = await getDb();
  return db.collection(PAYROLL_EMPLOYEES_COLLECTION).countDocuments({
    deletedAt: null,
    employmentStatus: "active",
  });
}
