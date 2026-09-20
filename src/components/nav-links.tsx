"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Handshake,
  Plus,
  ShieldCheck,
  Scale,
  BarChart3,
  Code2,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type NavIconName =
  | "LayoutDashboard"
  | "Handshake"
  | "Plus"
  | "ShieldCheck"
  | "Scale"
  | "BarChart3"
  | "Code2"
  | "Building2";

const ICONS: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  Handshake,
  Plus,
  ShieldCheck,
  Scale,
  BarChart3,
  Code2,
  Building2,
};

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
};

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/operator" &&
            pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-teal-50 text-teal-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
