import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cloudvault | Secure file hub",
    template: "%s | Cloudvault",
  },
  description:
    "Cloudvault lets you upload, organize, and share files securely with rich tagging, favorites, and admin controls.",
  authors: [{ name: "Cloudvault" }],
  applicationName: "Cloudvault",
  keywords: [
    "cloud storage",
    "file uploads",
    "document management",
    "secure sharing",
    "Cloudvault",
  ],
  openGraph: {
    title: "Cloudvault | Secure file hub",
    description:
      "Upload, organize, and share files securely with rich tagging, favorites, and admin controls.",
    type: "website",
    locale: "en_US",
    siteName: "Cloudvault",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloudvault | Secure file hub",
    description:
      "Upload, organize, and share files securely with rich tagging, favorites, and admin controls.",
  },
};

import { AuthProvider } from "@/components/providers/auth-provider";
import { SupportProvider } from "@/components/providers/support-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${inter.variable} antialiased`}>
        <AuthProvider>
          <SupportProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors />
            </TooltipProvider>
          </SupportProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
