import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { UploadProvider } from "@/components/providers/upload-provider";
import { RoleSync } from "@/components/providers/role-sync";
import { UploadModal } from "@/components/common/upload-modal";
import { FloatingStatusBar } from "@/components/common/floating-status-bar";
import { ContactAdminModal } from "@/components/common/contact-admin-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UploadProvider>
      <RoleSync role="user" />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-black flex flex-col min-w-0 flex-1">
          <Header />
          <main className="flex-1 p-6 overflow-auto custom-scrollbar">
            {children}
          </main>
        </SidebarInset>
        <UploadModal />
        <FloatingStatusBar />
        <ContactAdminModal />
      </SidebarProvider>
    </UploadProvider>
  );
}
