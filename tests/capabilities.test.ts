import { describe, expect, it } from "vitest";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { categories, defaultSelection, decodeSelection } from "../lib/customisation/options";
import { categoryAvailability, optionAvailability, sanitiseSelection } from "../lib/customisation/capabilities";
import { applyVisibility } from "../lib/vehicles/slots";
import { loaderFixture } from "../lib/vehicles/fixture";
import { vehicles } from "../lib/vehicles/data";

const cat = (id: string) => categories.find((c) => c.id === id)!;
const pending = vehicles[0].asset;
const model = loaderFixture.asset;

describe("availability without a model", () => {
  it("lets every option be chosen and says where it shows", () => {
    expect(categoryAvailability(pending, cat("paint"))).toEqual({ available: true, preview: "sample" });
    expect(categoryAvailability(pending, cat("wheels"))).toEqual({ available: true, preview: "recorded" });
    expect(categoryAvailability(pending, cat("body")).preview).toBe("recorded");
    expect(categoryAvailability(pending, cat("lighting")).preview).toBe("scene");
    expect(optionAvailability(pending, cat("body"), "side-skirts").available).toBe(true);
  });
});

describe("availability with a model", () => {
  it("allows options the manifest maps", () => {
    expect(optionAvailability(model, cat("paint"), "racing-red")).toEqual({ available: true, preview: "model" });
    expect(optionAvailability(model, cat("wheels"), "standard").available).toBe(true);
    expect(optionAvailability(model, cat("wheels"), "apex-five").available).toBe(true);
    expect(optionAvailability(model, cat("body"), "rear-spoiler").available).toBe(true);
  });

  it("refuses unmapped parts and says why", () => {
    const wheel = optionAvailability(model, cat("wheels"), "apex-forged");
    expect(wheel.available).toBe(false);
    expect(wheel.reason).toMatch(/Apex forged/);
    expect(optionAvailability(model, cat("body"), "side-skirts").available).toBe(false);
  });

  it("disables a whole category whose slot is unsupported, but keeps its default", () => {
    const asset = { ...model, slots: { ...model.slots, stitching: { supported: false as const, reason: "Stitching is part of the seat texture." } } };
    expect(categoryAvailability(asset, cat("stitching"))).toMatchObject({ available: false, reason: "Stitching is part of the seat texture." });
    expect(optionAvailability(asset, cat("stitching"), "tonal").available).toBe(true);
    expect(optionAvailability(asset, cat("stitching"), "red").available).toBe(false);
  });

  it("disables body additions when none are mapped", () => {
    const asset = { ...model, visibility: { wheels: model.visibility?.wheels } };
    expect(categoryAvailability(asset, cat("body")).available).toBe(false);
  });

  it("strips unavailable options from a shared link and reports them", () => {
    const shared = decodeSelection("paint:racing-red;wheels:apex-forged;body:rear-spoiler,side-skirts");
    const { selection, removed } = sanitiseSelection(model, shared);
    expect(selection.paint).toEqual(["racing-red"]);
    expect(selection.wheels).toEqual(["standard"]);
    expect(selection.body).toEqual(["rear-spoiler"]);
    expect(removed).toEqual(["Apex forged", "Side skirts"]);
  });

  it("changes nothing for a vehicle with no model", () => {
    const shared = decodeSelection("wheels:apex-forged;body:side-skirts");
    expect(sanitiseSelection(pending, shared)).toEqual({ selection: shared, removed: [] });
    expect(sanitiseSelection(pending, defaultSelection()).removed).toEqual([]);
  });
});

describe("part visibility", () => {
  function rig() {
    const root = new Group();
    const make = (name: string, parent: Group = root) => {
      const m = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
      m.name = name;
      parent.add(m);
      return m;
    };
    const std = new Group();
    std.name = "Wheels_Std";
    const alt = new Group();
    alt.name = "Wheels_Alt";
    root.add(std, alt);
    make("W1", std);
    make("A1", alt);
    const spoiler = make("Spoiler");
    return { root, std, alt, spoiler };
  }
  const wheelRules = { alt: { show: ["Wheels_Alt"], hide: ["Wheels_Std"] } };

  it("swaps wheels and swaps back", () => {
    const { root, std, alt } = rig();
    applyVisibility(root, wheelRules, ["standard"]);
    expect([std.visible, alt.visible]).toEqual([true, false]);
    applyVisibility(root, wheelRules, ["alt"]);
    expect([std.visible, alt.visible]).toEqual([false, true]);
    applyVisibility(root, wheelRules, ["standard"]);
    expect([std.visible, alt.visible]).toEqual([true, false]);
  });

  it("toggles add-on parts and reports misses", () => {
    const { root, spoiler } = rig();
    expect(applyVisibility(root, { s: { show: ["Spoiler"] } }, [])).toBe(1);
    expect(spoiler.visible).toBe(false);
    applyVisibility(root, { s: { show: ["Spoiler"] } }, ["s"]);
    expect(spoiler.visible).toBe(true);
    expect(applyVisibility(root, { s: { show: ["spoiler_typo"] } }, ["s"])).toBe(0);
  });
});
