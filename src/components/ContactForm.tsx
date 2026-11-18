"use client";

import { startTransition, useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { submitInquiry } from "@/app/(site)/contact/actions";
import { INQUIRY_SERVICES } from "@/lib/data";

const input =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15";

export default function ContactForm({
  renderedAt,
  defaultService = "",
  defaultMessage = "",
}: {
  renderedAt: number;
  defaultService?: string;
  defaultMessage?: string;
}) {
  const [state, dispatch, pending] = useActionState(submitInquiry, undefined);
  if (state?.ok) {
    return (
      <div role="status" className="rounded-2xl bg-navy-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-navy-900" />
        <h3 className="mt-4 text-xl font-semibold text-navy-900">Thank you. We’ve received your message.</h3>
        <p className="mt-2 text-navy-600">Our team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        // Submit without React's automatic reset, so fields are kept if validation fails.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => dispatch(fd));
      }}
      className="grid gap-5 sm:grid-cols-2"
    >
      {state?.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
        </p>
      )}
      <input type="hidden" name="t" value={renderedAt} />
      {/* Honeypot: hidden from people, tempting for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-700">First name</span>
        <input name="firstName" required maxLength={80} autoComplete="given-name" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-700">Last name</span>
        <input name="lastName" required maxLength={80} autoComplete="family-name" className={input} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-700">
          Company / Organization <span className="font-normal text-navy-400">(optional)</span>
        </span>
        <input name="company" maxLength={160} autoComplete="organization" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-700">Email</span>
        <input name="email" type="email" required maxLength={191} autoComplete="email" className={input} placeholder="you@company.com" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy-700">
          Phone <span className="font-normal text-navy-400">(optional)</span>
        </span>
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={input} placeholder="+255 …" />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-700">How can we help you?</span>
        <select name="service" required defaultValue={defaultService} className={input}>
          <option value="" disabled>
            Select an option
          </option>
          {INQUIRY_SERVICES.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-navy-700">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          defaultValue={defaultMessage}
          className={input}
          placeholder="Tell us about your project…"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-6 py-3.5 font-semibold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {pending ? "Sending…" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
