import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logout } from "../../_actions/auth";
import { PasswordForm, ProfileForm } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="max-w-2xl space-y-6">
      <PageTitle
        title="My account"
        text={`${user.email} · ${user.role.toLowerCase()}`}
        action={
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-600 ring-1 ring-navy-200 hover:bg-white">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        }
      />
      <ProfileForm name={user.name} />
      <PasswordForm />
    </div>
  );
}
