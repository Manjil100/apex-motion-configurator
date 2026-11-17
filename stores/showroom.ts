"use client";

import { create } from "zustand";
import type { ViewId } from "@/lib/showroom/cameras";
import type { QualityTier } from "@/lib/showroom/quality";

export type ShowroomCommand =
  | { type: "view"; view: ViewId }
  | { type: "reset" }
  | { type: "zoom"; factor: number };

interface ShowroomState {
  tier: QualityTier;
  setTier: (tier: QualityTier) => void;
  /** Latest camera command. `id` changes on every send so repeats still fire. */
  command: (ShowroomCommand & { id: number }) | null;
  send: (command: ShowroomCommand) => void;
  activeView: ViewId | null;
  setActiveView: (view: ViewId | null) => void;
  canvas: HTMLCanvasElement | null;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
}

export const useShowroom = create<ShowroomState>((set, get) => ({
  tier: "medium",
  setTier: (tier) => set({ tier }),
  command: null,
  send: (command) => set({ command: { ...command, id: (get().command?.id ?? 0) + 1 } }),
  activeView: "threeQuarter",
  setActiveView: (activeView) => set({ activeView }),
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
}));
