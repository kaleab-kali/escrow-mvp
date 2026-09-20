import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, demoAccounts } from "@/lib/auth";
import { roleHome } from "@/lib/deal-helpers";
import { loginAsUserId } from "@/lib/actions/auth";
import { SECTOR_LABELS } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(roleHome(user.role));

  const accounts = demoAccounts();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-700 text-xs text-white">
              ET
            </span>
            EscrowET
          </Link>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
            Demo
          </span>
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight">Choose an industry account</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Each identity only sees deals in its sector.
        </p>

        <div className="mt-6 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {accounts.map((a) => (
            <form key={a.userId} action={loginAsUserId.bind(null, a.userId)}>
              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-left transition hover:border-teal-600 hover:bg-teal-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {a.sector ? SECTOR_LABELS[a.sector] : a.subtitle.split(" · ")[0]}
                    {a.subtitle.includes("@")
                      ? ` · ${a.subtitle.split(" · ").slice(-1)[0]}`
                      : ""}
                  </p>
                </div>
                <span className={buttonClass({ size: "sm" })}>Continue</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
