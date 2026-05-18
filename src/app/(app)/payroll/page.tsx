import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Wallet } from "lucide-react";

export default function PayrollPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Run cycles, validate inputs, and export disbursement files.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active cycle</CardTitle>
          <CardDescription>
            Draft runs appear here until payroll is locked for posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Wallet}
            title="No draft payroll"
            description="Start a new cycle from the dashboard or clone the previous closed period."
          />
        </CardContent>
      </Card>
    </div>
  );
}
