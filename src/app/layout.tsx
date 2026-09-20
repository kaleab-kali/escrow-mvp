import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Inter } from "next/font/google";
import "./globals.css";
import { DemoBanner } from "@/components/DemoBanner";
import { Header } from "@/components/Header";
import { getCurrentRole } from "@/lib/actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EscrowET — Escrow-as-a-Service (Demo MVP)",
  description:
    "Trust intermediary for Ethiopia informal and low-trust markets. Demo only — funds simulated.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getCurrentRole();
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <DemoBanner />
        <Header role={role} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
        <footer className="border-t border-slate-200 mt-12">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 flex flex-col sm:flex-row gap-2 justify-between">
            <span>
              EscrowET Demo MVP · Partner bank holds segregated funds (simulated) ·
              Platform never owns the money
            </span>
            <span>Addis Ababa · For sector clients, banks & NBE demos</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
