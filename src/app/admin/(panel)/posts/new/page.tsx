import { canManageContent, requireUser } from "@/lib/auth";
import { PostForm } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  const user = await requireUser();
  return (
    <div>
      <PageTitle title="New post" />
      <PostForm canPublish={canManageContent(user)} />
    </div>
  );
}
