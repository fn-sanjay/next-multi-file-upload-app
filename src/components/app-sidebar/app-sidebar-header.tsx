import { FaShieldAlt, FaCube } from "react-icons/fa";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/components/providers/auth-provider";

export const AppSidebarHeader = () => {
  useSidebar();
  const { isAdmin } = useAuth();

  return (
    <div className="flex items-center group-data-[collapsible=icon]:justify-center w-full">
      {isAdmin ? (
        <FaShieldAlt className="size-6 text-primary shrink-0" />
      ) : (
        <FaCube className="size-6 text-primary shrink-0" />
      )}
      <span className="text-lg font-bold text-white transition-opacity duration-300 group-data-[collapsible=icon]:hidden ml-3">
        {isAdmin ? "Admin Console" : "Cloudvalut"}
      </span>
    </div>
  );
};
