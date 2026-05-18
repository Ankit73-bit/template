"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { payrollRunColumns } from "@/components/data-table/columns/payroll-run-columns";
import { demoPayrollRuns, formatCurrencyINR } from "@/lib/demo-data";

export function DashboardHome() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const totals = useMemo(() => {
    const headcount = 132;
    const pending = 4;
    const lastRun = demoPayrollRuns.find((r) => r.status === "paid");
    return { headcount, pending, lastRun };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Payroll overview
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
            Monitor cycles, approvals, and disbursements from a single control
            surface.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Schedule payroll run</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule payroll run</DialogTitle>
                <DialogDescription>
                  This dialog demonstrates modal workflows for approvals and
                  scheduling. Wire your mutation here.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Selected period will move from draft to processing after finance
                sign-off.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Quick actions</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Quick actions</DrawerTitle>
                <DrawerDescription>
                  Drawer pattern for mobile-first workflows and contextual tools.
                </DrawerDescription>
              </DrawerHeader>
              <div className="grid gap-2 px-4 pb-4">
                <Button variant="secondary" asChild>
                  <Link href="/employees/add">Add employee</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/attendance">Import attendance</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/payslips">Generate payslips</Link>
                </Button>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.headcount}</p>
            <p className="text-xs text-muted-foreground">Active on payroll</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last net pay</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totals.lastRun
                ? formatCurrencyINR(totals.lastRun.netPay)
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {totals.lastRun?.period ?? "No closed runs"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending items</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.pending}</p>
            <p className="text-xs text-muted-foreground">Approvals & exceptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payslips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">128</p>
            <p className="text-xs text-muted-foreground">Issued last cycle</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Payroll runs</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>Recent payroll runs</CardTitle>
                <CardDescription>
                  Sortable table powered by TanStack Table with column visibility.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/payroll">
                  Open payroll
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={payrollRunColumns}
                data={demoPayrollRuns}
                searchKey="period"
                searchPlaceholder="Filter by period…"
                pageSize={5}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Team activity</CardTitle>
              <CardDescription>
                Audit trail placeholder — connect to your events stream or HRIS
                webhooks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Finance approved Apr 2026 payroll batch.</p>
              <p>HR uploaded 6 attendance corrections for Field org.</p>
              <p>Payroll exported bank file for primary disbursing account.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
