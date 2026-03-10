import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileView from "@/views/user-view/profile-view";
import { verifyAccessToken } from "@/lib/server/auth/tokens";
import { ROUTES } from "@/routes";

export const metadata = {
  title: "Profile",
  description: "Manage your account.",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;

  if (!payload) {
    redirect(ROUTES.auth.signIn);
  }

  if (payload.role === "ADMIN") {
    redirect(ROUTES.admin.dashboard);
  }

  return <ProfileView />;
}
