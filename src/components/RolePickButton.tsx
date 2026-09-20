"use client";

import { useRouter } from "next/navigation";
import type { RoleId } from "@/lib/types";
import { useEscrow } from "@/lib/store";
import clsx from "clsx";

export function RolePickButton({
  role,
  label,
  labelAm,
  description,
  color,
}: {
  role: RoleId;
  label: string;
  labelAm: string;
  description: string;
  color: string;
}) {
  const { setRole } = useEscrow();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        setRole(role);
        router.push(`/dashboard/${role}`);
      }}
      className={clsx("card p-4 text-left hover:shadow-md transition w-full")}
    >
      <span
        className={clsx(
          "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
          color
        )}
      >
        {label} · {labelAm}
      </span>
      <p className="mt-2 text-sm text-slate-600 leading-snug">{description}</p>
    </button>
  );
}
