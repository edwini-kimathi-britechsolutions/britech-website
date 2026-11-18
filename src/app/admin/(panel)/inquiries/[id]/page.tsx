import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Archive, ArrowLeft, CheckCircle2, Inbox, Mail, Phone, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { telHref } from "@/lib/data";
import { deleteInquiry, setInquiryStatus } from "../../../_actions/inquiries";
import { ConfirmSubmit } from "@/components/admin/fields";

export const metadata = { title: "Inquiry" };

const dateTime = (d: Date) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dar_es_Salaam" }).format(d);

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const { id } = await params;
  let inq = await db.inquiry.findUnique({ where: { id } });
  if (!inq) notFound();
  // Opening a new inquiry marks it as read.
  if (inq.status === "NEW") inq = await db.inquiry.update({ where: { id }, data: { status: "READ" } });

  const name = `${inq.firstName} ${inq.lastName}`;
  const replyHref = `mailto:${inq.email}?subject=${encodeURIComponent(`Re: your inquiry about ${inq.service}`)}`;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> All inquiries
      </Link>

      <div className="mt-4 rounded-2xl border border-navy-100 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-navy-100 p-6">
          <div>
            <h1 className="text-xl font-bold text-navy-900">{name}</h1>
            <p className="text-sm text-navy-500">
              {inq.company ? `${inq.company} · ` : ""}
              {dateTime(inq.createdAt)}
            </p>
          </div>
          <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-900">{inq.service}</span>
        </div>

        <dl className="grid gap-4 border-b border-navy-100 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-navy-400">Email</dt>
            <dd>
              <a href={`mailto:${inq.email}`} className="break-all font-medium text-navy-800 hover:text-navy-950 hover:underline underline-offset-4">
                {inq.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-navy-400">Phone</dt>
            <dd>
              {inq.phone ? (
                <a href={telHref(inq.phone)} className="font-medium text-navy-800 hover:text-navy-950 hover:underline underline-offset-4">
                  {inq.phone}
                </a>
              ) : (
                <span className="text-navy-400">Not provided</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="whitespace-pre-wrap p-6 leading-relaxed text-navy-700">{inq.message}</div>

        <div className="flex flex-wrap items-center gap-2 border-t border-navy-100 bg-navy-50/50 p-4">
          <a href={replyHref} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            <Mail className="h-4 w-4" /> Reply by email
          </a>
          {inq.phone && (
            <a href={telHref(inq.phone)} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50">
              <Phone className="h-4 w-4" /> Call
            </a>
          )}
          <form action={setInquiryStatus}>
            <input type="hidden" name="id" value={inq.id} />
            <input type="hidden" name="status" value={inq.status === "ARCHIVED" ? "READ" : "ARCHIVED"} />
            {inq.status === "ARCHIVED" ? (
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50">
                <Inbox className="h-4 w-4" /> Move to inbox
              </button>
            ) : (
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50">
                <Archive className="h-4 w-4" /> Archive
              </button>
            )}
          </form>
          <form action={setInquiryStatus}>
            <input type="hidden" name="id" value={inq.id} />
            <input type="hidden" name="status" value="NEW" />
            <button type="submit" className="px-3 py-2 text-sm font-medium text-navy-500 hover:text-navy-900">
              Mark as unread
            </button>
          </form>
          {user.role === "ADMIN" && (
            <form action={deleteInquiry} className="ml-auto">
              <input type="hidden" name="id" value={inq.id} />
              <ConfirmSubmit message="Delete this inquiry permanently?">
                <Trash2 className="h-4 w-4" /> Delete
              </ConfirmSubmit>
            </form>
          )}
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-navy-500">
        {inq.emailedAt ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-navy-900" /> Notification emailed {dateTime(inq.emailedAt)}
          </>
        ) : inq.emailError ? (
          <>
            <AlertTriangle className="h-4 w-4 text-navy-900" /> Notification email failed: {inq.emailError}
          </>
        ) : (
          "No notification email was sent."
        )}
      </p>
    </div>
  );
}
