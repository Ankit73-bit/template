import * as XLSX from "xlsx";
import {
  payrollEmployeeFormAddSchema,
  type PayrollEmployeeFormAddValues,
} from "@/lib/payroll-employee-schema";

export type ExcelImportFieldKey = keyof Omit<PayrollEmployeeFormAddValues, "customEmployeeId"> | "customEmployeeId";

/** Normalized Excel header → form field */
const HEADER_TO_FIELD: Record<string, ExcelImportFieldKey> = {
  "S/NO": "customEmployeeId",
  "SR NO": "customEmployeeId",
  "STATE/CITY": "location",
  "SITE NAME": "branchOrSite",
  "EMPLOYMENT STATUS (ACTIVE - Y/N)": "employmentStatus",
  "AGENCY NAME": "department",
  "AGENCY ID NO": "customEmployeeId",
  "KRC SITE BIOMETRIC ID NO.": "customEmployeeId",
  "DATE OF JOINING": "joiningDate",
  "DESIGNATION": "designation",
  "NAME OF EMPLOYEE": "fullName",
  "DATE OF BIRTH": "dateOfBirth",
  GENDER: "gender",
  "AADHAR NUMBER": "aadhaarNumber",
  "AADHAAR NUMBER": "aadhaarNumber",
  "PAN NUMBER": "panNumber",
  "UAN / PF NO.": "uanNumber",
  "UAN/PF NO.": "uanNumber",
  "PF NUMBER": "pfNumber",
  "ESIC NO.": "esicNumber",
  "ESIC NUMBER": "esicNumber",
  "BANK NAME": "bankName",
  "BANK A/C NUMBER": "bankAccountNumber",
  "BANK ACCOUNT NUMBER": "bankAccountNumber",
  "BANK IFSC NUMBER": "bankIfsc",
  "BANK IFSC": "bankIfsc",
  "CURRENT ADDRESS": "address",
  "PERMANENT ADDRESS": "address",
  "PHONE NUMBER": "phone",
  "EMAIL": "email",
  "EMAIL ID": "email",
  "SHIFT TYPE": "shiftType",
  "DEPARTMENT": "department",
  "LOCATION": "location",
  "BASIC SALARY": "salaryBasic",
  "BASIC": "salaryBasic",
  DA: "salaryDa",
  HRA: "salaryHra",
  CONVEYANCE: "salaryConveyance",
  "EDUCATION ALLOWANCE": "salaryEducationAllowance",
  LTA: "salaryLta",
  "WASHING ALLOWANCE": "salaryWashingAllowance",
  "OTHER ALLOWANCE": "salaryOtherAllowance",
  "OT RATE": "salaryOtRate",
};

