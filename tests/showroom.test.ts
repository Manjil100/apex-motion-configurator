import { describe, expect, it } from "vitest";
import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial } from "three";
import { applyToSlot, inventory, materialsForSlot, slotSupport } from "../lib/vehicles/slots";
import { lowerTier, pickTier } from "../lib/showroom/quality";
import { clampDistance, fitFactor, ORBIT_LIMITS, resolveCamera, scalePreset } from "../lib/showroom/cameras";
import { paintProps } from "../lib/showroom/materials";
import { customPaintId, decodeSelection, defaultSelection, encodeSelection, findOption, optionsTotal } from "../lib/customisation/options";
import type { VehicleAsset } from "../lib/vehicles/types";

function fakeCar() {
  const paint = new MeshStandardMaterial({ name: "Paint_Main", color: "#000000" });
  const caliper = new MeshStandardMaterial({ name: "Caliper", color: "#000000" });
  const glass = new MeshStandardMaterial({ name: "Glass", color: "#222222" });
  const root = new Group();
  const body = new Mesh(new BoxGeometry(), paint);
  body.name = "Body_Shell";
  const door = new Mesh(new BoxGeometry(), paint);
  door.name = "Door_L";
  const brake = new Mesh(new BoxGeometry(), caliper);
  brake.name = "Brake_FL";
  const window = new Mesh(new BoxGeometry(), glass);
  window.name = "Windscreen";
  root.add(body, door, brake, window);
  return { root, paint, caliper, glass };
}

const asset = (slots: VehicleAsset["slots"], cameras: VehicleAsset["cameras"] = {}): VehicleAsset => ({
  status: "placeholder",
  modelUrl: null,
  licence: null,
  slots,
  cameras,
  lighting: { defaultEnvironment: "studio" },
});

describe("slot resolver", () => {
  it("changes only the materials the manifest maps, by material name", () => {
    const { root, paint, caliper, glass } = fakeCar();
    const changed = applyToSlot(root, { supported: true, nodes: [], materials: ["Paint_Main"] }, (m) =>
      (m as MeshStandardMaterial).color.set("#c1121f"),
    );
    expect(changed).toBe(1); // shared by two meshes, counted once
    expect(paint.color.equals(new Color("#c1121f"))).toBe(true);
    expect(caliper.color.equals(new Color("#000000"))).toBe(true);
    expect(glass.color.equals(new Color("#222222"))).toBe(true);
  });

  it("can map by node name", () => {
    const { root, caliper } = fakeCar();
    expect(materialsForSlot(root, { supported: true, nodes: ["Brake_FL"], materials: [] })).toEqual([caliper]);
  });

  it("changes nothing for an unmapped or unsupported slot, and reports why", () => {
    const { root } = fakeCar();
    expect(applyToSlot(root, undefined, () => {})).toBe(0);
    expect(applyToSlot(root, { supported: false, reason: "not a separate mesh" }, () => {})).toBe(0);
    expect(slotSupport(asset({ stitching: { supported: false, reason: "not a separate mesh" } }), "stitching")).toEqual({
      supported: false,
      reason: "not a separate mesh",
    });
    expect(slotSupport(asset({}), "car_body").supported).toBe(false);
  });

  it("does not guess: a wrong name matches nothing", () => {
    const { root } = fakeCar();
    expect(applyToSlot(root, { supported: true, nodes: ["car_body"], materials: ["paint"] }, () => {})).toBe(0);
  });

  it("inventories nodes, materials and triangles", () => {
    const { root } = fakeCar();
    const inv = inventory(root);
    expect(inv.nodes).toEqual(["Body_Shell", "Brake_FL", "Door_L", "Windscreen"]);
    expect(inv.materials).toEqual(["Caliper", "Glass", "Paint_Main"]);
    expect(inv.triangles).toBe(48);
  });
});

describe("quality tiers", () => {
  it("picks by device", () => {
    expect(pickTier({ cores: 12, memoryGb: 16 })).toBe("high");
    expect(pickTier({ cores: 4, memoryGb: 8 })).toBe("medium");
    expect(pickTier({ cores: 2, memoryGb: 8 })).toBe("low");
    expect(pickTier({ cores: 8, memoryGb: 4, coarsePointer: true, narrow: true })).toBe("low");
    expect(pickTier({ cores: 8, memoryGb: 8, coarsePointer: true, narrow: true })).toBe("medium");
    expect(pickTier({ cores: 12, memoryGb: 16, saveData: true })).toBe("low");
  });
  it("steps down and stops at low", () => {
    expect(lowerTier("high")).toBe("medium");
    expect(lowerTier("medium")).toBe("low");
    expect(lowerTier("low")).toBe("low");
  });
});

describe("cameras", () => {
  it("falls back to defaults for exterior views and refuses interior without a preset", () => {
    expect(resolveCamera(asset({}), "front")?.position).toEqual([0, 1.15, 8.2]);
    expect(resolveCamera(asset({}), "interior")).toBeNull();
  });
  it("prefers the vehicle's own preset", () => {
    const own = { position: [0, 1, 0.2] as [number, number, number], target: [0, 1, 1] as [number, number, number] };
    expect(resolveCamera(asset({}, { interior: own }), "interior")).toBe(own);
  });
  it("retreats on portrait screens and keeps the viewing direction", () => {
    expect(fitFactor(16 / 9)).toBe(1);
    expect(fitFactor(390 / 400)).toBeGreaterThan(1.4);
    expect(fitFactor(0.1)).toBe(2.2);
    const scaled = scalePreset({ position: [0, 1, 4], target: [0, 1, 0] }, 2);
    expect(scaled.position).toEqual([0, 1, 8]);
    expect(scaled.target).toEqual([0, 1, 0]);
  });
  it("clamps zoom distance", () => {
    expect(clampDistance(0.5)).toBe(ORBIT_LIMITS.minDistance);
    expect(clampDistance(99)).toBe(ORBIT_LIMITS.maxDistance);
    expect(clampDistance(6)).toBe(6);
  });
});

describe("paint", () => {
  it("makes matte rough with no clearcoat and gloss the opposite", () => {
    expect(paintProps("#000000", "matte").clearcoat).toBe(0);
    expect(paintProps("#000000", "matte").roughness).toBeGreaterThan(0.7);
    expect(paintProps("#000000", "gloss").clearcoat).toBe(1);
  });
  it("supports a custom colour through pricing and share links, and rejects malformed ones", () => {
    const s = defaultSelection();
    s.paint = [customPaintId("#12ABef")];
    expect(findOption("paint", s.paint[0])?.swatch).toBe("#12abef");
    expect(optionsTotal(s)).toBe(5200);
    expect(decodeSelection(encodeSelection(s))).toEqual(s);
    expect(decodeSelection("paint:custom-zzzzzz").paint).toEqual(["gloss-black"]);
    expect(decodeSelection("paint:custom-12345").paint).toEqual(["gloss-black"]);
  });
});
