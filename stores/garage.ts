"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Selection } from "@/lib/customisation/options";

/**
 * Saved builds. Until accounts arrive (Phase 6) these live in this browser's
 * local storage only. The shape mirrors the planned `configurations` table so
 * the store can be swapped for Supabase without touching the pages.
 */
export interface SavedBuild {
  id: string;
  name: string;
  vehicleSlug: string;
  selection: Selection;
  createdAt: string;
  updatedAt: string;
}

interface GarageState {
  builds: SavedBuild[];
  save: (input: { name: string; vehicleSlug: string; selection: Selection }) => SavedBuild;
  update: (id: string, selection: Selection) => void;
  rename: (id: string, name: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useGarage = create<GarageState>()(
  persist(
    (set, get) => ({
      builds: [],
      save: ({ name, vehicleSlug, selection }) => {
        const now = new Date().toISOString();
        const build: SavedBuild = {
          id: newId(),
          name: name.trim().slice(0, 60) || "Untitled build",
          vehicleSlug,
          selection: structuredClone(selection),
          createdAt: now,
          updatedAt: now,
        };
        set({ builds: [build, ...get().builds] });
        return build;
      },
      update: (id, selection) =>
        set({
          builds: get().builds.map((b) =>
            b.id === id ? { ...b, selection: structuredClone(selection), updatedAt: new Date().toISOString() } : b,
          ),
        }),
      rename: (id, name) =>
        set({
          builds: get().builds.map((b) =>
            b.id === id ? { ...b, name: name.trim().slice(0, 60) || b.name, updatedAt: new Date().toISOString() } : b,
          ),
        }),
      duplicate: (id) => {
        const source = get().builds.find((b) => b.id === id);
        if (!source) return;
        const now = new Date().toISOString();
        set({
          builds: [
            { ...structuredClone(source), id: newId(), name: `${source.name} copy`.slice(0, 60), createdAt: now, updatedAt: now },
            ...get().builds,
          ],
        });
      },
      remove: (id) => set({ builds: get().builds.filter((b) => b.id !== id) }),
    }),
    { name: "apex-motion-garage", version: 1 },
  ),
);
