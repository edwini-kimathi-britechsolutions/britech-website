import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { canManageContent, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "../_actions/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const newInquiries = canManageContent(user) ? await db.inquiry.count({ where: { status: "NEW" } }) : 0;
  return (
    <div className="lg:flex">
      <aside className="border-b border-navy-100 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Britech Solutions" width={110} height={42} className="h-9 w-auto" />
            <span className="rounded bg-navy-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mint-400">Admin</span>
          </Link>
        </div>
        <AdminNav role={user.role} newInquiries={newInquiries} />
        <div className="mt-auto hidden border-t border-navy-100 p-4 lg:block">
          <p className="truncate text-sm font-semibold text-navy-900">{user.name}</p>
          <p className="truncate text-xs text-navy-400">
            {user.email} · {user.role.toLowerCase()}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-900">
              View site <ExternalLink className="h-3 w-3" />
            </Link>
            <form action={logout}>
              <button className="inline-flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-red-600">
                <LogOut className="h-3 w-3" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
