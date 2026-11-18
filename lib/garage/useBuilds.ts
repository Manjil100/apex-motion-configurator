"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Selection } from "@/lib/customisation/options";
import { useGarage, type SavedBuild } from "@/stores/garage";
import { useCloudGarage } from "@/stores/cloudGarage";
import { useSession } from "@/stores/session";

export interface Builds {
  /** "account" when signed in, "device" otherwise. */
  where: "account" | "device";
  ready: boolean;
  builds: SavedBuild[];
  error: string | null;
  save: (input: { name: string; vehicleSlug: string; selection: Selection }) => Promise<SavedBuild | null>;
  update: (id: string, selection: Selection) => Promise<boolean>;
  rename: (id: string, name: string) => Promise<boolean>;
  duplicate: (id: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

const subscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

/** One garage API for pages: the customer's account when signed in, this browser otherwise. */
export function useBuilds(): Builds {
  const hydrated = useHydrated();
  const { ready: sessionReady, user } = useSession();
  const local = useGarage();
  const cloud = useCloudGarage();

  useEffect(() => {
    if (!sessionReady) return;
    if (user) {
      if (useCloudGarage.getState().userId !== user.id) void useCloudGarage.getState().load(user.id);
    } else if (useCloudGarage.getState().userId) {
      useCloudGarage.getState().clear();
    }
  }, [sessionReady, user]);

  if (user) {
    return {
      where: "account",
      ready: hydrated && sessionReady && cloud.userId === user.id && !cloud.loading,
      builds: cloud.builds,
      error: cloud.error,
      save: cloud.save,
      update: cloud.update,
      rename: cloud.rename,
      duplicate: cloud.duplicate,
      remove: cloud.remove,
    };
  }
  return {
    where: "device",
    ready: hydrated && sessionReady,
    builds: local.builds,
    error: null,
    save: async (input) => local.save(input),
    update: async (id, selection) => (local.update(id, selection), true),
    rename: async (id, name) => (local.rename(id, name), true),
    duplicate: async (id) => (local.duplicate(id), true),
    remove: async (id) => (local.remove(id), true),
  };
}
