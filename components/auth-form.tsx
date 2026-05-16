"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions";

const initialState: ActionState = { status: "idle" };

export function AuthForm(props: {
  title: string;
  subtitle: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Array<{ name: string; label: string; type?: string; autoComplete?: string }>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(props.action, initialState);

  return (
    <div className="auth-card">
      <div className="stack">
        <div>
          <div className="eyebrow">Check In Control</div>
          <h1 className="section-title">{props.title}</h1>
          <p className="meta">{props.subtitle}</p>
        </div>
        <form action={formAction}>
          {props.fields.map((field) => (
            <label key={field.name} className="field">
              <span className="label">{field.label}</span>
              <input
                className="input"
                name={field.name}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                required
              />
            </label>
          ))}
          {state.status === "error" ? <div className="message error">{state.message}</div> : null}
          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "提交中..." : props.submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
