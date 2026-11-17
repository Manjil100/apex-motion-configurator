import type { MeshSlot } from "@/lib/vehicles/types";

/**
 * Customisation catalogue. Seed for `customisation_categories` and
 * `customisation_options` (Phase 6).
 *
 * Every price here is ILLUSTRATIVE: invented so the summary and totals can be
 * built and tested. None is a manufacturer price, and the interface says so.
 */

export type CategoryId = "paint" | "wheels" | "calipers" | "interior" | "stitching" | "trim" | "body" | "lighting";

export interface Option {
  id: string;
  name: string;
  /** Illustrative price in NZD. */
  price: number;
  /** Swatch colour for options that are a colour. */
  swatch?: string;
  finish?: "gloss" | "matte" | "metallic" | "pearl";
  note?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  group: "Exterior" | "Wheels" | "Interior" | "Body" | "Scene";
  /** Which part of the 3D model this category changes. `null` changes the scene, not the car. */
  slot: MeshSlot | null;
  multi?: boolean;
  options: Option[];
}

export const categories: Category[] = [
  {
    id: "paint",
    name: "Paint",
    group: "Exterior",
    slot: "car_body",
    options: [
      { id: "gloss-black", name: "Gloss black", price: 0, swatch: "#0b0b0d", finish: "gloss" },
      { id: "matte-black", name: "Matte black", price: 4200, swatch: "#1c1d20", finish: "matte" },
      { id: "metallic-silver", name: "Metallic silver", price: 1800, swatch: "#b9bec6", finish: "metallic" },
      { id: "pearl-white", name: "Pearl white", price: 2600, swatch: "#eef0f2", finish: "pearl" },
      { id: "racing-red", name: "Racing red", price: 1800, swatch: "#c1121f", finish: "gloss" },
      { id: "midnight-blue", name: "Midnight blue", price: 1800, swatch: "#14213d", finish: "metallic" },
      { id: "british-racing-green", name: "British racing green", price: 2200, swatch: "#0f3d2e", finish: "gloss" },
    ],
  },
  {
    id: "wheels",
    name: "Wheel design",
    group: "Wheels",
    slot: "wheels",
    options: [
      { id: "standard", name: "Standard wheel", price: 0, note: "As supplied with the vehicle model" },
      { id: "apex-five", name: "Apex five-spoke", price: 3900, note: "APEX MOTION concept design" },
      { id: "apex-mesh", name: "Apex mesh", price: 4600, note: "APEX MOTION concept design" },
      { id: "apex-forged", name: "Apex forged", price: 7200, note: "APEX MOTION concept design" },
    ],
  },
  {
    id: "calipers",
    name: "Brake calipers",
    group: "Wheels",
    slot: "brake_calipers",
    options: [
      { id: "black", name: "Black", price: 0, swatch: "#111214" },
      { id: "red", name: "Red", price: 900, swatch: "#c1121f" },
      { id: "yellow", name: "Yellow", price: 900, swatch: "#f2c200" },
      { id: "volt", name: "Violet", price: 1100, swatch: "#8f6bff" },
    ],
  },
  {
    id: "interior",
    name: "Leather colour",
    group: "Interior",
    slot: "seats",
    options: [
      { id: "black", name: "Black", price: 0, swatch: "#141416" },
      { id: "tan", name: "Tan", price: 2400, swatch: "#a8703f" },
      { id: "oxblood", name: "Oxblood", price: 2400, swatch: "#5a1a1f" },
      { id: "ivory", name: "Ivory", price: 2800, swatch: "#e6dfd0" },
    ],
  },
  {
    id: "stitching",
    name: "Stitching",
    group: "Interior",
    slot: "stitching",
    options: [
      { id: "tonal", name: "Tonal", price: 0, swatch: "#3a3b40" },
      { id: "silver", name: "Silver", price: 450, swatch: "#c8ccd3" },
      { id: "red", name: "Red", price: 450, swatch: "#c1121f" },
      { id: "volt", name: "Violet", price: 450, swatch: "#8f6bff" },
    ],
  },
  {
    id: "trim",
    name: "Dashboard trim",
    group: "Interior",
    slot: "interior_trim",
    options: [
      { id: "piano-black", name: "Piano black", price: 0 },
      { id: "brushed-aluminium", name: "Brushed aluminium", price: 1200 },
      { id: "carbon-fibre", name: "Carbon fibre", price: 3400 },
    ],
  },
  {
    id: "body",
    name: "Body additions",
    group: "Body",
    slot: null,
    multi: true,
    options: [
      { id: "front-splitter", name: "Front splitter", price: 2900, note: "APEX MOTION concept part" },
      { id: "side-skirts", name: "Side skirts", price: 2100, note: "APEX MOTION concept part" },
      { id: "rear-diffuser", name: "Rear diffuser", price: 3300, note: "APEX MOTION concept part" },
      { id: "rear-spoiler", name: "Rear spoiler", price: 3800, note: "APEX MOTION concept part" },
    ],
  },
  {
    id: "lighting",
    name: "Environment",
    group: "Scene",
    slot: null,
    options: [
      { id: "studio", name: "Studio", price: 0 },
      { id: "day", name: "Daylight", price: 0 },
      { id: "night", name: "Night", price: 0 },
    ],
  },
];

