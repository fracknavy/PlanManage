"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { User } from "@/types";
import { useUserSettings } from "@/hooks/use-user-settings";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { settings, isLoading: isLoadingSettings } = useUserSettings();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || isLoadingSettings) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user: User = {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name,
    avatarUrl: session.user.image,
    defaultWorkStartTime: settings?.defaultWorkStartTime || "09:00",
    defaultWorkEndTime: settings?.defaultWorkEndTime || "18:00",
    defaultBreakDuration: settings?.defaultBreakDuration || 15,
    defaultTaskWeight: settings?.defaultTaskWeight || 5,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
