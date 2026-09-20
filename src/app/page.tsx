import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSessionUser, demoAccounts } from "@/lib/auth";
import { roleHome } from "@/lib/deal-helpers";
import { loginAsUserId } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/button";
import { SECTOR_LABELS } from "@/lib/types";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect(roleHome(user.role));

  const accounts = demoAccounts();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm text-white">
              ET
            </span>
            Escrow<span className="text-teal-700">ET</span>
          </div>
          <Link href="/login" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Escrow for ETB deals
          </h1>
          <p className="mt-3 text-base text-zinc-600">
            Hold, release, and settle funds between buyers and sellers — by industry.
          </p>
          <div className="mt-8">
            <Link href="/login" className={buttonClass({ size: "lg" })}>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="mt-14">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Continue as</h2>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
              Demo
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => (
              <form key={a.userId} action={loginAsUserId.bind(null, a.userId)}>
                <button
                  type="submit"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-teal-600 hover:bg-teal-50"
                >
                  <span className="block text-sm font-semibold">{a.title}</span>
                  <span className="mt-1 block truncate text-xs text-zinc-500">
                    {a.sector ? SECTOR_LABELS[a.sector] : a.subtitle.split(" · ")[0]}
                  </span>
                </button>
              </form>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
