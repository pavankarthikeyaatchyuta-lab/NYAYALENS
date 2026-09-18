'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, LayoutDashboard, FileText, MessageSquare, GitCompare, CheckSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  MessageSquare,
  GitCompare,
  CheckSquare,
  Settings,
};

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-slate-950 text-slate-50 transition-all duration-300 dark:bg-background dark:border-border",
        collapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800 dark:border-border">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <Scale className="h-6 w-6 shrink-0 text-indigo-400" />
          {!collapsed && (
            <span className="font-semibold text-lg whitespace-nowrap animate-in fade-in">
              NyayaLens
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || FileText;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-50 dark:hover:bg-accent",
                collapsed ? "justify-center px-0" : ""
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-400" : "")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
