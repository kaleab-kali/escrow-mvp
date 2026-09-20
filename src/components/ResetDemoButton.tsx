"use client";

import { useEscrow } from "@/lib/store";

export function ResetDemoButton() {
  const { resetDemo } = useEscrow();
  return (
    <button
      className="btn-secondary"
      onClick={() => {
        if (!confirm("Reset all demo data to seed state?")) return;
        resetDemo();
      }}
    >
      Reset demo data
    </button>
  );
}
