"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

interface SessionState {
  /** False until the first auth check finishes, so pages do not flash the wrong state. */
  ready: boolean;
  user: User | null;
  start: () => () => void;
  signOut: () => Promise<void>;
}

export const useSession = create<SessionState>((set) => ({
  ready: false,
  user: null,
  start: () => {
    const supabase = getSupabase();
    if (!supabase) {
      set({ ready: true, user: null });
      return () => {};
    }
    void supabase.auth.getSession().then(({ data }) => set({ ready: true, user: data.session?.user ?? null }));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => set({ ready: true, user: session?.user ?? null }));
    return () => data.subscription.unsubscribe();
  },
  signOut: async () => {
    await getSupabase()?.auth.signOut();
    set({ user: null });
  },
}));

export const displayName = (user: User | null) =>
  (user?.user_metadata?.display_name as string | undefined)?.trim() || user?.email?.split("@")[0] || "";
