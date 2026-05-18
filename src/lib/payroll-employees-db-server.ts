import { getDb } from "@/lib/mongodb";
import { parsePayrollEmployees } from "@/lib/payroll-employee-schema";
import { PAYROLL_EMPLOYEES_COLLECTION } from "@/lib/payroll-employees-mongo-constants";

export async function loadAllPayrollEmployeesFromDb() {
  const db = await getDb();
  const docs = await db.collection(PAYROLL_EMPLOYEES_COLLECTION).find({}).toArray();
  const raw = docs.map((d) => {
    const o = { ...(d as Record<string, unknown>) };
    delete o._id;
    return o;
  });
  return parsePayrollEmployees(raw);
}
