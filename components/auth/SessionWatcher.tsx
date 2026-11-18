"use client";

import { useEffect } from "react";
import { useSession } from "@/stores/session";

/** Mounted once in the root layout: keeps the session store in step with Supabase Auth. */
export function SessionWatcher() {
  const start = useSession((s) => s.start);
  useEffect(() => start(), [start]);
  return null;
}
