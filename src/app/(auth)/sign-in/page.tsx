import { SignInView } from "@/views/auth-view/sign-in-view";

export const metadata = {
  title: "Sign In ",
  description: "Sign in to your account to manage your files.",
};

export default function SignInPage() {
  return <SignInView />;
}
