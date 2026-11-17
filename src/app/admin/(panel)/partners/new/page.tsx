import { requireUser } from "@/lib/auth";
import { PartnerForm } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Add logo" };

export default async function NewPartner() {
  await requireUser(["ADMIN", "EDITOR"]);
  return (
    <div>
      <PageTitle title="Add client or partner" />
      <PartnerForm />
    </div>
  );
}
