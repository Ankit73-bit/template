import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isMongoConnectionError, MONGO_UNAVAILABLE } from "@/lib/mongo-api-errors";
import { payrollEmployeeFormAddSchema } from "@/lib/payroll-employee-schema";
import { loadAllPayrollEmployeesFromDb } from "@/lib/payroll-employees-db-server";
import { createEmployeeWithAutoId } from "@/lib/payroll-employees-logic";
import { PAYROLL_EMPLOYEES_COLLECTION } from "@/lib/payroll-employees-mongo-constants";

export async function GET() {
  try {
    const list = await loadAllPayrollEmployeesFromDb();
    return NextResponse.json(list);
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE }, { status: 503 });
    }
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to load employees.";
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to load employees." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = payrollEmployeeFormAddSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid employee data.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const db = await getDb();
    const col = db.collection(PAYROLL_EMPLOYEES_COLLECTION);
    const list = await loadAllPayrollEmployeesFromDb();
    const result = createEmployeeWithAutoId(list, parsed.data);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    await col.insertOne(result.created);
    return NextResponse.json(result.created, { status: 201 });
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE }, { status: 503 });
    }
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to create employee.";
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to create employee." }, { status: 500 });
  }
}
