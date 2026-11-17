import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Image src="/images/logo.png" alt="Britech Solutions" width={150} height={58} className="mx-auto h-12 w-auto" priority />
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-7 shadow-xl shadow-navy-900/5">
          <h1 className="text-xl font-bold text-navy-900">Sign in to the admin portal</h1>
          <p className="mt-1 text-sm text-navy-500">For Britech team members only.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-navy-400">Accounts are created by an administrator.</p>
      </div>
    </div>
  );
}
