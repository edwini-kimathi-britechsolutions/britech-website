"use client";

import { useState } from "react";
import type { Partner, Post, Project, Role, Testimonial, User } from "@prisma/client";
import { savePost } from "@/app/admin/_actions/posts";
import { savePartner, saveProject, saveSettings, saveTestimonial } from "@/app/admin/_actions/content";
import { createUser, resetUserPassword, updateUser } from "@/app/admin/_actions/users";
import { changePassword, updateProfile } from "@/app/admin/_actions/auth";
import { saveSmtp, sendSmtpTest } from "@/app/admin/_actions/inquiries";
import { Field, FormMessage, ImageField, SubmitButton, inputCls, useFormAction } from "./fields";
import RichEditor from "./RichEditor";
import { slugify } from "@/lib/utils";

export const POST_CATEGORIES = ["News", "Insights", "Cybersecurity", "Data & BI", "Software", "AI", "Events", "Case Study"];

/* -------------------------------- posts -------------------------------- */

export function PostForm({ post, canPublish }: { post?: Post | null; canPublish: boolean }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(savePost);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));

  return (
    <form onSubmit={action} className="grid gap-6 lg:grid-cols-3">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="space-y-5 lg:col-span-2">
        <FormMessage state={state} />
        <Field label="Title">
          <input
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={`${inputCls} text-lg font-semibold`}
            placeholder="A clear, specific headline"
          />
        </Field>
        <Field label="Summary" hint="Shown on the blog list and in search results (max 400 characters).">
          <textarea name="excerpt" required maxLength={400} rows={3} defaultValue={post?.excerpt} className={inputCls} />
        </Field>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-navy-800">Article</span>
          <RichEditor name="content" defaultValue={post?.content} />
        </div>
      </div>

      <aside className="space-y-5">
        <div className="space-y-3 rounded-xl border border-navy-100 bg-white p-5">
          <p className="text-sm font-semibold text-navy-900">Publish</p>
          <p className="text-xs text-navy-500">
            Status: <strong className="text-navy-800">{post?.status.toLowerCase() ?? "new"}</strong>
            {!canPublish && " · An editor reviews and publishes your posts."}
          </p>
          <div className="flex flex-col gap-2">
            {canPublish ? (
              <SubmitButton name="intent" value="publish" variant="brand" pending={actionPending}>
                {post?.status === "PUBLISHED" ? "Update published post" : "Publish"}
              </SubmitButton>
            ) : (
              <SubmitButton name="intent" value="review" variant="brand" pending={actionPending}>
                Submit for review
              </SubmitButton>
            )}
            <SubmitButton name="intent" value="draft" variant="secondary" pending={actionPending}>
              {post?.status === "PUBLISHED" ? "Unpublish (save as draft)" : "Save draft"}
            </SubmitButton>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-navy-100 bg-white p-5">
          <ImageField name="coverImage" label="Cover image" defaultValue={post?.coverImage} hint="Landscape, at least 1200px wide." />
          <Field label="Category">
            <select name="category" defaultValue={post?.category ?? "News"} className={inputCls}>
              {POST_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Tags" hint="Comma separated, e.g. ERP, Tanzania">
            <input name="tags" defaultValue={post?.tags} maxLength={300} className={inputCls} />
          </Field>
          <Field label="Web address" hint={`/blog/${slug || "…"}`}>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className={inputCls}
            />
          </Field>
          {canPublish && (
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" name="featured" defaultChecked={post?.featured} className="h-4 w-4 accent-brand-600" />
              Feature at the top of the blog
            </label>
          )}
        </div>
      </aside>
    </form>
  );
}

/* ------------------------------- projects ------------------------------- */

