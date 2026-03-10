import { VerifyEmailView } from "@/views/auth-view/verify-email-view";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailView />
    </Suspense>
  );
}
