"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import type { FormState } from "@/app/admin/_actions/types";

/**
 * Runs a server action without React's automatic form reset, so fields keep
 * what the user typed when the server returns a validation error.
 */
export function useFormAction(fn: (state: FormState, fd: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(fn, undefined);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(fd));
  };
  return { state, onSubmit, pending };
}

export const inputCls =
  "w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-navy-400">{hint}</span>}
    </label>
  );
}

export function SubmitButton({
  children,
  name,
  value,
  variant = "primary",
  pending: pendingProp,
}: {
  children: React.ReactNode;
  name?: string;
  value?: string;
  variant?: "primary" | "secondary" | "mint" | "danger";
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  const styles = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    secondary: "bg-white text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50",
    mint: "bg-mint-500 text-navy-950 hover:bg-mint-400",
    danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
  };
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${styles[variant]}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state?.error && !state?.ok) return null;
  return state.error ? (
    <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
    </p>
  ) : (
    <div role="status" className="rounded-lg bg-navy-50 px-3.5 py-2.5 text-sm text-navy-900">
      <p className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {state.ok}
      </p>
      {state.secret && (
        <code className="mt-2 block select-all rounded bg-white px-3 py-2 font-mono text-base text-navy-900 ring-1 ring-navy-200">
          {state.secret}
        </code>
      )}
    </div>
  );
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");
  return json.url;
}

/** Uploads an image and stores its URL in a hidden input. */
export function ImageField({ name, label, defaultValue, hint }: { name: string; label: string; defaultValue?: string | null; hint?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setUrl(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-navy-200 bg-navy-50/60">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-contain p-2" />
          ) : (
            <ImagePlus className="h-6 w-6 text-navy-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {url ? "Replace image" : "Upload image"}
          </button>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="inline-flex items-center gap-1 text-xs text-navy-400 hover:text-red-600">
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onPick} />
      </div>
      {hint && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Button that asks for confirmation before submitting its form. */
export function ConfirmSubmit({ children, message }: { children: React.ReactNode; message: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
    >
      {children}
    </button>
  );
}
