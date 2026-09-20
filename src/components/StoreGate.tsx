"use client";

import { useEscrow } from "@/lib/store";
import type { ReactNode } from "react";

export function StoreGate({ children }: { children: ReactNode }) {
  const { ready } = useEscrow();
  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading demo data…
      </div>
    );
  }
  return <>{children}</>;
}