export function ProjectForm({ project }: { project?: Project | null }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(saveProject);
  return (
    <form onSubmit={action} className="max-w-3xl space-y-5 rounded-xl border border-navy-100 bg-white p-6">
      {project && <input type="hidden" name="id" value={project.id} />}
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Project name">
          <input name="name" required defaultValue={project?.name} className={inputCls} />
        </Field>
        <Field label="Client" hint="Optional. Leave empty for Britech’s own platforms.">
          <input name="client" defaultValue={project?.client ?? ""} className={inputCls} />
        </Field>
      </div>
      <Field label="Tagline">
        <input name="tagline" required defaultValue={project?.tagline} className={inputCls} placeholder="e.g. Poultry health monitoring system" />
      </Field>
      <Field label="Description">
        <textarea name="description" required rows={5} defaultValue={project?.description} className={inputCls} />
      </Field>
      <Field label="Highlights" hint="One per line (features, outcomes).">
        <textarea name="highlights" rows={4} defaultValue={project?.highlights} className={inputCls} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Website">
          <input name="url" defaultValue={project?.url ?? ""} className={inputCls} placeholder="https://" />
        </Field>
        <Field label="Sector">
          <input name="sector" defaultValue={project?.sector ?? ""} className={inputCls} placeholder="e.g. Agriculture" />
        </Field>
      </div>
      <ImageField name="logo" label="Logo" defaultValue={project?.logo} hint="PNG with transparent background works best." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display order" hint="Lower numbers show first.">
          <input name="sortOrder" type="number" min={0} max={999} defaultValue={project?.sortOrder ?? 0} className={inputCls} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-navy-700">
          <input type="checkbox" name="published" defaultChecked={project?.published ?? true} className="h-4 w-4 accent-brand-600" />
          Show on website
        </label>
      </div>
      <label className="flex items-start gap-2 rounded-lg bg-navy-50/70 p-3 text-sm text-navy-700">
        <input type="checkbox" name="isProduct" defaultChecked={project?.isProduct ?? false} className="mt-0.5 h-4 w-4 accent-brand-600" />
        <span>
          <span className="font-medium text-navy-900">Show as a Britech product</span>
          <span className="block text-xs text-navy-500">Lists it on the Products page and the home page product tabs instead of Our Work. Leave off for client work.</span>
        </span>
      </label>
      <SubmitButton pending={actionPending}>Save project</SubmitButton>
    </form>
  );
}

/* ------------------------------- partners ------------------------------- */

export function PartnerForm({ partner }: { partner?: Partner | null }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(savePartner);
  return (
    <form onSubmit={action} className="max-w-2xl space-y-5 rounded-xl border border-navy-100 bg-white p-6">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <FormMessage state={state} />
      <Field label="Organization name">
        <input name="name" required defaultValue={partner?.name} className={inputCls} />
      </Field>
      <ImageField name="logo" label="Logo" defaultValue={partner?.logo} hint="PNG with transparent background works best." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Relationship">
          <select name="kind" defaultValue={partner?.kind ?? "PARTNER"} className={inputCls}>
            <option value="PARTNER">Partner</option>
            <option value="CLIENT">Client</option>
            <option value="BOTH">Client & partner</option>
          </select>
        </Field>
        <Field label="Website" hint="Optional">
          <input name="url" defaultValue={partner?.url ?? ""} className={inputCls} placeholder="https://" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display order">
          <input name="sortOrder" type="number" min={0} max={999} defaultValue={partner?.sortOrder ?? 0} className={inputCls} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-navy-700">
          <input type="checkbox" name="active" defaultChecked={partner?.active ?? true} className="h-4 w-4 accent-brand-600" />
          Show on website
        </label>
      </div>
      <SubmitButton pending={actionPending}>Save</SubmitButton>
    </form>
  );
}

