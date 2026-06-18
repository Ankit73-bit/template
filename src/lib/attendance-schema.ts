import { z } from "zod";

export const attendanceRecordSchema = z.object({
  id: z.string(),
  agencyNo: z.string().min(1, "AGENCY NO is required"),
  name: z.string().min(1, "NAME is required"),
  daysWorked: z.number().min(0, "DAYS WORKED must be >= 0"),
  weeklyOff: z.number().min(0, "WEEKLY OFF must be >= 0"),
  total: z.number().min(1, "TOTAL must be >= 1"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  createdAt: z.string(),
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const attendanceImportRowSchema = z.object({
  agencyNo: z.string().min(1, "AGENCY NO is required"),
  name: z.string().min(1, "NAME is required"),
  daysWorked: z.number().min(0, "DAYS WORKED must be >= 0"),
  weeklyOff: z.number().min(0, "WEEKLY OFF must be >= 0"),
  total: z.number().min(1, "TOTAL must be >= 1"),
});

export type AttendanceImportRow = z.infer<typeof attendanceImportRowSchema>;

export function parseAttendanceRecords(raw: unknown[]): AttendanceRecord[] {
  const results: AttendanceRecord[] = [];
  for (const item of raw) {
    const parsed = attendanceRecordSchema.safeParse(item);
    if (parsed.success) {
      results.push(parsed.data);
    }
  }
  return results;
}
