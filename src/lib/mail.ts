import "server-only";
import nodemailer from "nodemailer";
import type { Inquiry } from "@prisma/client";
import { db } from "./db";
import { decryptSecret } from "./secrets";

export const SMTP_KEYS = ["smtp_host", "smtp_port", "smtp_secure", "smtp_user", "smtp_pass", "smtp_from", "notify_to"] as const;

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  hasPassword: boolean;
  from: string;
  notifyTo: string[];
};

async function rawSmtp() {
  const rows = await db.setting.findMany({ where: { key: { in: [...SMTP_KEYS] } } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<Record<(typeof SMTP_KEYS)[number], string>>;
}

/** SMTP settings without the password (safe to show in the admin). */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  const r = await rawSmtp();
  return {
    host: r.smtp_host ?? "",
    port: Number(r.smtp_port) || 587,
    secure: r.smtp_secure === "true",
    user: r.smtp_user ?? "",
    hasPassword: Boolean(r.smtp_pass),
    from: r.smtp_from ?? "",
    notifyTo: (r.notify_to ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  };
}

async function transport() {
  const r = await rawSmtp();
  if (!r.smtp_host || !r.smtp_from) throw new Error("Email is not configured. Add SMTP settings under Site settings.");
  const pass = r.smtp_pass ? decryptSecret(r.smtp_pass) : undefined;
  return {
    from: r.smtp_from,
    notifyTo: (r.notify_to ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    tx: nodemailer.createTransport({
      host: r.smtp_host,
      port: Number(r.smtp_port) || 587,
      secure: r.smtp_secure === "true", // true for 465, false for 587 (STARTTLS)
      auth: r.smtp_user ? { user: r.smtp_user, pass } : undefined,
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }),
  };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
// Strip CR/LF so user input can never inject extra email headers.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function sendInquiryNotification(inq: Inquiry, adminUrl: string) {
  const { tx, from, notifyTo } = await transport();
  if (notifyTo.length === 0) throw new Error("No notification recipient set.");

  const name = oneLine(`${inq.firstName} ${inq.lastName}`);
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", inq.email],
    ["Phone", inq.phone ?? "—"],
    ["Organization", inq.company ?? "—"],
    ["Interested in", inq.service],
  ];

  await tx.sendMail({
    from,
    to: notifyTo,
    replyTo: { name, address: inq.email },
    subject: oneLine(`New website inquiry: ${inq.service} — ${inq.company || name}`).slice(0, 200),
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${inq.message}\n\nView in admin: ${adminUrl}`,
    html: `<div style="font-family:Arial,sans-serif;color:#1a1c45;max-width:600px">
      <h2 style="margin:0 0 16px">New inquiry from the website</h2>
      <table style="border-collapse:collapse;width:100%">${rows
        .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#52566f;white-space:nowrap">${k}</td><td style="padding:6px 0"><strong>${esc(v)}</strong></td></tr>`)
        .join("")}</table>
      <div style="margin:20px 0;padding:16px;background:#f2f3fa;border-radius:8px;white-space:pre-wrap">${esc(inq.message)}</div>
      <p><a href="${esc(adminUrl)}" style="color:#00826c">Open in the admin portal</a> · Reply to this email to answer ${esc(name)} directly.</p>
    </div>`,
  });
}

export async function sendTestEmail(to: string) {
  const { tx, from } = await transport();
  await tx.verify();
  await tx.sendMail({
    from,
    to,
    subject: "Britech website — test email",
    text: "Your SMTP settings work. Contact-form notifications will be delivered to this mailbox.",
  });
}
