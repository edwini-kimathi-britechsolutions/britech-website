import { requireUser } from "@/lib/auth";
import { TestimonialForm } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Add testimonial" };

export default async function NewTestimonial() {
  await requireUser(["ADMIN", "EDITOR"]);
  return (
    <div>
      <PageTitle title="Add testimonial" />
      <TestimonialForm />
    </div>
  );
}
