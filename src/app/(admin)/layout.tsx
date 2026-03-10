import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { UploadProvider } from "@/components/providers/upload-provider";
import { RoleSync } from "@/components/providers/role-sync";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UploadProvider>
      <RoleSync role="admin" />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-black flex flex-col min-w-0 flex-1">
          <Header />
          <main className="flex-1 overflow-auto custom-scrollbar">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UploadProvider>
  );
}
