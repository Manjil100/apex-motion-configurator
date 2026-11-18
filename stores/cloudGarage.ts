"use client";

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";
import { rowsToSelection, selectionToPayload, type OptionRow } from "@/lib/garage/mapping";
import type { Selection } from "@/lib/customisation/options";
import type { SavedBuild } from "./garage";

/**
 * Builds saved to the signed-in customer's account. Every call runs as that
 * customer, so Row Level Security decides what can be read or changed.
 */
interface CloudGarageState {
  userId: string | null;
  builds: SavedBuild[];
  loading: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  clear: () => void;
  save: (input: { name: string; vehicleSlug: string; selection: Selection }) => Promise<SavedBuild | null>;
  update: (id: string, selection: Selection) => Promise<boolean>;
  rename: (id: string, name: string) => Promise<boolean>;
  duplicate: (id: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

type Row = {
  id: string;
  name: string;
  vehicle_slug: string;
  created_at: string;
  updated_at: string;
  configuration_options: OptionRow[];
};

const toBuild = (r: Row): SavedBuild => ({
  id: r.id,
  name: r.name,
  vehicleSlug: r.vehicle_slug,
  selection: rowsToSelection(r.configuration_options ?? []),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const friendly = (message: string) =>
  /fetch|network/i.test(message)
    ? "Could not reach the server. Check your connection and try again."
    : `Your garage could not be updated: ${message}`;

export const useCloudGarage = create<CloudGarageState>((set, get) => {
  const run = async (action: () => PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await action();
    if (error) {
      set({ error: friendly(error.message) });
      return false;
    }
    const userId = get().userId;
    if (userId) await get().load(userId);
    return true;
  };

  const callSave = async (id: string | null, name: string, vehicleSlug: string, selection: Selection) => {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("save_configuration", {
      p_id: id,
      p_name: name.trim().slice(0, 60) || "Untitled build",
      p_vehicle_slug: vehicleSlug,
      p_selection: selectionToPayload(selection),
    });
    if (error) {
      set({ error: friendly(error.message) });
      return null;
    }
    return data as string;
  };

  return {
    userId: null,
    builds: [],
    loading: false,
    error: null,
    load: async (userId) => {
      const supabase = getSupabase();
      if (!supabase) return;
      // Only the first load for a user shows a loading state; refreshes after a change keep the list on screen.
      set({ userId, loading: get().userId !== userId, error: null });
      const { data, error } = await supabase
        .from("configurations")
        .select("id, name, vehicle_slug, created_at, updated_at, configuration_options(category_id, option_id)")
        .order("updated_at", { ascending: false });
      if (get().userId !== userId) return;
      if (error) set({ loading: false, error: friendly(error.message) });
      else set({ loading: false, builds: (data as Row[]).map(toBuild) });
    },
    clear: () => set({ userId: null, builds: [], loading: false, error: null }),
    save: async ({ name, vehicleSlug, selection }) => {
      const id = await callSave(null, name, vehicleSlug, selection);
      if (!id) return null;
      const userId = get().userId;
      if (userId) await get().load(userId);
      return get().builds.find((b) => b.id === id) ?? null;
    },
    update: async (id, selection) => {
      const build = get().builds.find((b) => b.id === id);
      if (!build) return false;
      const saved = await callSave(id, build.name, build.vehicleSlug, selection);
      const userId = get().userId;
      if (saved && userId) await get().load(userId);
      return Boolean(saved);
    },
    rename: (id, name) =>
      run(() => getSupabase()!.from("configurations").update({ name: name.trim().slice(0, 60) }).eq("id", id)),
    duplicate: async (id) => {
      const build = get().builds.find((b) => b.id === id);
      if (!build) return false;
      return Boolean(await get().save({ name: `${build.name} copy`.slice(0, 60), vehicleSlug: build.vehicleSlug, selection: build.selection }));
    },
    remove: (id) => run(() => getSupabase()!.from("configurations").delete().eq("id", id)),
  };
});
