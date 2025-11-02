
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
import { Loader2 } from "lucide-react";

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
      return;
    }
    if (!isUserLoading && user) {
        // If user has no display name and is not on the profile page, redirect them.
        if (!user.displayName && pathname !== '/dashboard/profile') {
            router.push('/dashboard/profile');
            return;
        }
        // If the user is not an admin and tries to access the users page, redirect them.
        if (!isAdmin && pathname === '/dashboard/users') {
            router.push('/dashboard');
            return;
        }
    }
  }, [user, isUserLoading, router, isAdmin, pathname]);

  if (isUserLoading || !user) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading...</p>
        </div>
    );
  }

  // Do not render navigation for profile setup page
  if (pathname === '/dashboard/profile') {
    return <main className="flex min-h-screen flex-1 flex-col items-center justify-center p-4">{children}</main>;
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
