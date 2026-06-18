"use client";

import { useEffect, useState } from "react";
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
import { EmptyState } from "@/components/empty-state";
import type { PayrollRunRow } from "@/lib/payroll-run-types";

export function DashboardHome() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [headcount, setHeadcount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/payroll-employees/count", { cache: "no-store" });
        const data: unknown = await res.json().catch(() => null);
        if (cancelled || !res.ok) return;
        if (data && typeof data === "object" && "count" in data && typeof data.count === "number") {
          setHeadcount(data.count);
        }
      } catch {
        // Leave headcount as null when the API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const payrollRuns: PayrollRunRow[] = [];

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
            <p className="text-2xl font-bold">{headcount ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Active on payroll</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last net pay</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">No closed runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending items</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">Approvals & exceptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payslips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">No payslips issued yet</p>
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
              {payrollRuns.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No payroll runs yet"
                  description="Closed payroll cycles will appear here once you run payroll."
                />
              ) : (
                <DataTable
                  columns={payrollRunColumns}
                  data={payrollRuns}
                  searchKey="period"
                  searchPlaceholder="Filter by period…"
                  pageSize={5}
                />
              )}
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
            <CardContent>
              <EmptyState
                icon={CalendarClock}
                title="No activity yet"
                description="Team actions and audit events will show here once connected to your workflow."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
