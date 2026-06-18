import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isMongoConnectionError, MONGO_UNAVAILABLE } from "@/lib/mongo-api-errors";
import { ATTENDANCE_COLLECTION } from "@/lib/attendance-mongo-constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json({ error: "Valid month and year are required." }, { status: 400 });
    }

    const db = await getDb();
    const docs = await db
      .collection(ATTENDANCE_COLLECTION)
      .find({ month, year })
      .sort({ createdAt: -1 })
      .toArray();

    const records = docs.map((d) => {
      const o = { ...(d as Record<string, unknown>) };
      delete o._id;
      return o;
    });

    return NextResponse.json(records);
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to load attendance." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json({ error: "Valid month and year are required." }, { status: 400 });
    }

    const db = await getDb();
    await db.collection(ATTENDANCE_COLLECTION).deleteMany({ month, year });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to delete attendance." }, { status: 500 });
  }
}
