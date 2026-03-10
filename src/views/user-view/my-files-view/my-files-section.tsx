import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface MyFilesSectionProps {
  children: ReactNode;
  withSeparator?: boolean;
}

export function MyFilesSection({
  children,
  withSeparator = true,
}: MyFilesSectionProps) {
  if (!children) {
    return null;
  }

  return (
    <section className="space-y-6">
      {withSeparator ? <Separator className="bg-white/5" /> : null}
      {children}
    </section>
  );
}
