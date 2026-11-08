"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./announcement-bar";
import { Header } from "./header";
import { Footer } from "./footer";

interface StoreLayoutProps {
  children: React.ReactNode;
}

function StoreShell({ children }: StoreLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <main className="flex-1">{children}</main>
        </div>
      }
    >
      <StoreShell>{children}</StoreShell>
    </Suspense>
  );
}
