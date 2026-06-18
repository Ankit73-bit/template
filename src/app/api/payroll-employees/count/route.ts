import { NextResponse } from "next/server";
import { isMongoConnectionError, MONGO_UNAVAILABLE } from "@/lib/mongo-api-errors";
import { countActivePayrollEmployeesFromDb } from "@/lib/payroll-employees-db-server";

export async function GET() {
  try {
    const count = await countActivePayrollEmployeesFromDb();
    return NextResponse.json({ count });
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE }, { status: 503 });
    }
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to count employees.";
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to count employees." }, { status: 500 });
  }
}
