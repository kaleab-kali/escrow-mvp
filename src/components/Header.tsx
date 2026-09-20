import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import type { RoleId } from "@/lib/types";
import { getRole } from "@/lib/roles";

export function Header({ role }: { role: RoleId }) {
  const r = getRole(role);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b3d2e] text-[#c9a227]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 leading-tight truncate">
              EscrowET
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Escrow-as-a-Service · ኤስክሮው አገልግሎት
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-[#0b3d2e]">
            Home / መነሻ
          </Link>
          <Link href="/deals" className="hover:text-[#0b3d2e]">
            Deals / ስምምነቶች
          </Link>
          <Link href={`/dashboard/${role}`} className="hover:text-[#0b3d2e]">
            Dashboard
          </Link>
          <Link href="/deals/new" className="hover:text-[#0b3d2e]">
            New escrow
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <span
            className={`hidden lg:inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${r.color}`}
          >
            {r.label}
          </span>
          <RoleSwitcher current={role} />
        </div>
      </div>
    </header>
  );
}
