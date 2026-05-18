"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AppSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/90 text-primary-foreground">
          <Shield className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            SecurePayroll
          </p>
          <p className="truncate text-xs text-sidebar-muted">Enterprise HRMS</p>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-3">
        <ScrollArea className="h-full min-h-[200px]">
          <SidebarNav />
        </ScrollArea>
      </div>
      <div className="mt-auto border-t border-sidebar-border p-3">
        <Link
          href="/payslip"
          className="block rounded-md px-3 py-2 text-xs text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          Legacy payslip generator
        </Link>
      </div>
    </aside>
  );
}

export function AppSidebarMobileContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/90 text-primary-foreground">
          <Shield className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold">SecurePayroll</p>
          <p className="text-xs text-sidebar-muted">Enterprise HRMS</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-3">
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <SidebarNav onNavigate={onNavigate} />
        </ScrollArea>
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="p-3">
        <Link
          href="/payslip"
          onClick={onNavigate}
          className="block rounded-md px-3 py-2 text-xs text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          Legacy payslip generator
        </Link>
      </div>
    </div>
  );
}
