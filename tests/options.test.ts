import { describe, expect, it } from "vitest";
import {
  categories,
  decodeSelection,
  defaultSelection,
  encodeSelection,
  optionsTotal,
} from "../lib/customisation/options";
import { vehicles, getVehicle } from "../lib/vehicles/data";

describe("customisation options", () => {
  it("defaults to the first option of each single-choice category and nothing for multi-choice", () => {
    const s = defaultSelection();
    for (const c of categories) expect(s[c.id]).toEqual(c.multi ? [] : [c.options[0].id]);
  });

  it("prices the default build at zero", () => {
    expect(optionsTotal(defaultSelection())).toBe(0);
  });

  it("adds option prices, including several body additions", () => {
    const s = defaultSelection();
    s.paint = ["matte-black"]; // 4200
    s.body = ["front-splitter", "rear-spoiler"]; // 2900 + 3800
    expect(optionsTotal(s)).toBe(10900);
  });

  it("round-trips a selection through a share string", () => {
    const s = defaultSelection();
    s.paint = ["racing-red"];
    s.calipers = ["yellow"];
    s.body = ["side-skirts", "rear-diffuser"];
    expect(decodeSelection(encodeSelection(s))).toEqual(s);
  });

  it("ignores unknown categories and options in a share string", () => {
    const s = decodeSelection("paint:not-a-colour;bogus:x;body:rear-spoiler,<script>;calipers:red,yellow");
    expect(s.paint).toEqual(["gloss-black"]);
    expect(s.body).toEqual(["rear-spoiler"]);
    expect(s.calipers).toEqual(["red"]);
  });

  it("falls back to defaults for empty input", () => {
    expect(decodeSelection(undefined)).toEqual(defaultSelection());
  });
});

describe("vehicle catalogue", () => {
  it("holds nine cars with unique slugs", () => {
    expect(vehicles).toHaveLength(9);
    expect(new Set(vehicles.map((v) => v.slug)).size).toBe(9);
  });

  it("never ships an unverified price or a model marked verified without a licence", () => {
    for (const v of vehicles) {
      expect(v.basePrice).toBeNull();
      if (v.asset.status === "verified") expect(v.asset.licence?.commercialUse).toBe(true);
    }
  });

  it("uses the C192 generation for the AMG GT", () => {
    expect(getVehicle("mercedes-amg-gt")?.generation).toBe("C192");
  });
});
