import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteProject } from "../../../_actions/content";
import { ProjectForm } from "@/components/admin/forms";
import { ConfirmSubmit } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Edit project" };

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();
  return (
    <div>
      <PageTitle
        title={`Edit ${project.name}`}
        action={
          <form action={deleteProject}>
            <input type="hidden" name="id" value={project.id} />
            <ConfirmSubmit message={`Delete ${project.name}?`}>
              <Trash2 className="h-4 w-4" /> Delete
            </ConfirmSubmit>
          </form>
        }
      />
      <ProjectForm project={project} />
    </div>
  );
}
