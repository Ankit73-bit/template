"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  assertLogoFileAllowed,
  defaultPayslipCompanySettings,
  payslipCompanySettingsSchema,
  readFileAsDataUrl,
  readPayslipCompanySettings,
  writePayslipCompanySettings,
  type PayslipCompanySettings,
  type PayslipPdfLabels,
} from "@/lib/payslip-company-settings";
import Link from "next/link";

export function PayslipTemplateSettingsForm() {
  const [logoHint, setLogoHint] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<PayslipCompanySettings>({
    resolver: zodResolver(payslipCompanySettingsSchema),
    defaultValues: defaultPayslipCompanySettings,
  });

  const logoDataUrl = useWatch({ control: form.control, name: "logoDataUrl" });

  useEffect(() => {
    const id = window.setTimeout(() => {
      form.reset(readPayslipCompanySettings());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [form]);

  function onSubmit(values: PayslipCompanySettings) {
    writePayslipCompanySettings(values);
    setLogoHint("Saved. Open the payslip tool to refresh preview if it is already open.");
    window.setTimeout(() => setLogoHint(null), 4000);
  }

  async function onLogoFileChange(file: File | undefined) {
    if (!file) return;
    const err = assertLogoFileAllowed(file);
    if (err) {
      setLogoHint(err);
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      form.setValue("logoDataUrl", dataUrl, { shouldDirty: true });
      setLogoHint("Logo updated (not saved until you click Save template).");
    } catch {
      setLogoHint("Could not read the image file.");
    }
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  if (!hydrated) {
    return (
      <div className="h-40 animate-pulse rounded-lg bg-muted/60" aria-hidden />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payslip PDF template</CardTitle>
        <CardDescription>
          Company header, logo, footer text, and the captions beside employee values on the
          slip. Values for each employee are still entered on the{" "}
          <Link href="/payslip" className="font-medium text-primary underline-offset-4 hover:underline">
            payslip generator
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name (PDF header)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company address</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="One line per address line" {...field} />
                  </FormControl>
                  <FormDescription>Each line prints centered under the company name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Company logo</FormLabel>
              <p className="text-sm text-muted-foreground">
                PNG or JPEG, max ~600 KB. Leave empty and save to use the default site logo (
                <code className="text-xs">/jedi-logo.png</code>).
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="text-sm"
                  onChange={(e) => void onLogoFileChange(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.setValue("logoDataUrl", "", { shouldDirty: true });
                    setLogoHint("Reverted to default logo path (save to apply).");
                  }}
                >
                  Use default logo
                </Button>
              </div>
              {logoDataUrl?.startsWith("data:") ? (
                <p className="text-xs text-muted-foreground">Custom logo loaded.</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paySlipTitlePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slip title prefix</FormLabel>
                    <FormControl>
                      <Input placeholder="Pay Slip For" {...field} />
                    </FormControl>
                    <FormDescription>Month from employee data is appended.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="footerLegalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>&quot;For …&quot; line (footer)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="signatoryTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signatory caption</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disclaimerText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disclaimer (footer left)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <div>
              <h3 className="text-sm font-semibold">Employee block labels (PDF)</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Captions for the two-column employee details (sample slip style). Include colons
                if you want them on the PDF.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["employeeNo", "Employee No. :"],
                    ["panNo", "PAN No :"],
                    ["designation", "Designation :"],
                    ["aadharNo", "Aadhar No :"],
                    ["location", "Location :"],
                    ["uanNo", "UAN line"],
                    ["bankDetails", "Bank details"],
                    ["pfAccountNo", "PF account"],
                    ["joiningDate", "Date of joining"],
                    ["esiNo", "ESI number"],
                    ["totalDays", "Total days"],
                    ["duties", "Duties"],
                  ] as const
                ).map(([key, short]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`pdfLabels.${key}` as `pdfLabels.${keyof PayslipPdfLabels}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{short}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {logoHint ? (
              <p className="text-sm text-muted-foreground" role="status">
                {logoHint}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save template</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset(defaultPayslipCompanySettings);
                  setLogoHint("Reset to built-in defaults (click Save to persist).");
                }}
              >
                Reset to defaults
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
