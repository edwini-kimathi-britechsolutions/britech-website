import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { canManageContent, requireUser } from "@/lib/auth";
import { deletePost } from "../../../_actions/posts";
import { PostForm } from "@/components/admin/forms";
import { ConfirmSubmit } from "@/components/admin/fields";
import { Notice, PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Edit post" };

const SAVED: Record<string, string> = {
  published: "Published. The post is live on the website.",
  review: "Submitted for review. An editor will publish it.",
  draft: "Draft saved.",
};

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireUser();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const post = await db.post.findUnique({ where: { id }, include: { author: { select: { name: true } } } });
  if (!post) notFound();

  const editor = canManageContent(user);
  if (!editor && post.authorId !== user.id) notFound();
  const locked = !editor && post.status === "PUBLISHED";
  const canDelete = editor || (post.authorId === user.id && post.status !== "PUBLISHED");

  return (
    <div>
      <PageTitle
        title="Edit post"
        text={`By ${post.author.name}`}
        action={
          <div className="flex items-center gap-3">
            {post.status === "PUBLISHED" && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-navy-900"
              >
                View live <ExternalLink className="h-4 w-4" />
              </Link>
            )}
            {canDelete && (
              <form action={deletePost}>
                <input type="hidden" name="id" value={post.id} />
                <ConfirmSubmit message="Delete this post permanently?">
                  <Trash2 className="h-4 w-4" /> Delete
                </ConfirmSubmit>
              </form>
            )}
          </div>
        }
      />
      {sp.saved && SAVED[sp.saved] && <Notice>{SAVED[sp.saved]}</Notice>}
      {sp.error === "delete" && <Notice tone="warn">You can’t delete this post.</Notice>}
      {locked ? (
        <Notice tone="warn">This post is published. Ask an editor if it needs changes.</Notice>
      ) : (
        <PostForm post={post} canPublish={editor} />
      )}
    </div>
  );
}
