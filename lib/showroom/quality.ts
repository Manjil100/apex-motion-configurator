/**
 * Adaptive rendering quality. A device starts on a tier chosen from what the
 * browser reports, and the showroom steps down a tier if the frame rate sags.
 */
export type QualityTier = "high" | "medium" | "low";

export interface QualitySettings {
  /** Device-pixel-ratio range handed to the renderer. */
  dpr: [number, number];
  shadows: boolean;
  /** Reflective floor render-target size. 0 switches the reflection off. */
  reflectorResolution: number;
  reflectorBlur: number;
  /** Resolution of the generated environment map. */
  environmentResolution: number;
  contactShadowResolution: number;
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  high: { dpr: [1, 2], shadows: true, reflectorResolution: 1024, reflectorBlur: 400, environmentResolution: 256, contactShadowResolution: 1024 },
  medium: { dpr: [1, 1.5], shadows: true, reflectorResolution: 512, reflectorBlur: 300, environmentResolution: 128, contactShadowResolution: 512 },
  low: { dpr: [0.75, 1], shadows: false, reflectorResolution: 0, reflectorBlur: 0, environmentResolution: 64, contactShadowResolution: 256 },
};

export interface DeviceHints {
  cores?: number;
  memoryGb?: number;
  coarsePointer?: boolean;
  narrow?: boolean;
  saveData?: boolean;
}

export function pickTier(h: DeviceHints): QualityTier {
  if (h.saveData) return "low";
  if ((h.memoryGb !== undefined && h.memoryGb <= 2) || (h.cores !== undefined && h.cores <= 2)) return "low";
  const mobile = Boolean(h.coarsePointer && h.narrow);
  if (mobile) return (h.memoryGb ?? 4) >= 6 && (h.cores ?? 4) >= 8 ? "medium" : "low";
  if ((h.memoryGb !== undefined && h.memoryGb <= 4) || (h.cores !== undefined && h.cores <= 4)) return "medium";
  return "high";
}

export function lowerTier(tier: QualityTier): QualityTier {
  return tier === "high" ? "medium" : "low";
}

/** Reads hints from the browser. Call on the client only. */
export function detectTier(): QualityTier {
  if (typeof window === "undefined") return "medium";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return pickTier({
    cores: nav.hardwareConcurrency,
    memoryGb: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    narrow: window.innerWidth < 820,
    saveData: nav.connection?.saveData,
  });
}

export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