export type Selection = Record<CategoryId, string[]>;

export function defaultSelection(): Selection {
  return Object.fromEntries(
    categories.map((c) => [c.id, c.multi ? [] : [c.options[0].id]]),
  ) as Selection;
}

const CUSTOM_PAINT = /^custom-([0-9a-f]{6})$/;
/** Illustrative surcharge for a colour mixed to order. */
export const CUSTOM_PAINT_PRICE = 5200;

export const customPaintId = (hex: string) => `custom-${hex.replace("#", "").toLowerCase()}`;
export const isCustomPaint = (optionId: string | undefined) => Boolean(optionId && CUSTOM_PAINT.test(optionId));

export function findOption(categoryId: CategoryId, optionId: string | undefined): Option | undefined {
  if (!optionId) return undefined;
  if (categoryId === "paint") {
    const custom = CUSTOM_PAINT.exec(optionId);
    if (custom) {
      return { id: optionId, name: `Custom #${custom[1].toUpperCase()}`, price: CUSTOM_PAINT_PRICE, swatch: `#${custom[1]}`, finish: "gloss" };
    }
  }
  return categories.find((c) => c.id === categoryId)?.options.find((o) => o.id === optionId);
}

/** Sum of selected option prices. Illustrative, and excludes the vehicle itself. */
export function optionsTotal(selection: Selection): number {
  return categories.reduce(
    (sum, c) => sum + (selection[c.id] ?? []).reduce((s, id) => s + (findOption(c.id, id)?.price ?? 0), 0),
    0,
  );
}

/** Compact, URL-safe encoding used by share links: `paint:racing-red;body:rear-spoiler,side-skirts`. */
export function encodeSelection(selection: Selection): string {
  return categories.map((c) => `${c.id}:${(selection[c.id] ?? []).join(",")}`).join(";");
}

/** Decodes a share string, ignoring anything that is not a known category or option. */
export function decodeSelection(encoded: string | null | undefined): Selection {
  const selection = defaultSelection();
  if (!encoded) return selection;
  for (const part of encoded.split(";")) {
    const [rawId, rawOptions = ""] = part.split(":");
    const category = categories.find((c) => c.id === rawId);
    if (!category) continue;
    const valid = rawOptions.split(",").filter((id) => findOption(category.id, id) !== undefined);
    if (category.multi) selection[category.id] = [...new Set(valid)];
    else if (valid[0]) selection[category.id] = [valid[0]];
  }
  return selection;
}

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(amount);
