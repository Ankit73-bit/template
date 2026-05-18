import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Wallet,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Employees", href: "/employees", icon: Users },
  { title: "Attendance", href: "/attendance", icon: CalendarClock },
  { title: "Payroll", href: "/payroll", icon: Wallet },
  { title: "Payslips", href: "/payslips", icon: FileText },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];
