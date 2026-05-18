"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  initialForm,
  parseStoredEmployeesList,
  payslipDataFromStored,
  payslipFields,
  type PayslipData,
  type StoredEmployee,
} from "@/lib/payslip-data";
import {
  defaultPayslipCompanySettings,
  readPayslipCompanySettings,
  type PayslipCompanySettings,
} from "@/lib/payslip-company-settings";
import { PayslipPdfDocument } from "@/components/payslip/payslip-pdf-document";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";

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
  const [company, setCompany] = useState<PayslipCompanySettings>(defaultPayslipCompanySettings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [employees, setEmployees] = useState<StoredEmployee[]>([]);
  const [employeesLoad, setEmployeesLoad] = useState<"idle" | "loading" | "error">("idle");
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setCompany(readPayslipCompanySettings());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

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
    const id = window.setTimeout(() => {
      void loadEmployees();
    }, 0);
    return () => window.clearTimeout(id);
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

  function reloadPdfTemplate() {
    setCompany(readPayslipCompanySettings());
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

  const pdfDoc = useMemo(
    () => <PayslipPdfDocument data={formData} company={company} />,
    [formData, company],
  );

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
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">Payslip Generator</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Fill all fields to see instant preview and download the same PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link
                href="/settings"
                className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-2 font-medium text-zinc-800 hover:bg-zinc-50"
              >
                Company &amp; PDF template
              </Link>
              <button
                type="button"
                onClick={reloadPdfTemplate}
                className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Reload template
              </button>
            </div>
          </div>
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
              document={pdfDoc}
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
              {pdfDoc}
            </PDFViewer>
          </div>
        </section>
      </main>
    </div>
  );
}
