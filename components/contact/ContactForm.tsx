"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/PageHeader";

type Fields = { name: string; email: string; subject: string; message: string };
const empty: Fields = { name: "", email: "", subject: "", message: "" };

export function validateContact(v: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (v.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errors.email = "Enter an email address like name@example.com.";
  if (v.subject.trim().length < 3) errors.subject = "Add a subject of at least 3 characters.";
  if (v.message.trim().length < 20) errors.message = "Write a message of at least 20 characters.";
  if (v.message.length > 2000) errors.message = "Keep your message under 2,000 characters.";
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [checked, setChecked] = useState(false);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setChecked(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    setChecked(Object.keys(found).length === 0);
  };

  const field = (key: keyof Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
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
        {field("name", "Name", { autoComplete: "name" })}
        {field("email", "Email", { type: "email", autoComplete: "email" })}
      </div>
      {field("subject", "Subject")}
      <div>
        <label htmlFor="message" className="mb-2 block text-[0.9375rem] text-chalk">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
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
      <Button type="submit" size="lg">
        Send message
      </Button>
      {checked && (
        <Notice title="Your message passed every check, but it has not been sent">
          Message delivery connects with the database in Phase 6. Until then nothing leaves this page and nothing is
          stored.
        </Notice>
      )}
    </form>
  );
}
