"use client";

import { login } from "@/app/admin/_actions/auth";
import { Field, FormMessage, SubmitButton, inputCls, useFormAction } from "./fields";

export default function LoginForm() {
  const { state, onSubmit: action, pending: actionPending } = useFormAction(login);
  return (
    <form onSubmit={action} className="mt-6 space-y-4">
      <FormMessage state={state} />
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required className={inputCls} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </Field>
      <div className="pt-2 [&>button]:w-full">
        <SubmitButton pending={actionPending}>Sign in</SubmitButton>
      </div>
    </form>
  );
}
