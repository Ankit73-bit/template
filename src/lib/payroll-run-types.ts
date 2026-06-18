export type PayrollStatus = "draft" | "processing" | "paid" | "failed";

export type PayrollRunRow = {
  id: string;
  period: string;
  employees: number;
  netPay: number;
  status: PayrollStatus;
};
