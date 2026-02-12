import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { LayoutClient } from "@/components/LayoutClient";
import { GlobalLoader } from "@/components/GlobalLoader";
import { ToastProvider } from "@/components/ToastProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "FLUX - AI Chat Analyzer",
  description: "Decode your conversations with the power of Flux AI.",
  openGraph: {
    title: "FLUX - AI Chat Analyzer",
    description: "Decode your conversations with the power of Flux AI.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="min-h-screen bg-[#020617] text-zinc-100 font-sans antialiased">
        <GlobalLoader />
        <ToastProvider>
          <AuthProvider>
            <AuthGuard>
              <LayoutClient>{children}</LayoutClient>
            </AuthGuard>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
