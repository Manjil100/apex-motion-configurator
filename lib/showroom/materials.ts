import type { Option } from "@/lib/customisation/options";

/** Physical material settings for a paint finish. Used on the sample form now and on `car_body` once a model exists. */
export interface PaintProps {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

const FINISH: Record<NonNullable<Option["finish"]>, Omit<PaintProps, "color">> = {
  gloss: { metalness: 0.1, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.04 },
  metallic: { metalness: 0.85, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 },
  pearl: { metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.03 },
  matte: { metalness: 0.15, roughness: 0.82, clearcoat: 0, clearcoatRoughness: 0.6 },
};

export function paintProps(color: string, finish: Option["finish"] = "gloss"): PaintProps {
  return { color, ...FINISH[finish] };
}

export const HEX = /^#[0-9a-f]{6}$/i;
