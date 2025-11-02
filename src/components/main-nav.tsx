"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FilePlus2, List, Users } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/report", label: "Report an Issue", icon: FilePlus2 },
  { href: "/dashboard/issues", label: "View Issues", icon: List },
];

const adminNavItems = [
    { href: "/dashboard/users", label: "Users", icon: Users },
]

export function MainNav({ className, isAdmin = false }: { className?: string; isAdmin?: boolean }) {
  const pathname = usePathname();

  const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <nav className={cn("flex flex-col", className)}>
      <SidebarMenu>
        {allNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior={false} passHref>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
