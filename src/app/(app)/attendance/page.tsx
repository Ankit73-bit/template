import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { CalendarClock } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Shifts, exceptions, and approvals will appear here.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Import queue</CardTitle>
          <CardDescription>
            Connect biometric devices or CSV uploads to populate this module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarClock}
            title="No attendance batches"
            description="Upload a roster or sync your time clocks to start tracking coverage and overtime."
          />
        </CardContent>
      </Card>
    </div>
  );
}
