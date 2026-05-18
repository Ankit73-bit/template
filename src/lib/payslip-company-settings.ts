import { z } from "zod";

/** Labels shown in the PDF employee detail rows (left / right columns), matching typical Indian salary slip wording. */
export const payslipPdfLabelsSchema = z.object({
  employeeNo: z.string().min(1),
  panNo: z.string().min(1),
  designation: z.string().min(1),
  aadharNo: z.string().min(1),
  location: z.string().min(1),
  uanNo: z.string().min(1),
  bankDetails: z.string().min(1),
  pfAccountNo: z.string().min(1),
  joiningDate: z.string().min(1),
  esiNo: z.string().min(1),
  totalDays: z.string().min(1),
  duties: z.string().min(1),
});

export type PayslipPdfLabels = z.infer<typeof payslipPdfLabelsSchema>;

export const defaultPayslipPdfLabels: PayslipPdfLabels = {
  employeeNo: "Employee No. :",
  panNo: "PAN No :",
  designation: "Designation :",
  aadharNo: "Aadhar No :",
  location: "Location :",
  uanNo: "Universal Account Number (UAN) :",
  bankDetails: "Bank Details :",
  pfAccountNo: "PF Account Number :",
  joiningDate: "Date of Joining :",
  esiNo: "ESI Number :",
  totalDays: "Total No of Days :",
  duties: "No of Duties :",
};

export const payslipCompanySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  companyAddress: z.string().min(1, "Address is required").max(2000),
  logoDataUrl: z.string(),
  footerLegalName: z.string().min(1).max(200),
  signatoryTitle: z.string().min(1).max(80),
  disclaimerText: z.string().max(500),
  paySlipTitlePrefix: z.string().min(1).max(80),
  pdfLabels: payslipPdfLabelsSchema,
});

export type PayslipCompanySettings = z.infer<typeof payslipCompanySettingsSchema>;

export const defaultPayslipCompanySettings: PayslipCompanySettings = {
  companyName: "JEDI SECURITY AND ALLIED SERVICES PVT LTD",
  companyAddress:
    "407, Nirma Plaza, Makwana Rd, Marol Naka,\nNr Marol Metro Station Andheri (E)\nMumbai - 400059",
  logoDataUrl: "",
  footerLegalName: "JEDI SECURITY AND ALLIED SERVICES PVT LTD",
  signatoryTitle: "Authorised Signatory",
  disclaimerText:
    "This is computer generated signature is not required",
  paySlipTitlePrefix: "Pay Slip For",
  pdfLabels: defaultPayslipPdfLabels,
};

const STORAGE_KEY = "payslip-company-template-v1";

const MAX_LOGO_BYTES = 600_000;

export function readPayslipCompanySettings(): PayslipCompanySettings {
  if (typeof window === "undefined") {
    return defaultPayslipCompanySettings;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultPayslipCompanySettings;
    }
    const parsed: unknown = JSON.parse(raw);
    const result = payslipCompanySettingsSchema.safeParse(parsed);
    if (!result.success) {
      return defaultPayslipCompanySettings;
    }
    return {
      ...defaultPayslipCompanySettings,
      ...result.data,
      pdfLabels: {
        ...defaultPayslipPdfLabels,
        ...result.data.pdfLabels,
      },
    };
  } catch {
    return defaultPayslipCompanySettings;
  }
}

export function writePayslipCompanySettings(settings: PayslipCompanySettings): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r === "string") {
        resolve(r);
      } else {
        reject(new Error("Could not read file."));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export function assertLogoFileAllowed(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file (PNG or JPEG).";
  }
  if (file.size > MAX_LOGO_BYTES) {
    return `Logo must be under ${Math.round(MAX_LOGO_BYTES / 1024)} KB.`;
  }
  return null;
}

export const DEFAULT_PAYSLIP_LOGO_PATH = "/jedi-logo.png";
