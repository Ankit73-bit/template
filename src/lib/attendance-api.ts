import { parseAttendanceRecords, type AttendanceRecord } from "@/lib/attendance-schema";

const BASE = "/api/attendance";

function errorMessageFromResponse(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const e = (data as { error?: unknown }).error;
    if (typeof e === "string" && e.trim()) return e;
  }
  return fallback;
}

export async function listAttendance(month: number, year: number): Promise<AttendanceRecord[]> {
  const res = await fetch(`${BASE}?month=${month}&year=${year}`, { cache: "no-store" });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(errorMessageFromResponse(data, "Failed to load attendance."));
  }
  if (!Array.isArray(data)) {
    return [];
  }
  return parseAttendanceRecords(data);
}

export type AttendanceImportSummary = {
  imported: number;
  skipped: number;
  failed: number;
  results: Array<{
    rowNumber: number;
    name: string;
    status: "imported" | "skipped" | "failed";
    error?: string;
  }>;
};

export async function importAttendance(
  rows: Array<{ rowNumber: number; values: { agencyNo: string; name: string; daysWorked: number; weeklyOff: number; total: number } }>,
  month: number,
  year: number,
): Promise<{ ok: true; summary: AttendanceImportSummary } | { ok: false; error: string }> {
  const res = await fetch(`${BASE}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows, month, year }),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, error: errorMessageFromResponse(data, "Failed to import attendance.") };
  }
  if (!data || typeof data !== "object" || !("imported" in data)) {
    return { ok: false, error: "Invalid response from server." };
  }
  return { ok: true, summary: data as AttendanceImportSummary };
}

export async function deleteAttendance(
  month: number,
  year: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`${BASE}?month=${month}&year=${year}`, { method: "DELETE" });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, error: errorMessageFromResponse(data, "Failed to delete attendance.") };
  }
  return { ok: true };
}

