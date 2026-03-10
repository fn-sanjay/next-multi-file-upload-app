import { ResetPasswordView } from "@/views/auth-view/reset-password-view";

export const metadata = {
  title: "Reset Password ",
  description: "Set a new password for your account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