export function normalizeExcelHeader(header: unknown): string {
  return String(header ?? "")
    .replace(/\r\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function parseExcelDate(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString().slice(0, 10);
    }
    return "";
  }
  if (typeof value === "number" && value > 0) {
    const parts = XLSX.SSF.parse_date_code(value);
    if (parts) {
      const y = parts.y;
      const m = String(parts.m).padStart(2, "0");
      const d = String(parts.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  return "";
}

function parseEmploymentStatus(value: unknown, lastWorkingDay: unknown): "active" | "inactive" {
  if (lastWorkingDay != null && String(lastWorkingDay).trim() !== "") {
    const lwd = parseExcelDate(lastWorkingDay);
    if (lwd) {
      const end = Date.parse(lwd);
      if (!Number.isNaN(end) && end < Date.now()) return "inactive";
    }
  }
  const s = String(value ?? "")
    .trim()
    .toUpperCase();
  if (s === "N" || s === "NO" || s === "INACTIVE") return "inactive";
  if (s === "Y" || s === "YES" || s === "ACTIVE") return "active";
  return "active";
}

function parseGender(value: unknown): PayrollEmployeeFormAddValues["gender"] {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  if (s.startsWith("m")) return "male";
  if (s.startsWith("f")) return "female";
  if (s === "other") return "other";
  return "prefer_not_to_say";
}

function cellString(value: unknown): string {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function cellDigits(value: unknown): string {
  const s = cellString(value);
  if (!s) return "";
  return s.replace(/\D/g, "");
}

function cellNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  const n = Number.parseFloat(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function pickSheet(workbook: XLSX.WorkBook): string {
  const preferred = workbook.SheetNames.find((n) =>
    /master|manpower|employee/i.test(n),
  );
  if (preferred) return preferred;
  for (const name of workbook.SheetNames) {
    const sh = workbook.Sheets[name];
    if (!sh) continue;
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sh, { header: 1, defval: "" });
    for (const row of matrix.slice(0, 15)) {
      if (!Array.isArray(row)) continue;
      if (row.some((c) => normalizeExcelHeader(c) === "NAME OF EMPLOYEE")) {
        return name;
      }
    }
  }
  return workbook.SheetNames[0] ?? "";
}

function findHeaderRowIndex(matrix: unknown[][]): number {
  for (let i = 0; i < Math.min(matrix.length, 30); i++) {
    const row = matrix[i];
    if (!Array.isArray(row)) continue;
    const normalized = row.map(normalizeExcelHeader);
    if (normalized.includes("NAME OF EMPLOYEE")) return i;
  }
  return -1;
}

const CUSTOM_ID_HEADER_PRIORITY: Record<string, number> = {
  "AGENCY ID NO": 10,
  "KRC SITE BIOMETRIC ID NO.": 5,
  "S/NO": 1,
  "SR NO": 1,
};

function buildHeaderIndex(headers: unknown[]): Map<ExcelImportFieldKey, number> {
  const map = new Map<ExcelImportFieldKey, number>();
  headers.forEach((h, idx) => {
    const norm = normalizeExcelHeader(h);
    const key = HEADER_TO_FIELD[norm];
    if (!key) return;
    if (map.has(key)) {
      const existingNorm = normalizeExcelHeader(headers[map.get(key)!]);
      const existingPri = CUSTOM_ID_HEADER_PRIORITY[existingNorm] ?? 0;
      const newPri = CUSTOM_ID_HEADER_PRIORITY[norm] ?? 0;
      if (newPri <= existingPri) return;
    }
    map.set(key, idx);
  });
  return map;
}

function getCell(row: unknown[], col: number | undefined): unknown {
  if (col === undefined) return "";
  return row[col] ?? "";
}

export type ParsedExcelEmployeeRow = {
  sheetName: string;
  rowNumber: number;
  values: PayrollEmployeeFormAddValues;
};

export type ExcelParseResult = {
  sheetName: string;
  rows: ParsedExcelEmployeeRow[];
  skippedEmpty: number;
};

function rowToFormValues(
  row: unknown[],
  headerIndex: Map<ExcelImportFieldKey, number>,
  extra: { lastWorkingDayCol?: number },
): PayrollEmployeeFormAddValues | null {
  const fullName = cellString(getCell(row, headerIndex.get("fullName")));
  if (!fullName || fullName.toUpperCase() === "NAME OF EMPLOYEE") return null;

  const agencyId = cellString(getCell(row, headerIndex.get("customEmployeeId")));
  const phoneRaw = getCell(row, headerIndex.get("phone"));
  const phoneDigits = cellDigits(phoneRaw);
  const phone =
    phoneDigits.length >= 7
      ? phoneDigits.slice(0, 10)
      : cellString(phoneRaw).replace(/[^\d\s+().-]/g, "").slice(0, 24);

  const currentAddr = cellString(getCell(row, headerIndex.get("address")));
  const joining = parseExcelDate(getCell(row, headerIndex.get("joiningDate")));
  const dob = parseExcelDate(getCell(row, headerIndex.get("dateOfBirth")));
  const lastWorking =
    extra.lastWorkingDayCol !== undefined ? getCell(row, extra.lastWorkingDayCol) : "";

  const emailRaw = cellString(getCell(row, headerIndex.get("email")));
  const email =
    emailRaw && emailRaw.includes("@")
      ? emailRaw.toLowerCase()
      : `emp-${(agencyId || phoneDigits || fullName.replace(/\W+/g, "").slice(0, 12) || "import").toLowerCase()}@import.local`;

  const monthlySum =
    cellNumber(getCell(row, headerIndex.get("salaryBasic"))) +
    cellNumber(getCell(row, headerIndex.get("salaryDa"))) +
    cellNumber(getCell(row, headerIndex.get("salaryHra"))) +
    cellNumber(getCell(row, headerIndex.get("salaryConveyance"))) +
    cellNumber(getCell(row, headerIndex.get("salaryEducationAllowance"))) +
    cellNumber(getCell(row, headerIndex.get("salaryLta"))) +
    cellNumber(getCell(row, headerIndex.get("salaryWashingAllowance"))) +
    cellNumber(getCell(row, headerIndex.get("salaryOtherAllowance")));

  const salaryBasic =
    monthlySum > 0 ? cellNumber(getCell(row, headerIndex.get("salaryBasic"))) : 1;

  let panNumber = cellString(getCell(row, headerIndex.get("panNumber"))).toUpperCase();
  let aadhaarNumber = cellDigits(getCell(row, headerIndex.get("aadhaarNumber")));
  let bankIfsc = cellString(getCell(row, headerIndex.get("bankIfsc"))).toUpperCase();
  if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(panNumber)) panNumber = "";
  if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) aadhaarNumber = "";
  if (bankIfsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bankIfsc)) bankIfsc = "";

  const values: PayrollEmployeeFormAddValues = {
    customEmployeeId: agencyId ? `AG-${agencyId}` : "",
    fullName,
    phone: phone || "0000000000",
    email,
    address: currentAddr || "Not provided",
    dateOfBirth: dob || "1990-01-01",
    gender: parseGender(getCell(row, headerIndex.get("gender"))),
    photoDataUrl: "",
    designation: cellString(getCell(row, headerIndex.get("designation"))) || "Staff",
    department: cellString(getCell(row, headerIndex.get("department"))) || "Operations",
    location: cellString(getCell(row, headerIndex.get("location"))) || "Mumbai",
    joiningDate: joining || new Date().toISOString().slice(0, 10),
    employmentStatus: parseEmploymentStatus(
      getCell(row, headerIndex.get("employmentStatus")),
      lastWorking,
    ),
    shiftType: cellString(getCell(row, headerIndex.get("shiftType"))) || "General",
    branchOrSite: cellString(getCell(row, headerIndex.get("branchOrSite"))) || "Head office",
    panNumber,
    aadhaarNumber,
    uanNumber: cellString(getCell(row, headerIndex.get("uanNumber"))),
    pfNumber: cellString(getCell(row, headerIndex.get("pfNumber"))),
    esicNumber: cellString(getCell(row, headerIndex.get("esicNumber"))),
    bankName: cellString(getCell(row, headerIndex.get("bankName"))),
    bankAccountNumber: cellString(getCell(row, headerIndex.get("bankAccountNumber"))),
    bankIfsc,
    bankBranchName: "",
    salaryBasic,
    salaryDa: cellNumber(getCell(row, headerIndex.get("salaryDa"))),
    salaryHra: cellNumber(getCell(row, headerIndex.get("salaryHra"))),
    salaryConveyance: cellNumber(getCell(row, headerIndex.get("salaryConveyance"))),
    salaryEducationAllowance: cellNumber(getCell(row, headerIndex.get("salaryEducationAllowance"))),
    salaryLta: cellNumber(getCell(row, headerIndex.get("salaryLta"))),
    salaryWashingAllowance: cellNumber(getCell(row, headerIndex.get("salaryWashingAllowance"))),
    salaryOtherAllowance: cellNumber(getCell(row, headerIndex.get("salaryOtherAllowance"))),
    salaryOtRate: cellNumber(getCell(row, headerIndex.get("salaryOtRate"))),
  };

  return values;
}

export function parsePayrollEmployeeWorkbook(buffer: ArrayBuffer): ExcelParseResult {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = pickSheet(workbook);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { sheetName: "", rows: [], skippedEmpty: 0 };
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const headerRowIdx = findHeaderRowIndex(matrix);
  if (headerRowIdx < 0) {
    return { sheetName, rows: [], skippedEmpty: 0 };
  }

  const headers = matrix[headerRowIdx] ?? [];
  const headerIndex = buildHeaderIndex(headers);
  const lastWorkingDayCol = headers.findIndex(
    (h) => normalizeExcelHeader(h) === "LAST WORKING DAY",
  );

  const rows: ParsedExcelEmployeeRow[] = [];
  let skippedEmpty = 0;

  for (let i = headerRowIdx + 1; i < matrix.length; i++) {
    const row = matrix[i];
    if (!Array.isArray(row)) {
      skippedEmpty++;
      continue;
    }
    const values = rowToFormValues(row, headerIndex, {
      lastWorkingDayCol: lastWorkingDayCol >= 0 ? lastWorkingDayCol : undefined,
    });
    if (!values) {
      skippedEmpty++;
      continue;
    }
    rows.push({ sheetName, rowNumber: i + 1, values });
  }

  return { sheetName, rows, skippedEmpty };
}

export type ExcelRowValidation = {
  rowNumber: number;
  fullName: string;
  ok: boolean;
  error?: string;
};

export function validateImportRows(rows: ParsedExcelEmployeeRow[]): ExcelRowValidation[] {
  return rows.map(({ rowNumber, values }) => {
    const parsed = payrollEmployeeFormAddSchema.safeParse(values);
    if (parsed.success) {
      return { rowNumber, fullName: values.fullName, ok: true };
    }
    const first = parsed.error.issues[0];
    const msg = first ? `${first.path.join(".")}: ${first.message}` : "Invalid row";
    return { rowNumber, fullName: values.fullName, ok: false, error: msg };
  });
}

export const EXCEL_IMPORT_TEMPLATE_HEADERS = [
  "NAME OF EMPLOYEE",
  "AGENCY ID NO",
  "SITE NAME",
  "STATE/CITY",
  "DESIGNATION",
  "DATE OF JOINING",
  "DATE OF BIRTH",
  "GENDER",
  "EMPLOYMENT STATUS (ACTIVE - Y/N)",
  "PHONE NUMBER",
  "CURRENT ADDRESS",
  "PAN NUMBER",
  "AADHAR NUMBER",
  "UAN / PF NO.",
  "ESIC NO.",
  "BANK NAME",
  "BANK A/C NUMBER",
  "BANK IFSC NUMBER",
  "AGENCY NAME",
  "BASIC SALARY",
] as const;

export function downloadImportTemplate(): void {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([Array.from(EXCEL_IMPORT_TEMPLATE_HEADERS)]);
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, "employee-import-template.xlsx");
}
