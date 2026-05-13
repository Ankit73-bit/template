import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { payslipFieldKeys, type PayslipData } from "@/lib/payslip-data";

const COLLECTION = "employees";

const MONGO_UNAVAILABLE =
  "Cannot connect to MongoDB. Start MongoDB locally (mongod) or set MONGODB_URI in .env to your Atlas connection string.";

function isMongoConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const e = error as { name?: string; code?: string | number; cause?: unknown };
  if (e.name === "MongoServerSelectionError" || e.name === "MongoNetworkError") {
    return true;
  }
  if (e.code === "ECONNREFUSED") {
    return true;
  }
  if (e.cause && typeof e.cause === "object") {
    const c = e.cause as { code?: string };
    return c.code === "ECONNREFUSED";
  }
  return false;
}

type EmployeeDoc = PayslipData & { _id: ObjectId; createdAt: Date };

function parseBody(body: unknown): PayslipData | null {
  if (body === null || typeof body !== "object") {
    return null;
  }
  const record = body as Record<string, unknown>;
  const out: Partial<PayslipData> = {};
  for (const key of payslipFieldKeys) {
    const value = record[key as string];
    if (typeof value !== "string") {
      return null;
    }
    out[key] = value;
  }
  return out as PayslipData;
}

function serialize(doc: EmployeeDoc) {
  const { _id, createdAt, ...rest } = doc;
  return {
    id: _id.toString(),
    createdAt: createdAt.toISOString(),
    ...rest,
  };
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const data = parseBody(json);
    if (!data) {
      return NextResponse.json(
        { error: "Invalid body: expected all payslip fields as strings." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const createdAt = new Date();
    const result = await db.collection(COLLECTION).insertOne({ ...data, createdAt });

    const inserted = await db.collection<EmployeeDoc>(COLLECTION).findOne({ _id: result.insertedId });
    if (!inserted) {
      return NextResponse.json({ error: "Insert succeeded but document was not found." }, { status: 500 });
    }
    return NextResponse.json(serialize(inserted), { status: 201 });
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE }, { status: 503 });
    }
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to save employee.";
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to save employee." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const cursor = db
      .collection<EmployeeDoc>(COLLECTION)
      .find({})
      .sort({ createdAt: -1 });
    const list = await cursor.toArray();
    return NextResponse.json(list.map(serialize));
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
