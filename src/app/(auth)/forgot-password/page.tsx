import { ForgotPasswordView } from "@/views/auth-view/forgot-password-view";

export const metadata = {
  title: "Forgot Password",
  description: "Recover your account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
