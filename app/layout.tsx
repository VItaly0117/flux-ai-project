import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { LayoutClient } from "@/components/LayoutClient";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "FLUX - AI Dating Assistant",
  description: "Craft the perfect response instantly. Premium AI Dating Assistant SaaS.",
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
        <AuthProvider>
          <AuthGuard>
            <LayoutClient>{children}</LayoutClient>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
