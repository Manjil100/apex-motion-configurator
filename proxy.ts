import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Keeps the Supabase session cookie fresh on page requests. Requests without a
 * session cookie pass straight through, so visitors pay nothing for it.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!isSupabaseConfigured || !request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return response;

  let next = response;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        next = NextResponse.next({ request });
        for (const { name, value, options } of list) next.cookies.set(name, value, options);
      },
    },
  });
  try {
    await supabase.auth.getClaims();
  } catch {
    // If Supabase cannot be reached, serve the page anyway; the browser client retries.
  }
  return next;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fixtures/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf)$).*)"],
};
