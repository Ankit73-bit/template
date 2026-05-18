import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Compliance, cost centers, and executive summaries.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
          <CardDescription>
            Saved report templates and scheduled exports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="No saved reports"
            description="Pin frequently used cuts from payroll, attendance, and headcount analytics."
          />
        </CardContent>
      </Card>
    </div>
  );
}
