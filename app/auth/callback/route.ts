import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Landing point for links in Supabase emails (confirm account, reset password).
 * Swaps the one-time code for a session cookie, then sends the user on.
 * `next` must be a path on this site, so the link cannot redirect elsewhere.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/garage";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/garage";

  const supabase = await createServerSupabase();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  const failed = next === "/auth/update-password" ? "/auth/recover" : "/auth/login";
  return NextResponse.redirect(new URL(`${failed}?error=link`, url.origin));
}
