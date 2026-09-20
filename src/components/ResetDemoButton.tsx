"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetDemoAction } from "@/lib/actions";

export function ResetDemoButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      className="btn-secondary"
      disabled={pending}
      onClick={() => {
        if (!confirm("Reset all demo data to seed state?")) return;
        start(async () => {
          await resetDemoAction();
          router.refresh();
        });
      }}
    >
      {pending ? "Resetting…" : "Reset demo data"}
    </button>
  );
}
