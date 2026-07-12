import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactElement;
}) {
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
