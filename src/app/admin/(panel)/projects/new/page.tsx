import { requireUser } from "@/lib/auth";
import { ProjectForm } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Add project" };

export default async function NewProject() {
  await requireUser(["ADMIN", "EDITOR"]);
  return (
    <div>
      <PageTitle title="Add project" />
      <ProjectForm />
    </div>
  );
}