/* ------------------------------- settings ------------------------------- */

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(saveSettings);
  const contact = [
    ["phone1", "Main phone"],
    ["phone2", "Second phone"],
    ["email", "Email"],
    ["address", "Address"],
    ["whatsapp", "WhatsApp number (shows a chat button)"],
  ];
  const social = [
    ["linkedin", "LinkedIn"],
    ["twitter", "X (Twitter)"],
    ["facebook", "Facebook"],
    ["instagram", "Instagram"],
    ["youtube", "YouTube"],
  ];
  return (
    <form onSubmit={action} className="max-w-3xl space-y-6">
      <FormMessage state={state} />
      <section className="rounded-xl border border-navy-100 bg-white p-6">
        <h2 className="font-semibold text-navy-900">Contact details</h2>
        <p className="text-sm text-navy-500">Shown in the header, footer, contact page and call-to-action sections.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {contact.map(([k, l]) => (
            <Field key={k} label={l}>
              <input name={k} defaultValue={values[k]} className={inputCls} />
            </Field>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-navy-100 bg-white p-6">
        <h2 className="font-semibold text-navy-900">Social media</h2>
        <p className="text-sm text-navy-500">Full links (https://…). Leave empty to hide the icon.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {social.map(([k, l]) => (
            <Field key={k} label={l}>
              <input name={k} defaultValue={values[k]} className={inputCls} placeholder="https://" />
            </Field>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-navy-100 bg-white p-6">
        <h2 className="font-semibold text-navy-900">Announcement bar</h2>
        <p className="text-sm text-navy-500">The thin bar above the menu. Leave the text empty to hide it.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Text">
            <input name="announcement_text" defaultValue={values.announcement_text} maxLength={140} className={inputCls} />
          </Field>
          <Field label="Link" hint="A page like /products#njiwa or a full https:// address">
            <input name="announcement_link" defaultValue={values.announcement_link} className={inputCls} />
          </Field>
        </div>
      </section>
      <SubmitButton pending={actionPending}>Save settings</SubmitButton>
    </form>
  );
}

/* --------------------------------- users -------------------------------- */

export function CreateUserForm() {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(createUser);
  return (
    <form onSubmit={action} className="space-y-4 rounded-xl border border-navy-100 bg-white p-6">
      <h2 className="font-semibold text-navy-900">Add a team member</h2>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name">
          <input name="name" required className={inputCls} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputCls} />
        </Field>
        <Field label="Role">
          <select name="role" defaultValue="AUTHOR" className={inputCls}>
            <option value="AUTHOR">Author: writes own posts</option>
            <option value="EDITOR">Editor: publishes & manages content</option>
            <option value="ADMIN">Admin: full access</option>
          </select>
        </Field>
      </div>
      <SubmitButton pending={actionPending}>Create account</SubmitButton>
    </form>
  );
}

export function UserRow({ user, isMe }: { user: Pick<User, "id" | "name" | "email" | "role" | "active">; isMe: boolean }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(updateUser);
  const { state: resetState, onSubmit: resetAction, pending: resetActionPending } = useFormAction(resetUserPassword);
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy-900">
            {user.name} {isMe && <span className="text-xs font-normal text-navy-400">(you)</span>}
          </p>
          <p className="truncate text-sm text-navy-500">{user.email}</p>
        </div>
        <form onSubmit={action} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={user.id} />
          <select name="role" defaultValue={user.role} disabled={isMe} className={`${inputCls} w-auto py-2`}>
            {(["AUTHOR", "EDITOR", "ADMIN"] as Role[]).map((r) => (
              <option key={r} value={r}>
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {isMe && <input type="hidden" name="role" value={user.role} />}
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" name="active" defaultChecked={user.active} disabled={isMe} className="h-4 w-4 accent-brand-600" />
            Active
          </label>
          {isMe && <input type="hidden" name="active" value="on" />}
          {!isMe && <SubmitButton variant="secondary" pending={actionPending}>Save</SubmitButton>}
        </form>
        {!isMe && (
          <form
            onSubmit={(e) => {
              if (!window.confirm(`Reset the password for ${user.email}? They will be signed out.`)) return e.preventDefault();
              resetAction(e);
            }}
          >
            <input type="hidden" name="id" value={user.id} />
            <SubmitButton variant="danger" pending={resetActionPending}>
              Reset password
            </SubmitButton>
          </form>
        )}
      </div>
      {(state || resetState) && (
        <div className="mt-3 space-y-2">
          <FormMessage state={state} />
          <FormMessage state={resetState} />
        </div>
      )}
    </div>
  );
}

/* -------------------------------- account ------------------------------- */

export function ProfileForm({ name }: { name: string }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(updateProfile);
  return (
    <form onSubmit={action} className="space-y-4 rounded-xl border border-navy-100 bg-white p-6">
      <h2 className="font-semibold text-navy-900">Profile</h2>
      <FormMessage state={state} />
      <Field label="Display name" hint="Shown as the author on your blog posts.">
        <input name="name" required defaultValue={name} className={inputCls} />
      </Field>
      <SubmitButton pending={actionPending}>Save</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(changePassword);
  return (
    <form onSubmit={action} className="space-y-4 rounded-xl border border-navy-100 bg-white p-6">
      <h2 className="font-semibold text-navy-900">Change password</h2>
      <FormMessage state={state} />
      <Field label="Current password">
        <input name="current" type="password" autoComplete="current-password" required className={inputCls} />
      </Field>
      <Field label="New password" hint="At least 10 characters, with letters and numbers.">
        <input name="next" type="password" autoComplete="new-password" required minLength={10} className={inputCls} />
      </Field>
      <Field label="Confirm new password">
        <input name="confirm" type="password" autoComplete="new-password" required minLength={10} className={inputCls} />
      </Field>
      <SubmitButton pending={actionPending}>Change password</SubmitButton>
    </form>
  );
}

/* --------------------------------- email -------------------------------- */

export type SmtpView = { host: string; port: number; secure: boolean; user: string; hasPassword: boolean; from: string; notifyTo: string[] };

export function SmtpForm({ config }: { config: SmtpView }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(saveSmtp);
  const [secure, setSecure] = useState(config.secure ? "true" : "false");
  const [port, setPort] = useState(String(config.port));
  return (
    <form onSubmit={action} className="space-y-5 rounded-xl border border-navy-100 bg-white p-6">
      <div>
        <h2 className="font-semibold text-navy-900">Email notifications (SMTP)</h2>
        <p className="text-sm text-navy-500">Used to email the team when someone sends the contact form.</p>
      </div>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Field label="SMTP host" hint="e.g. smtp.gmail.com, mail.britechsolutions.co.tz">
            <input name="smtp_host" defaultValue={config.host} className={inputCls} autoComplete="off" />
          </Field>
        </div>
        <Field label="Port">
          <input
            name="smtp_port"
            type="number"
            min={1}
            max={65535}
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Security">
        <select
          name="smtp_secure"
          value={secure}
          onChange={(e) => {
            setSecure(e.target.value);
            setPort(e.target.value === "true" ? "465" : "587");
          }}
          className={inputCls}
        >
          <option value="false">STARTTLS (usually port 587)</option>
          <option value="true">SSL/TLS (usually port 465)</option>
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Username">
          <input name="smtp_user" defaultValue={config.user} className={inputCls} autoComplete="off" />
        </Field>
        <Field label="Password" hint={config.hasPassword ? "A password is saved. Leave blank to keep it." : "Stored encrypted."}>
          <input name="smtp_pass" type="password" className={inputCls} autoComplete="new-password" placeholder={config.hasPassword ? "••••••••" : ""} />
        </Field>
      </div>
      {config.hasPassword && (
        <label className="flex items-center gap-2 text-sm text-navy-600">
          <input type="checkbox" name="smtp_pass_clear" className="h-4 w-4 accent-brand-600" /> Remove the saved password
        </label>
      )}
      <Field label="From address" hint='Shown as the sender, e.g. "Britech Website <noreply@britechsolutions.co.tz>"'>
        <input name="smtp_from" defaultValue={config.from} className={inputCls} />
      </Field>
      <Field label="Send notifications to" hint="One or more emails, separated by commas.">
        <input name="notify_to" defaultValue={config.notifyTo.join(", ")} className={inputCls} placeholder="info@britechsolutions.co.tz" />
      </Field>
      <SubmitButton pending={actionPending}>Save email settings</SubmitButton>
    </form>
  );
}

export function TestEmailForm({ defaultTo }: { defaultTo: string }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(sendSmtpTest);
  return (
    <form onSubmit={action} className="space-y-3 rounded-xl border border-navy-100 bg-white p-6">
      <h3 className="font-semibold text-navy-900">Send a test email</h3>
      <FormMessage state={state} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input name="to" type="email" defaultValue={defaultTo} className={inputCls} />
        <SubmitButton variant="secondary" pending={actionPending}>
          Send test
        </SubmitButton>
      </div>
    </form>
  );
}

/* ------------------------------ testimonials ----------------------------- */

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial | null }) {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(saveTestimonial);
  return (
    <form onSubmit={action} className="max-w-2xl space-y-5 rounded-xl border border-navy-100 bg-white p-6">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <p className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
        Only publish real quotes, with the person’s permission.
      </p>
      <FormMessage state={state} />
      <Field label="Quote" hint="Their words, 1–3 sentences. Max 600 characters.">
        <textarea name="quote" required rows={4} maxLength={600} defaultValue={testimonial?.quote} className={inputCls} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required defaultValue={testimonial?.name} className={inputCls} />
        </Field>
        <Field label="Role / title">
          <input name="role" defaultValue={testimonial?.role ?? ""} className={inputCls} placeholder="e.g. Programme Manager" />
        </Field>
      </div>
      <Field label="Organization">
        <input name="organization" defaultValue={testimonial?.organization ?? ""} className={inputCls} />
      </Field>
      <ImageField name="photo" label="Photo (optional)" defaultValue={testimonial?.photo} hint="Square headshot works best." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display order">
          <input name="sortOrder" type="number" min={0} max={999} defaultValue={testimonial?.sortOrder ?? 0} className={inputCls} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-navy-700">
          <input type="checkbox" name="active" defaultChecked={testimonial?.active ?? true} className="h-4 w-4 accent-brand-600" />
          Show on website
        </label>
      </div>
      <SubmitButton pending={actionPending}>Save testimonial</SubmitButton>
    </form>
  );
}
