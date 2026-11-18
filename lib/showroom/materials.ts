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

/** Interior trim finishes. Carbon fibre is an approximation: no weave texture yet. */
export interface TrimProps {
  color: string;
  metalness: number;
  roughness: number;
}

export const TRIM: Record<string, TrimProps> = {
  "piano-black": { color: "#050506", metalness: 0.1, roughness: 0.08 },
  "brushed-aluminium": { color: "#a9adb3", metalness: 1, roughness: 0.38 },
  "carbon-fibre": { color: "#1b1c1f", metalness: 0.4, roughness: 0.3 },
};

export const trimProps = (optionId: string | undefined): TrimProps => TRIM[optionId ?? ""] ?? TRIM["piano-black"];
