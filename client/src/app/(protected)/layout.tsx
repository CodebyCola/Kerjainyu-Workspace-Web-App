"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/routes/route";

export default function MainLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once the check has actually resolved — redirecting
    // during "loading" would bounce every visitor with a valid session
    // to /login for the split second before /api/me responds.
    if (status === "unauthenticated") {
      router.replace(ROUTES.LOGIN);
    }
  }, [status, router]);

  // Renders nothing (rather than the protected UI, and rather than a
  // redirect that hasn't happened yet) while the session is being
  // checked or once we know it's invalid — avoids a flash of
  // protected content for a user who's about to get redirected away.
  if (status !== "authenticated") {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex h-full flex-col md:pl-16 lg:pl-60">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
