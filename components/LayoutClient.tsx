"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Footer } from "@/components/Footer";

const NO_NAV_ROUTES = ["/login", "/signup"];

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !NO_NAV_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      <AnimatedBackground />
      <div className="flex min-h-screen relative">
        {showNav && <Navigation />}
        <main
          className={`flex-1 min-h-screen flex flex-col w-full min-w-0 ${
            showNav ? "lg:ml-64" : ""
          }`}
        >
          {children}
          {showNav ? <Footer /> : null}
        </main>
      </div>
    </>
  );
}
