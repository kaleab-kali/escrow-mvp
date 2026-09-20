import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { CreateDealForm } from "@/components/deals/create-deal-form";

export default async function NewDealPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const counterparties = getStore().users.filter(
    (u) => u.role === "buyer" || u.role === "seller"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create escrow deal</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Multi-step: basics → parties & amount → milestones
        </p>
      </div>
      <CreateDealForm currentUser={user} counterparties={counterparties} />
    </div>
  );
}
