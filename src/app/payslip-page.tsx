"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  initialForm,
  parseStoredEmployeesList,
  payslipDataFromStored,
  payslipFields,
  type PayslipData,
  type StoredEmployee,
} from "@/lib/payslip-data";
import {
  Document,
  Image as PdfImage,
  PDFDownloadLink,
  PDFViewer,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const companyLogoDataUrl = "/jedi-logo.png";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.15,
    color: "#000",
  },
  slip: {
    borderWidth: 1.5,
    borderColor: "#000",
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderColor: "#000",
    minHeight: 135,
  },
  logoBox: {
    width: 118,
    borderRightWidth: 1.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  logo: {
    width: 86,
    height: 95,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 3,
    paddingHorizontal: 8,
  },
  companyName: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
  },
  companyAddress: {
    textAlign: "center",
    marginTop: 2,
  },
  title: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
  },
  employeeName: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: 700,
  },
  detailsWrap: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderColor: "#000",
    minHeight: 114,
  },
  detailCol: {
    flex: 1,
    paddingVertical: 3,
  },
  detailColRight: {
    borderLeftWidth: 1.5,
    borderColor: "#000",
  },
  detailRow: {
    flexDirection: "row",
    minHeight: 18,
    alignItems: "center",
    paddingHorizontal: 3,
  },
  detailLabel: {
    width: "57%",
  },
  detailValue: {
    width: "43%",
  },
  detailLabelRight: {
    width: "62%",
  },
  detailValueRight: {
    width: "38%",
  },
  tableWrap: {
    borderBottomWidth: 1.5,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 19,
  },
  tableHeaderCell: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontWeight: 700,
    textAlign: "center",
  },
  tableCell: {
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: "#000",
    paddingVertical: 2.5,
    paddingHorizontal: 3,
  },
  lastCol: {
    borderRightWidth: 0,
  },
  colLabel: {
    width: "21%",
  },
  colSmall: {
    width: "10%",
  },
  colLabelWide: {
    width: "35%",
  },
  colSmallWide: {
    width: "10%",
  },
  colGross: {
    width: "10%",
  },
  rightText: {
    textAlign: "right",
  },
  netLabelCell: {
    width: "71%",
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontWeight: 700,
  },
  netValueCell: {
    width: "29%",
    borderTopWidth: 1,
    borderColor: "#000",
    paddingVertical: 3,
    paddingHorizontal: 4,
    textAlign: "right",
    fontWeight: 700,
  },
  wordsWrap: {
    borderBottomWidth: 1.5,
    borderColor: "#000",
    minHeight: 52,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  wordsLabel: {
    fontWeight: 700,
    marginBottom: 3,
  },
  wordsText: {
    fontWeight: 700,
  },
  footerWrap: {
    minHeight: 170,
    paddingHorizontal: 5,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  forCompany: {
    textAlign: "right",
    fontWeight: 700,
    marginTop: 2,
  },
  footerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  disclaimer: {
    fontSize: 10,
  },
  signatory: {
    fontWeight: 700,
  },
});

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const toCurrencyOneDecimal = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

const amountOrDash = (value: number) => (value > 0 ? toCurrency(value) : "-");

