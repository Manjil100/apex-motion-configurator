"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/PageHeader";
import { getSupabase } from "@/lib/supabase/client";

type Mode = "login" | "register" | "recover" | "update";

const copy: Record<Mode, { title: string; lead: string; action: string; busy: string }> = {
  login: { title: "Sign in", lead: "Open your garage and pick up a build where you left it.", action: "Sign in", busy: "Signing in…" },
  register: {
    title: "Create account",
    lead: "Keep your builds in your account, on any device.",
    action: "Create account",
    busy: "Creating account…",
  },
  recover: {
    title: "Reset password",
    lead: "Enter your account email and we will send a reset link.",
    action: "Send reset link",
    busy: "Sending…",
  },
  update: { title: "Choose a new password", lead: "Use at least 8 characters.", action: "Save new password", busy: "Saving…" },
};

/** Turns Supabase Auth errors into plain instructions. */
function explain(message: string): string {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match an account. Check both, or reset your password.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first. Open the link we sent when you created the account.";
  if (/already registered|already been registered/i.test(message)) return "An account with this email already exists. Sign in instead, or reset your password.";
  if (/rate limit|too many/i.test(message)) return "Too many attempts in a short time. Wait a few minutes, then try again.";
  if (/same.*password|different from the old/i.test(message)) return "Choose a password different from your current one.";
  if (/session|jwt|expired/i.test(message)) return "This reset link has expired or was already used. Request a new one.";
  if (/fetch|network/i.test(message)) return "Could not reach the server. Check your connection and try again.";
  return message;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/garage";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(params.get("error") === "link" ? "That link has expired or was already used. Request a new one." : null);
  const [done, setDone] = useState<string | null>(null);
  const c = copy[mode];
  const supabase = getSupabase();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFailure(null);
    const found: Record<string, string> = {};
    if (mode === "register" && (name.trim().length < 1 || name.trim().length > 60)) found.name = "Enter your name (up to 60 characters).";
    if (mode !== "update" && !EMAIL.test(email.trim())) found.email = "Enter an email address like name@example.com.";
    if (mode !== "recover" && password.length < 8) found.password = "Use a password of at least 8 characters.";
    if (mode === "update" && confirm !== password) found.confirm = "The two passwords don't match.";
    setErrors(found);
    if (Object.keys(found).length || !supabase) return;

    setBusy(true);
    const origin = window.location.origin;
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.push(next);
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() }, emailRedirectTo: `${origin}/auth/callback?next=/garage` },
        });
        if (error) throw error;
        if (data.session) router.push("/garage");
        else setDone(`We sent a confirmation link to ${email.trim()}. Open it to finish creating your account.`);
      } else if (mode === "recover") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
        });
        if (error) throw error;
        setDone(`If ${email.trim()} has an account, a reset link is on its way. It works once.`);
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setDone("Password changed. You are signed in.");
        setTimeout(() => router.push("/garage"), 1200);
      }
    } catch (err) {
      setFailure(explain(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  };

  const error = (key: string) =>
    errors[key] && (
      <p id={`${key}-error`} className="mt-1.5 text-[0.875rem] text-flag">
        {errors[key]}
      </p>
    );
  const field = (key: string, label: string, value: string, set: (v: string) => void, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={key} className="mb-2 block text-[0.9375rem] text-chalk">
        {label}
      </label>
      <input
        id={key}
        className="field"
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        {...props}
      />
      {error(key)}
    </div>
  );

  return (
    <div className="shell grid min-h-[70dvh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="type-title">{c.title}</h1>
        <p className="mt-3 text-silver">{c.lead}</p>

        {!supabase ? (
          <div className="mt-8">
            <Notice title="Accounts are not set up on this copy of the site">
              This deployment has no Supabase settings, so sign-in is off. Builds you save are kept in this browser.
            </Notice>
          </div>
        ) : done ? (
          <div className="mt-8">
            <Notice title={mode === "register" ? "Check your email" : mode === "recover" ? "Check your email" : "Done"}>{done}</Notice>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            {mode === "register" && field("name", "Name", name, setName, { autoComplete: "name", maxLength: 60 })}
            {mode !== "update" && field("email", "Email", email, setEmail, { type: "email", autoComplete: "email" })}
            {mode !== "recover" && (
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <label htmlFor="password" className="text-[0.9375rem] text-chalk">
                    {mode === "update" ? "New password" : "Password"}
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
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {error("password")}
              </div>
            )}
            {mode === "update" && field("confirm", "Repeat new password", confirm, setConfirm, { type: "password", autoComplete: "new-password" })}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? c.busy : c.action}
            </Button>
            {failure && (
              <p role="alert" className="border-l-2 border-flag bg-slate px-4 py-3 text-[0.9375rem] text-chalk">
                {failure}
              </p>
            )}
          </form>
        )}

        {mode !== "update" && (
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
        )}
      </div>
    </div>
  );
}
