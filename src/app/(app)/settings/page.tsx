"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayslipTemplateSettingsForm } from "@/features/settings/payslip-template-settings-form";

const settingsSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  payrollEmail: z.string().email("Enter a valid email"),
  payDay: z.number().min(1).max(28),
});

type SettingsForm = z.infer<typeof settingsSchema>;

function WorkspaceSettingsCard() {
  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: "SecurePayroll Demo",
      payrollEmail: "payroll@example.com",
      payDay: 28,
    },
  });

  function onSubmit(values: SettingsForm) {
    void values;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll workspace</CardTitle>
        <CardDescription>
          These fields are illustrative — persist to your database or HRIS.
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
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Security" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payrollEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payroll notifications</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="payroll@company.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used for run summaries and exception alerts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default pay day</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={28}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(Number.parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>Day of month (1–28).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Workspace defaults and payslip PDF branding are stored in this browser unless you
          wire them to a backend.
        </p>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="payslip">Payslip &amp; PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="workspace" className="mt-6">
          <WorkspaceSettingsCard />
        </TabsContent>
        <TabsContent value="payslip" className="mt-6">
          <PayslipTemplateSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
