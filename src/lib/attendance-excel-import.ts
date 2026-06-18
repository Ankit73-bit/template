import * as XLSX from "xlsx";
import { attendanceImportRowSchema, type AttendanceImportRow } from "@/lib/attendance-schema";

export type ParsedAttendanceRow = {
  rowNumber: number;
  values: AttendanceImportRow;
};

export type AttendanceParseResult = {
  sheetName: string;
  rows: ParsedAttendanceRow[];
};

export type AttendanceValidationResult = {
  rowNumber: number;
  name: string;
  ok: boolean;
  error?: string;
};

function findHeaderRowIndex(data: unknown[][]): number {
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    if (!Array.isArray(row)) continue;
    const joined = row.map((c) => String(c ?? "").trim().toUpperCase()).join("|");
    if (joined.includes("AGENCY NO") && joined.includes("NAME")) {
      return i;
    }
  }
  return -1;
}

function findColumnIndices(headerRow: unknown[]): {
  agencyNoIdx: number;
  nameIdx: number;
  daysWorkedIdx: number;
  weeklyOffIdx: number;
  totalIdx: number;
} {
  let agencyNoIdx = -1;
  let nameIdx = -1;
  let daysWorkedIdx = -1;
  let weeklyOffIdx = -1;
  let totalIdx = -1;

  for (let i = 0; i < headerRow.length; i++) {
    const val = String(headerRow[i] ?? "").trim().toUpperCase();
    if (val === "AGENCY NO") agencyNoIdx = i;
    else if (val === "NAME" || val === "NAME ") nameIdx = i;
  }

  // DAYS WORKED, WEEKLY OFF and TOTAL are typically in a sub-header row
  // but they may also appear in the same header row. We'll check both.
  for (let i = 0; i < headerRow.length; i++) {
    const val = String(headerRow[i] ?? "").trim().toUpperCase();
    if (val.includes("DAYS WORKED")) daysWorkedIdx = i;
    else if (val.includes("WEEKLY OFF")) weeklyOffIdx = i;
    else if (val === "TOTAL") totalIdx = i;
  }

  return { agencyNoIdx, nameIdx, daysWorkedIdx, weeklyOffIdx, totalIdx };
}

export function parseAttendanceWorkbook(buffer: ArrayBuffer): AttendanceParseResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0] || "Sheet1";
  const ws = wb.Sheets[sheetName];
  if (!ws) return { sheetName, rows: [] };

  const data: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!data.length) return { sheetName, rows: [] };

  const headerIdx = findHeaderRowIndex(data);
  if (headerIdx < 0) return { sheetName, rows: [] };

  const headerRow = data[headerIdx];
  let { agencyNoIdx, nameIdx, daysWorkedIdx, weeklyOffIdx, totalIdx } =
    findColumnIndices(headerRow);

  // Check if DAYS WORKED, WEEKLY OFF, TOTAL are in a sub-header row (next row)
  let hasSubHeader = false;
  if (daysWorkedIdx < 0 || weeklyOffIdx < 0 || totalIdx < 0) {
    const subHeaderRow = data[headerIdx + 1];
    if (Array.isArray(subHeaderRow)) {
      for (let i = 0; i < subHeaderRow.length; i++) {
        const val = String(subHeaderRow[i] ?? "").trim().toUpperCase();
        if (val.includes("DAYS WORKED") && daysWorkedIdx < 0) { daysWorkedIdx = i; hasSubHeader = true; }
        else if (val.includes("WEEKLY OFF") && weeklyOffIdx < 0) { weeklyOffIdx = i; hasSubHeader = true; }
        else if (val === "TOTAL" && totalIdx < 0) { totalIdx = i; hasSubHeader = true; }
      }
    }
  }

  if (agencyNoIdx < 0 || nameIdx < 0 || daysWorkedIdx < 0 || weeklyOffIdx < 0 || totalIdx < 0) {
    return { sheetName, rows: [] };
  }

  const dataStartIdx = headerIdx + (hasSubHeader ? 2 : 1);
  const rows: ParsedAttendanceRow[] = [];

  for (let i = dataStartIdx; i < data.length; i++) {
    const row = data[i];
    if (!Array.isArray(row)) continue;

    const agencyNo = String(row[agencyNoIdx] ?? "").trim();
    const name = String(row[nameIdx] ?? "").trim();

    if (!agencyNo && !name) continue;

    const daysWorked = Number(row[daysWorkedIdx] ?? 0);
    const weeklyOff = Number(row[weeklyOffIdx] ?? 0);
    const total = Number(row[totalIdx] ?? 0);

    if (isNaN(daysWorked) || isNaN(weeklyOff) || isNaN(total)) continue;

    rows.push({
      rowNumber: i + 1,
      values: { agencyNo, name, daysWorked, weeklyOff, total },
    });
  }

  return { sheetName, rows };
}

export function validateAttendanceRows(rows: ParsedAttendanceRow[]): AttendanceValidationResult[] {
  return rows.map((row) => {
    const parsed = attendanceImportRowSchema.safeParse(row.values);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return {
        rowNumber: row.rowNumber,
        name: row.values.name || "Unknown",
        ok: false,
        error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid data",
      };
    }
    return { rowNumber: row.rowNumber, name: row.values.name, ok: true };
  });
}

export function downloadAttendanceTemplate() {
  const headers = ["AGENCY NO", "NAME", "DAYS WORKED", "WEEKLY OFF", "TOTAL"];
  const sampleRows = [
    ["123", "VIKRAM SINGH", 26, 4, 30],
    ["456", "AJAY G KARNA", 23, 7, 30],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, "attendance-template.xlsx");
}
