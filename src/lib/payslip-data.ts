export type PayslipData = {
  month: string;
  employeeName: string;
  employeeNo: string;
  panNo: string;
  designation: string;
  aadharNo: string;
  location: string;
  uanNo: string;
  bankDetails: string;
  pfAccountNo: string;
  joiningDate: string;
  esiNo: string;
  totalDays: string;
  duties: string;
  basic: string;
  da: string;
  hra: string;
  conveyance: string;
  educationAllowance: string;
  otherAllowanceOne: string;
  lta: string;
  washingAllowance: string;
  otherAllowanceTwo: string;
  overtime: string;
  pfDeduction: string;
  esicDeduction: string;
  professionalTax: string;
  lwf: string;
  securityDeposit: string;
  amountInWords: string;
};

export const payslipFieldKeys: (keyof PayslipData)[] = [
  "month",
  "employeeName",
  "employeeNo",
  "panNo",
  "designation",
  "aadharNo",
  "location",
  "uanNo",
  "bankDetails",
  "pfAccountNo",
  "joiningDate",
  "esiNo",
  "totalDays",
  "duties",
  "basic",
  "da",
  "hra",
  "conveyance",
  "educationAllowance",
  "otherAllowanceOne",
  "lta",
  "washingAllowance",
  "otherAllowanceTwo",
  "overtime",
  "pfDeduction",
  "esicDeduction",
  "professionalTax",
  "lwf",
  "securityDeposit",
  "amountInWords",
];

export type StoredEmployee = PayslipData & {
  id: string;
  createdAt: string;
};

export function payslipDataFromStored(record: unknown): PayslipData | null {
  if (record === null || typeof record !== "object") {
    return null;
  }
  const r = record as Record<string, unknown>;
  const out: Partial<PayslipData> = {};
  for (const key of payslipFieldKeys) {
    const v = r[key as string];
    if (typeof v !== "string") {
      return null;
    }
    out[key] = v;
  }
  return out as PayslipData;
}

export function parseStoredEmployeesList(data: unknown): StoredEmployee[] {
  if (!Array.isArray(data)) {
    return [];
  }
  const list: StoredEmployee[] = [];
  for (const row of data) {
    const payslip = payslipDataFromStored(row);
    if (!payslip || row === null || typeof row !== "object") {
      continue;
    }
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.createdAt !== "string") {
      continue;
    }
    list.push({ ...payslip, id: r.id, createdAt: r.createdAt });
  }
  return list;
}

export const payslipFields: Array<{ key: keyof PayslipData; label: string }> = [
  { key: "month", label: "Month" },
  { key: "employeeName", label: "Employee Name" },
  { key: "employeeNo", label: "Employee Number" },
  { key: "panNo", label: "PAN Number" },
  { key: "designation", label: "Designation" },
  { key: "aadharNo", label: "Aadhar Number" },
  { key: "location", label: "Location" },
  { key: "uanNo", label: "UAN Number" },
  { key: "bankDetails", label: "Bank Details" },
  { key: "pfAccountNo", label: "PF Account Number" },
  { key: "joiningDate", label: "Date of Joining" },
  { key: "esiNo", label: "ESI Number" },
  { key: "totalDays", label: "Total No of Days" },
  { key: "duties", label: "No of Duties" },
  { key: "basic", label: "Basic" },
  { key: "da", label: "DA" },
  { key: "hra", label: "House Rent Allowance" },
  { key: "conveyance", label: "Conveyance" },
  { key: "educationAllowance", label: "Education Allowance" },
  { key: "otherAllowanceOne", label: "Other Allowance 1" },
  { key: "lta", label: "LTA" },
  { key: "washingAllowance", label: "Washing Allowance" },
  { key: "otherAllowanceTwo", label: "Other Allowance 2" },
  { key: "overtime", label: "Over Time Earning" },
  { key: "pfDeduction", label: "PF Deduction" },
  { key: "esicDeduction", label: "ESIC Deduction" },
  { key: "professionalTax", label: "Professional Tax" },
  { key: "lwf", label: "LWF" },
  { key: "securityDeposit", label: "Security Deposit" },
  { key: "amountInWords", label: "Amount in Words" },
];

export const initialForm: PayslipData = {
  month: "APRIL-2025",
  employeeName: "RANJEET GAUTAM",
  employeeNo: "JD23080010",
  panNo: "DPYPG1921Q",
  designation: "Security Supervisor",
  aadharNo: "869205712573",
  location: "Mumbai",
  uanNo: "101982424318",
  bankDetails: "KDMAL24743860000010662",
  pfAccountNo: "20526504842",
  joiningDate: "16-08-2023",
  esiNo: "3518168316",
  totalDays: "26",
  duties: "26",
  basic: "14432",
  da: "3614",
  hra: "3609",
  conveyance: "2200",
  educationAllowance: "0",
  otherAllowanceOne: "0",
  lta: "100",
  washingAllowance: "900",
  otherAllowanceTwo: "0",
  overtime: "0",
  pfDeduction: "1800",
  esicDeduction: "186",
  professionalTax: "200",
  lwf: "0",
  securityDeposit: "0",
  amountInWords: "Rupees TwentyTwo Thousand Six Hundred SixtyNine Only",
};
