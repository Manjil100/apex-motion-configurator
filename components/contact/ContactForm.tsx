"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/PageHeader";
import { validateContact, type ContactErrors, type ContactFields } from "@/lib/validation/contact";
import { sendEnquiry } from "@/app/contact/actions";

const empty: ContactFields = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<ContactFields>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const set = (key: keyof ContactFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFailure(null);
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const result = await sendEnquiry(new FormData(e.currentTarget));
      if (result.ok) {
        setSent(true);
        setValues(empty);
      } else {
        setErrors(result.errors ?? {});
        setFailure(result.message ?? null);
      }
    } catch {
      setFailure("Your message was not sent. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <Notice title="Message sent">Thanks. We have your message and will reply to the email address you gave.</Notice>
        <Button variant="secondary" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  const field = (key: keyof ContactFields, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={key} className="mb-2 block text-[0.9375rem] text-chalk">
        {label}
      </label>
      <input
        id={key}
        name={key}
        value={values[key]}
        onChange={set(key)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        className="field"
        {...props}
      />
      {errors[key] && (
        <p id={`${key}-error`} className="mt-1.5 text-[0.875rem] text-flag">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Name", { autoComplete: "name", maxLength: 80 })}
        {field("email", "Email", { type: "email", autoComplete: "email", maxLength: 254 })}
      </div>
      {field("subject", "Subject", { maxLength: 120 })}
      <div>
        <label htmlFor="message" className="mb-2 block text-[0.9375rem] text-chalk">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={2000}
          value={values.message}
          onChange={set("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="field resize-y"
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-[0.875rem] text-flag">
            {errors.message}
          </p>
        )}
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </Button>
      {failure && (
        <p role="alert" className="border-l-2 border-flag bg-slate px-4 py-3 text-[0.9375rem] text-chalk">
          {failure}
        </p>
      )}
    </form>
  );
}
