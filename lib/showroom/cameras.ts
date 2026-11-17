import type { CameraPreset, VehicleAsset } from "@/lib/vehicles/types";

export type ViewId = "threeQuarter" | "front" | "side" | "rear" | "interior";

/** Used when a vehicle's manifest does not set its own camera for a view. Metres, Y up, car nose towards +Z. */
export const DEFAULT_CAMERAS: Record<Exclude<ViewId, "interior">, CameraPreset> = {
  threeQuarter: { position: [5.4, 2.1, 6.4], target: [0, 0.6, 0] },
  front: { position: [0, 1.15, 8.2], target: [0, 0.6, 0] },
  side: { position: [8.2, 1.15, 0], target: [0, 0.6, 0] },
  rear: { position: [0, 1.15, -8.2], target: [0, 0.6, 0] },
};

export const ORBIT_LIMITS = {
  minDistance: 3.2,
  maxDistance: 20,
  /** Stops just above the floor so the camera never dips under it. */
  maxPolarAngle: Math.PI / 2 - 0.06,
  minPolarAngle: 0.25,
};

/** Returns the camera for a view, or null when the view is not available for this asset (interior needs a model that has one). */
export function resolveCamera(asset: VehicleAsset, view: ViewId): CameraPreset | null {
  const own = asset.cameras[view];
  if (own) return own;
  return view === "interior" ? null : DEFAULT_CAMERAS[view];
}

export function clampDistance(distance: number): number {
  return Math.min(ORBIT_LIMITS.maxDistance, Math.max(ORBIT_LIMITS.minDistance, distance));
}

/**
 * How much further back the camera must sit on a narrow viewport. The field of
 * view is vertical, so a portrait screen crops the sides unless we retreat.
 */
export function fitFactor(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) return 1;
  return aspect >= 1.5 ? 1 : Math.min(2.2, 1.5 / aspect);
}

/** Moves a preset's camera away from its target by `factor`, keeping the viewing direction. */
export function scalePreset(preset: CameraPreset, factor: number): CameraPreset {
  const [px, py, pz] = preset.position;
  const [tx, ty, tz] = preset.target;
  return { ...preset, position: [tx + (px - tx) * factor, ty + (py - ty) * factor, tz + (pz - tz) * factor] };
}
