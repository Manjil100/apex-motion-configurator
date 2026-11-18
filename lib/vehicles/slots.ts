import type { Material, Mesh, Object3D } from "three";
import type { MeshSlot, SlotMapping, VehicleAsset, VisibilityRule } from "./types";

/**
 * Slot resolver: the bridge between a model's real node and material names
 * and the generic slots the configurator understands. Nothing here guesses a
 * name. If the manifest does not map a slot, the slot is unsupported.
 */

const isMesh = (o: Object3D): o is Mesh => (o as Mesh).isMesh === true;

export function slotSupport(asset: VehicleAsset, slot: MeshSlot): { supported: boolean; reason?: string } {
  const mapping = asset.slots[slot];
  if (!mapping) return { supported: false, reason: "This model's manifest does not map this part." };
  if (!mapping.supported) return { supported: false, reason: mapping.reason };
  return { supported: true };
}

/** Every material in `root` that the mapping points at, by material name or by owning node name. De-duplicated. */
export function materialsForSlot(root: Object3D, mapping: SlotMapping | undefined): Material[] {
  if (!mapping || !mapping.supported) return [];
  const found = new Set<Material>();
  root.traverse((node) => {
    if (!isMesh(node)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const nodeMatch = mapping.nodes.includes(node.name);
    for (const m of materials) if (nodeMatch || mapping.materials.includes(m.name)) found.add(m);
  });
  return [...found];
}

/** Applies `change` to each material in a slot. Returns how many materials were changed, so callers can tell a silent miss from a hit. */
export function applyToSlot(root: Object3D, mapping: SlotMapping | undefined, change: (material: Material) => void): number {
  const materials = materialsForSlot(root, mapping);
  for (const m of materials) {
    change(m);
    m.needsUpdate = true;
  }
  return materials.length;
}

/** Lists what is actually in a file. The asset-inspection step uses this to write a manifest. */
export function inventory(root: Object3D): { nodes: string[]; materials: string[]; triangles: number } {
  const nodes = new Set<string>();
  const materials = new Set<string>();
  let triangles = 0;
  root.traverse((node) => {
    if (!isMesh(node)) return;
    nodes.add(node.name);
    for (const m of Array.isArray(node.material) ? node.material : [node.material]) materials.add(m.name);
    const g = node.geometry;
    triangles += g.index ? g.index.count / 3 : (g.attributes.position?.count ?? 0) / 3;
  });
  return { nodes: [...nodes].sort(), materials: [...materials].sort(), triangles: Math.round(triangles) };
}

/** Frees GPU memory for everything under `root`. Call when switching vehicles. */
export function disposeObject(root: Object3D): void {
  root.traverse((node) => {
    if (!isMesh(node)) return;
    node.geometry.dispose();
    for (const m of Array.isArray(node.material) ? node.material : [node.material]) {
      for (const value of Object.values(m)) {
        if (value && typeof value === "object" && (value as { isTexture?: boolean }).isTexture) {
          (value as { dispose: () => void }).dispose();
        }
      }
      m.dispose();
    }
  });
}

/**
 * Shows the parts of the selected options and hides the parts of the others.
 * Returns the number of named nodes it found, so a manifest typo shows up as 0.
 */
export function applyVisibility(
  root: Object3D,
  rules: Record<string, VisibilityRule> | undefined,
  selected: string[],
): number {
  if (!rules) return 0;
  const byName = new Map<string, Object3D>();
  root.traverse((node) => {
    if (node.name) byName.set(node.name, node);
  });
  let found = 0;
  const set = (names: string[] | undefined, visible: boolean) => {
    for (const name of names ?? []) {
      const node = byName.get(name);
      if (!node) continue;
      node.visible = visible;
      found++;
    }
  };
  // Undo every unselected rule first (hide what it adds, restore what it hides), then apply the selected ones.
  for (const [id, rule] of Object.entries(rules)) {
    if (selected.includes(id)) continue;
    set(rule.show, false);
    set(rule.hide, true);
  }
  for (const id of selected) {
    set(rules[id]?.show, true);
    set(rules[id]?.hide, false);
  }
  return found;
}
