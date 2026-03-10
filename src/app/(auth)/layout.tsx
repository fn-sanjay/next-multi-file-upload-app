import React from "react";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Premium Flickering Grid Background */}
      <FlickeringGrid
        className="absolute inset-0 z-0"
        squareSize={8}
        gridGap={6}
        color="#bfff00"
        maxOpacity={0.35}
        flickerChance={0.1}
      />

      {/* Subtle Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-tr from-black/80 via-transparent to-black/80 pointer-events-none z-1" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#bfff0010,transparent_75%)] pointer-events-none z-1" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {children}
      </div>
    </div>
  );
}
