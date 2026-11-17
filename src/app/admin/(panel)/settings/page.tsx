import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { getSmtpConfig } from "@/lib/mail";
import { SettingsForm, SmtpForm, TestEmailForm } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const user = await requireUser(["ADMIN"]);
  const [values, smtp] = await Promise.all([getSettings(), getSmtpConfig()]);
  return (
    <div>
      <PageTitle title="Site settings" text="Contact details and social links used across the website." />
      <div className="space-y-6">
        <SettingsForm values={values} />
        <div className="max-w-3xl space-y-4">
          <SmtpForm config={smtp} />
          {smtp.host && <TestEmailForm defaultTo={smtp.notifyTo[0] ?? user.email} />}
        </div>
      </div>
    </div>
  );
}
