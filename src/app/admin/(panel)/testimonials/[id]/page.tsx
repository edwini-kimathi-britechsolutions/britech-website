import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteTestimonial } from "../../../_actions/content";
import { TestimonialForm } from "@/components/admin/forms";
import { ConfirmSubmit } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Edit testimonial" };

export default async function EditTestimonial({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();
  return (
    <div>
      <PageTitle
        title="Edit testimonial"
        action={
          <form action={deleteTestimonial}>
            <input type="hidden" name="id" value={testimonial.id} />
            <ConfirmSubmit message="Delete this testimonial?">
              <Trash2 className="h-4 w-4" /> Delete
            </ConfirmSubmit>
          </form>
        }
      />
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
