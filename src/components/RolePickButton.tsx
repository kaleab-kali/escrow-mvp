"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRole } from "@/lib/actions";
import type { RoleId } from "@/lib/types";
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
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await setRole(role);
          router.push(`/dashboard/${role}`);
          router.refresh();
        });
      }}
      className={clsx(
        "card p-4 text-left hover:shadow-md transition w-full",
        pending && "opacity-60"
      )}
    >
      <span className={clsx("inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold", color)}>
        {label} · {labelAm}
      </span>
      <p className="mt-2 text-sm text-slate-600 leading-snug">{description}</p>
    </button>
  );
}
