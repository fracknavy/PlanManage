"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Link2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "任务管理",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    title: "时间表",
    href: "/schedule",
    icon: Calendar,
  },
  {
    title: "链接解析",
    href: "/links",
    icon: Link2,
  },
  {
    title: "设置",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[200px] flex-col border-r bg-background md:flex">
      <div className="flex-1 overflow-auto py-6 pr-6 lg:py-8">
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