function PayslipDocument({ data }: { data: PayslipData }) {
  const earningRows = [
    ["Basic", toNumber(data.basic)],
    ["DA", toNumber(data.da)],
    ["House Rent Allowance", toNumber(data.hra)],
    ["Conveyance", toNumber(data.conveyance)],
    ["Education Allowance", toNumber(data.educationAllowance)],
    ["Other Allowance", toNumber(data.otherAllowanceOne)],
    ["LTA", toNumber(data.lta)],
    ["Washing Allowance", toNumber(data.washingAllowance)],
    ["Other Allowance", toNumber(data.otherAllowanceTwo)],
    ["Over Time Earning", toNumber(data.overtime)],
  ] as const;

  const deductionRows = [
    ["Employe Contribution to PF @ 12%", toNumber(data.pfDeduction)],
    ["Employe Contribution to ESIC @ 0.75%", toNumber(data.esicDeduction)],
    ["Professional Tax", toNumber(data.professionalTax)],
    ["LWF", toNumber(data.lwf)],
    ["Security Deposit", toNumber(data.securityDeposit)],
  ] as const;

  const totalEarnings = earningRows.reduce((sum, row) => sum + row[1], 0);
  const totalDeductions = deductionRows.reduce((sum, row) => sum + row[1], 0);
  const netAmount = totalEarnings - totalDeductions;
  const earningsWithTotal = [...earningRows, ["Total Earing", totalEarnings]] as const;
  const deductionsWithTotal = [
    ...deductionRows,
    ["Total Deduction", totalDeductions],
  ] as const;

  const leftDetails = [
    ["Employe No :", data.employeeNo],
    ["Desigation  :", data.designation],
    ["Location :", data.location],
    ["Bank Details  :", data.bankDetails],
    ["Date of Joining  :", data.joiningDate],
    ["Total No Of Days :", data.totalDays],
  ] as const;

  const rightDetails = [
    ["PAN No :", data.panNo],
    ["Adhar No :", data.aadharNo],
    ["Unversal Account Number (UAN)  :", data.uanNo],
    ["PF Account Number  :", data.pfAccountNo],
    ["ESI Number  :", data.esiNo],
    ["No Of Duties  :", data.duties],
  ] as const;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.slip}>
          <View style={pdfStyles.header}>
            <View style={pdfStyles.logoBox}>
              <PdfImage src={companyLogoDataUrl} style={pdfStyles.logo} />
            </View>
            <View style={pdfStyles.headerTextWrap}>
              <Text style={pdfStyles.companyName}>
                JEDI SECURITY AND ALLIED SERVICES PVT LTD
              </Text>
              <Text style={pdfStyles.companyAddress}>407, Nirma Plaza, Makwana Rd, Marol Naka,</Text>
              <Text style={pdfStyles.companyAddress}>Nr Marol Metro Station Andheri (E)</Text>
              <Text style={pdfStyles.companyAddress}>Mumbai -40059</Text>
              <Text style={pdfStyles.title}>Pay Slip For {data.month}</Text>
              <Text style={pdfStyles.employeeName}>{data.employeeName}</Text>
            </View>
          </View>

          <View style={pdfStyles.detailsWrap}>
            <View style={pdfStyles.detailCol}>
              {leftDetails.map(([label, value]) => (
                <View style={pdfStyles.detailRow} key={label}>
                  <Text style={pdfStyles.detailLabel}>{label}</Text>
                  <Text style={pdfStyles.detailValue}>{value || "-"}</Text>
                </View>
              ))}
            </View>
            <View style={[pdfStyles.detailCol, pdfStyles.detailColRight]}>
              {rightDetails.map(([label, value]) => (
                <View style={pdfStyles.detailRow} key={label}>
                  <Text style={pdfStyles.detailLabelRight}>{label}</Text>
                  <Text style={pdfStyles.detailValueRight}>{value || "-"}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={pdfStyles.tableWrap}>
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colLabel]}>Earnigs</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colSmall]}>Amount</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colGross]}>Gross Salary</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colLabelWide]}>Deductions</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colSmallWide]}>Amount</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colGross, pdfStyles.lastCol]}>
                Gross Salary
              </Text>
            </View>

            {Array.from({ length: earningsWithTotal.length }).map((_, index) => {
              const earning = earningsWithTotal[index];
              const deduction = deductionsWithTotal[index];
              return (
                <View style={pdfStyles.tableRow} key={`${earning[0]}-${index}`}>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colLabel]}>{earning?.[0] ?? ""}</Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colSmall, pdfStyles.rightText]}>
                    {amountOrDash(earning?.[1] ?? 0)}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colGross, pdfStyles.rightText]}>
                    {amountOrDash(earning?.[1] ?? 0)}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colLabelWide]}>
                    {deduction?.[0] ?? ""}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colSmallWide, pdfStyles.rightText]}>
                    {amountOrDash(deduction?.[1] ?? 0)}
                  </Text>
                  <Text
                    style={[
                      pdfStyles.tableCell,
                      pdfStyles.colGross,
                      pdfStyles.rightText,
                      pdfStyles.lastCol,
                    ]}
                  >
                    {amountOrDash(deduction?.[1] ?? 0)}
                  </Text>
                </View>
              );
            })}

            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.netLabelCell}>Net Amount</Text>
              <Text style={pdfStyles.netValueCell}>{toCurrencyOneDecimal(netAmount)}</Text>
            </View>
          </View>

          <View style={pdfStyles.wordsWrap}>
            <Text style={pdfStyles.wordsLabel}>Amount (in words):</Text>
            <Text style={pdfStyles.wordsText}>{data.amountInWords}</Text>
          </View>

          <View style={pdfStyles.footerWrap}>
            <Text style={pdfStyles.forCompany}>
              For JEDI SECURITY AND ALLIED SERVICES PVT LTD
            </Text>
            <View style={pdfStyles.footerBottom}>
              <Text style={pdfStyles.disclaimer}>
                This is computer generated signature is not required
              </Text>
              <Text style={pdfStyles.signatory}>Authorised Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ label, value, onChange }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-800">{label}</span>
      <input
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-black outline-none ring-indigo-200 focus:ring"
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export default function PayslipPage() {
  const [formData, setFormData] = useState<PayslipData>(initialForm);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [employees, setEmployees] = useState<StoredEmployee[]>([]);
  const [employeesLoad, setEmployeesLoad] = useState<"idle" | "loading" | "error">("idle");
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const loadEmployees = useCallback(async () => {
    setEmployeesLoad("loading");
    setEmployeesError(null);
    try {
      const response = await fetch("/api/employees");
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "Could not load employees.";
        setEmployees([]);
        setEmployeesLoad("error");
        setEmployeesError(message);
        return;
      }
      setEmployees(parseStoredEmployeesList(payload));
      setEmployeesLoad("idle");
    } catch {
      setEmployees([]);
      setEmployeesLoad("error");
      setEmployeesError("Network error while loading employees.");
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const fileName = useMemo(() => {
    const safeName = (formData.employeeName || "payslip")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    return `${safeName}-payslip.pdf`;
  }, [formData.employeeName]);

  const updateField =
    (key: keyof PayslipData) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  function onSelectStoredEmployee(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    setSelectedEmployeeId(id);
    if (!id) {
      setFormData(initialForm);
      return;
    }
    const row = employees.find((e) => e.id === id);
    const next = row ? payslipDataFromStored(row) : null;
    if (next) {
      setFormData(next);
    }
  }

  async function addEmployeeToDatabase() {
    setSaveStatus("saving");
    setSaveMessage(null);
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "Could not save employee.";
        setSaveStatus("error");
        setSaveMessage(message);
        return;
      }
      setSaveStatus("success");
      setSaveMessage("Employee saved to the database.");
      await loadEmployees();
      if (
        payload &&
        typeof payload === "object" &&
        "id" in payload &&
        typeof (payload as { id: unknown }).id === "string"
      ) {
        setSelectedEmployeeId((payload as { id: string }).id);
      }
    } catch {
      setSaveStatus("error");
      setSaveMessage("Network error while saving.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm md:max-w-xl">
              <span className="font-medium text-zinc-800">Load employee from database</span>
              <select
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none ring-indigo-200 focus:ring"
                value={selectedEmployeeId}
                onChange={onSelectStoredEmployee}
                disabled={employeesLoad === "loading" || employees.length === 0}
              >
                <option value="">
                  {employeesLoad === "loading"
                    ? "Loading employees…"
                    : employees.length === 0
                      ? "No saved employees yet"
                      : "— Select an employee —"}
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.employeeName.trim() || "Unnamed"} ({e.employeeNo || e.id.slice(0, 8)})
                  </option>
                ))}
              </select>
              {employeesError ? (
                <span className="text-xs text-red-600">{employeesError}</span>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => void loadEmployees()}
              className="shrink-0 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Refresh list
            </button>
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-zinc-900">Payslip Generator</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Fill all fields to see instant preview and download the same PDF.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {payslipFields.map((field) => (
              <InputField
                key={field.key}
                label={field.label}
                value={formData[field.key]}
                onChange={updateField(field.key)}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addEmployeeToDatabase}
              disabled={saveStatus === "saving"}
              className="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveStatus === "saving" ? "Saving…" : "Add employee to database"}
            </button>
            <PDFDownloadLink
              document={<PayslipDocument data={formData} />}
              fileName={fileName}
              className="inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
            </PDFDownloadLink>
            {saveMessage ? (
              <p
                className={
                  saveStatus === "success"
                    ? "text-sm font-medium text-emerald-700"
                    : saveStatus === "error"
                      ? "text-sm font-medium text-red-700"
                      : "text-sm text-zinc-600"
                }
              >
                {saveMessage}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">Live Preview</h2>
          <div className="h-[900px] overflow-hidden rounded-md border border-zinc-200">
            <PDFViewer width="100%" height="100%">
              <PayslipDocument data={formData} />
            </PDFViewer>
          </div>
        </section>
      </main>
    </div>
  );
}
