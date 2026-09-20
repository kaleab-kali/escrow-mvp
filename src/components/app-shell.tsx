import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { ROLE_LABELS, type User } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";
import { NavLinks, type NavItem } from "@/components/nav-links";

function navFor(role: User["role"]): NavItem[] {
  const common: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/deals", label: "Deals", icon: "Handshake" },
    { href: "/deals/new", label: "New deal", icon: "Plus" },
  ];
  if (role === "operator") {
    return [
      { href: "/operator", label: "Operations", icon: "BarChart3" },
      { href: "/deals", label: "All deals", icon: "Handshake" },
      { href: "/deals/new", label: "New deal", icon: "Plus" },
      { href: "/operator/eod", label: "EOD packs", icon: "Building2" },
      { href: "/operator/settlements", label: "Settlements", icon: "Building2" },
      { href: "/operator/audit", label: "Audit", icon: "BarChart3" },
      { href: "/partners", label: "Developer", icon: "Code2" },
    ];
  }
  if (role === "verifier") {
    return [
      { href: "/verify", label: "Verification", icon: "ShieldCheck" },
      { href: "/deals", label: "Deals", icon: "Handshake" },
    ];
  }
  if (role === "mediator") {
    return [
      { href: "/mediate", label: "Disputes", icon: "Scale" },
      { href: "/deals", label: "Deals", icon: "Handshake" },
    ];
  }
  return [
    ...common,
    { href: "/partners", label: "Developer", icon: "Code2" },
  ];
}

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const items = navFor(user.role);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm text-white">
                ET
              </span>
              <span>
                Escrow<span className="text-teal-700">ET</span>
              </span>
            </Link>
            <NavLinks items={items} />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{ROLE_LABELS[user.role]}</p>
            </div>
            <form action={logout}>
              <button type="submit" className={buttonClass({ variant: "ghost", size: "sm" })}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-4 py-2 md:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
