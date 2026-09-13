'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, LayoutDashboard, FileText, MessageSquare, GitCompare, CheckSquare, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  MessageSquare,
  GitCompare,
  CheckSquare,
  Settings,
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0 bg-slate-950 text-slate-50 border-r-slate-800 dark:bg-background">
        <div className="flex h-16 items-center px-6 border-b border-slate-800 dark:border-border">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <Scale className="h-6 w-6 text-indigo-400" />
            <SheetTitle className="font-semibold text-lg text-slate-50 dark:text-foreground m-0">NyayaLens</SheetTitle>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || FileText;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-50 dark:hover:bg-accent"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
