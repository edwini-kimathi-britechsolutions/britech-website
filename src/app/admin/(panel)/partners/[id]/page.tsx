import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deletePartner } from "../../../_actions/content";
import { PartnerForm } from "@/components/admin/forms";
import { ConfirmSubmit } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Edit logo" };

export default async function EditPartner({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const partner = await db.partner.findUnique({ where: { id } });
  if (!partner) notFound();
  return (
    <div>
      <PageTitle
        title={`Edit ${partner.name}`}
        action={
          <form action={deletePartner}>
            <input type="hidden" name="id" value={partner.id} />
            <ConfirmSubmit message={`Remove ${partner.name}?`}>
              <Trash2 className="h-4 w-4" /> Remove
            </ConfirmSubmit>
          </form>
        }
      />
      <PartnerForm partner={partner} />
    </div>
  );
}
