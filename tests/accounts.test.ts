import { describe, expect, it } from "vitest";
import { rowsToSelection, selectionToPayload } from "../lib/garage/mapping";
import { validateContact } from "../lib/validation/contact";
import { customPaintId, decodeSelection, defaultSelection, encodeSelection } from "../lib/customisation/options";

describe("saved build mapping", () => {
  it("round-trips a selection through database rows", () => {
    const s = decodeSelection(`paint:${customPaintId("#12abef")};calipers:yellow;body:rear-spoiler,side-skirts;lighting:night`);
    const payload = selectionToPayload(s);
    const rows = Object.entries(payload).flatMap(([category_id, ids]) => ids.map((option_id) => ({ category_id, option_id })));
    expect(rowsToSelection(rows)).toEqual(s);
  });

  it("ignores rows the catalogue no longer knows and falls back to defaults", () => {
    const rows = [
      { category_id: "paint", option_id: "discontinued-blue" },
      { category_id: "ghost", option_id: "x" },
      { category_id: "body", option_id: "rear-spoiler" },
    ];
    const s = rowsToSelection(rows);
    expect(s.paint).toEqual(defaultSelection().paint);
    expect(s.body).toEqual(["rear-spoiler"]);
    expect(encodeSelection(s)).not.toContain("ghost");
  });

  it("sends every category, de-duplicated", () => {
    const s = defaultSelection();
    s.body = ["rear-spoiler", "rear-spoiler"];
    expect(selectionToPayload(s).body).toEqual(["rear-spoiler"]);
    expect(Object.keys(selectionToPayload(s))).toHaveLength(8);
  });
});

describe("contact validation (shared by form and server)", () => {
  const ok = { name: "Manjil", email: "m@example.com", subject: "Hello", message: "A message that is long enough." };
  it("accepts a valid enquiry", () => expect(validateContact(ok)).toEqual({}));
  it("rejects each bad field with a fix-it message", () => {
    const e = validateContact({ name: "M", email: "nope", subject: "Hi", message: "short" });
    expect(Object.keys(e).sort()).toEqual(["email", "message", "name", "subject"]);
  });
  it("matches the database length limits", () => {
    expect(validateContact({ ...ok, message: "x".repeat(2001) }).message).toBeDefined();
    expect(validateContact({ ...ok, name: "x".repeat(81) }).name).toBeDefined();
    expect(validateContact({ ...ok, subject: "x".repeat(121) }).subject).toBeDefined();
  });
});
