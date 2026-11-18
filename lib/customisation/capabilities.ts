import type { VehicleAsset } from "@/lib/vehicles/types";
import { slotSupport } from "@/lib/vehicles/slots";
import { categories, defaultSelection, findOption, type Category, type CategoryId, type Selection } from "./options";

/**
 * Which options a vehicle's 3D model can actually show.
 *
 * - "model":    the option changes the loaded vehicle model.
 * - "sample":   no model yet; the option is shown on the studio's material sample.
 * - "recorded": no model yet; the option is saved and priced, and shows once a model arrives.
 * - "scene":    the option changes the studio, not the car.
 *
 * With a model loaded, an option it cannot show is unavailable, with a reason.
 */
export type Preview = "model" | "sample" | "recorded" | "scene";

export interface Availability {
  available: boolean;
  preview: Preview;
  reason?: string;
}

const SHOWN_ON_SAMPLE: CategoryId[] = ["paint", "calipers", "interior", "stitching"];

const hasModel = (asset: VehicleAsset) => asset.modelUrl !== null;

export function categoryAvailability(asset: VehicleAsset, category: Category): Availability {
  if (category.group === "Scene") return { available: true, preview: "scene" };
  if (!hasModel(asset)) {
    return { available: true, preview: SHOWN_ON_SAMPLE.includes(category.id) ? "sample" : "recorded" };
  }
  if (category.id === "wheels") return { available: true, preview: "model" };
  if (category.id === "body") {
    const rules = asset.visibility?.body;
    return rules && Object.keys(rules).length
      ? { available: true, preview: "model" }
      : { available: false, preview: "model", reason: "This model has no add-on body parts mapped." };
  }
  if (!category.slot) return { available: true, preview: "model" };
  const support = slotSupport(asset, category.slot);
  return support.supported
    ? { available: true, preview: "model" }
    : { available: false, preview: "model", reason: support.reason };
}

export function optionAvailability(asset: VehicleAsset, category: Category, optionId: string): Availability {
  const cat = categoryAvailability(asset, category);
  if (!hasModel(asset) || cat.preview === "scene") return cat;
  const name = findOption(category.id, optionId)?.name ?? optionId;

  if (category.id === "wheels") {
    if (optionId === "standard" || asset.visibility?.wheels?.[optionId]) return { available: true, preview: "model" };
    return { available: false, preview: "model", reason: `This model has no ${name} wheel.` };
  }
  if (category.id === "body") {
    if (asset.visibility?.body?.[optionId]) return { available: true, preview: "model" };
    return { available: false, preview: "model", reason: cat.reason ?? `This model has no separate ${name.toLowerCase()} part.` };
  }
  // A colour or finish category: every option works if the slot does. The default
  // stays selectable even when the slot is unsupported, since it changes nothing.
  if (!cat.available && optionId === category.options[0].id) return { available: true, preview: "model" };
  return cat;
}

/** Drops options the vehicle cannot show, for example from an old share link. Returns what was removed. */
export function sanitiseSelection(asset: VehicleAsset, selection: Selection): { selection: Selection; removed: string[] } {
  const defaults = defaultSelection();
  const removed: string[] = [];
  const next = { ...selection };
  for (const c of categories) {
    const kept = (selection[c.id] ?? []).filter((id) => {
      const ok = optionAvailability(asset, c, id).available;
      if (!ok) removed.push(findOption(c.id, id)?.name ?? id);
      return ok;
    });
    next[c.id] = c.multi || kept.length ? kept : defaults[c.id];
  }
  return { selection: next, removed };
}
