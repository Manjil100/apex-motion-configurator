"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/PageHeader";

type Mode = "login" | "register" | "recover";

const copy: Record<Mode, { title: string; lead: string; action: string }> = {
  login: { title: "Sign in", lead: "Open your garage and pick up a build where you left it.", action: "Sign in" },
  register: {
    title: "Create account",
    lead: "Keep your builds across devices and publish them to the gallery.",
    action: "Create account",
  },
  recover: {
    title: "Reset password",
    lead: "Enter your account email and we will send a reset link.",
    action: "Send reset link",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const c = copy[mode];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (mode === "register" && name.trim().length < 2) found.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) found.email = "Enter an email address like name@example.com.";
    if (mode !== "recover" && password.length < 8) found.password = "Use a password of at least 8 characters.";
    setErrors(found);
    setChecked(Object.keys(found).length === 0);
  };

  const error = (key: string) =>
    errors[key] && (
      <p id={`${key}-error`} className="mt-1.5 text-[0.875rem] text-flag">
        {errors[key]}
      </p>
    );

  return (
    <div className="shell grid min-h-[70dvh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="type-title">{c.title}</h1>
        <p className="mt-3 text-silver">{c.lead}</p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="mb-2 block text-[0.9375rem] text-chalk">
                Name
              </label>
              <input
                id="name"
                className="field"
                autoComplete="name"
                value={name}
                onChange={(e) => (setName(e.target.value), setChecked(false))}
                aria-invalid={Boolean(errors.name)}
              />
              {error("name")}
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-2 block text-[0.9375rem] text-chalk">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field"
              autoComplete="email"
              value={email}
              onChange={(e) => (setEmail(e.target.value), setChecked(false))}
              aria-invalid={Boolean(errors.email)}
            />
            {error("email")}
          </div>
          {mode !== "recover" && (
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="password" className="text-[0.9375rem] text-chalk">
                  Password
                </label>
                {mode === "login" && (
                  <Link href="/auth/recover" className="text-[0.875rem] text-steel underline-offset-4 hover:text-chalk hover:underline">
                    Forgot password
                  </Link>
                )}
              </div>
              <input
                id="password"
                type="password"
                className="field"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => (setPassword(e.target.value), setChecked(false))}
                aria-invalid={Boolean(errors.password)}
              />
              {error("password")}
            </div>
          )}
          <Button type="submit" size="lg" className="w-full">
            {c.action}
          </Button>
        </form>

        {checked && (
          <div className="mt-6">
            <Notice title="Accounts are not open yet">
              Sign-in arrives with Supabase Authentication in Phase 6. Your details were checked on this page only and
              were not sent or stored. Builds you save today are kept in this browser.
            </Notice>
          </div>
        )}

        <p className="mt-8 text-[0.9375rem] text-steel">
          {mode === "login" ? (
            <>
              New to APEX MOTION?{" "}
              <Link href="/auth/register" className="text-chalk underline decoration-volt underline-offset-4">
                Create account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-chalk underline decoration-volt underline-offset-4">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
