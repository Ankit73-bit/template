import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { FileText } from "lucide-react";

export default function PayslipsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payslips</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Issue, distribute, and archive payslips with audit-friendly controls.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Distribution</CardTitle>
            <CardDescription>
              Bulk PDF generation and employee self-service links.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/payslip">Open payslip tool</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No payslip batches queued"
            description="When payroll posts, queued payslips will show status, channel, and delivery timestamps."
            action={
              <Button variant="outline" asChild>
                <Link href="/payslip">Generate sample payslip</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
