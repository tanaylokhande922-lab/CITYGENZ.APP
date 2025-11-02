'use client';

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ADMIN_EMAIL } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
    // If the user is not an admin and tries to access the users page, redirect them.
    if (!isUserLoading && user && !isAdmin && pathname === '/dashboard/users') {
        router.push('/dashboard');
    }
  }, [user, isUserLoading, router, isAdmin, pathname]);

  if (isUserLoading || !user) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <MainNav isAdmin={isAdmin} />
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <div className="flex flex-col w-full">
            <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
                <SidebarTrigger />
                <div className="w-full flex-1">
                {/* Add search or other header elements here if needed */}
                </div>
                <UserNav />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
