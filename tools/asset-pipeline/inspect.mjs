#!/usr/bin/env node
/**
 * Inspect a vehicle GLB before it goes anywhere near the app.
 *
 *   npm run asset:inspect -- path/to/model.glb [--out manifest.draft.json]
 *
 * Prints what is really in the file (nodes, materials, textures, triangles,
 * size, scale) and can write a draft manifest listing the real names, with
 * every slot left unmapped. Mapping is done by a person, not guessed.
 */
import { statSync, writeFileSync } from "node:fs";
import { getBounds } from "@gltf-transform/core";
import { createIO, mb, triangles } from "./io.mjs";

const SLOTS = [
  "car_body", "front_bumper", "rear_bumper", "wheels", "brake_calipers", "brake_discs", "glass", "headlights",
  "taillights", "seats", "stitching", "dashboard", "steering_wheel", "centre_console", "interior_trim",
];

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const outIndex = args.indexOf("--out");
const out = outIndex >= 0 ? args[outIndex + 1] : null;
if (!file) {
  console.error("Usage: npm run asset:inspect -- model.glb [--out manifest.draft.json]");
  process.exit(1);
}

const io = await createIO();
const doc = await io.read(file);
const root = doc.getRoot();
const scene = root.getDefaultScene() ?? root.listScenes()[0];

const meshNodes = root.listNodes().filter((n) => n.getMesh());
const nodes = meshNodes.map((n) => {
  const prims = n.getMesh().listPrimitives();
  return {
    name: n.getName() || "(unnamed)",
    materials: [...new Set(prims.map((p) => p.getMaterial()?.getName() || "(unnamed)"))],
  };
});
const groups = root.listNodes().filter((n) => !n.getMesh() && n.listChildren().length).map((n) => n.getName() || "(unnamed)");
const materials = root.listMaterials().map((m) => m.getName() || "(unnamed)");
const textures = root.listTextures().map((t) => ({ name: t.getName() || t.getURI() || "(unnamed)", size: t.getSize(), type: t.getMimeType() }));
const { min, max } = getBounds(scene);
const dims = [0, 1, 2].map((i) => +(max[i] - min[i]).toFixed(3));
const length = Math.max(dims[0], dims[2]);
const tris = triangles(doc);
const extensions = root.listExtensionsUsed().map((e) => e.extensionName);

const warnings = [];
if (length < 3 || length > 6.5) warnings.push(`Longest horizontal size is ${length} m. A car is about 4–5 m: check units (cm or mm?) and scale.`);
if (dims[1] > length) warnings.push("Height is greater than length: the model is probably not Y-up. Rotate it before use.");
if (Math.abs(min[1]) > 0.05) warnings.push(`Lowest point is at y = ${min[1].toFixed(3)} m, not 0. The car will float or sink; move its origin to the ground.`);
if (tris > 300_000) warnings.push(`${tris.toLocaleString()} triangles is above the 300k desktop budget. Run asset:optimise.`);
if (nodes.some((n) => n.name === "(unnamed)")) warnings.push("Some mesh nodes have no name, so they cannot be mapped.");
if (materials.some((m) => m === "(unnamed)")) warnings.push("Some materials have no name, so they cannot be mapped by material.");
const big = textures.filter((t) => t.size && Math.max(...t.size) > 2048);
if (big.length) warnings.push(`${big.length} texture(s) larger than 2048 px. Run asset:optimise to resize.`);

console.log(`\nFile           ${file}  (${mb(statSync(file).size)})`);
console.log(`Triangles      ${tris.toLocaleString()}`);
console.log(`Size (x,y,z)   ${dims.join(" × ")} m  (length along ${dims[2] >= dims[0] ? "Z" : "X"})`);
console.log(`Ground         lowest point y = ${min[1].toFixed(3)} m`);
console.log(`Extensions     ${extensions.join(", ") || "none"}`);
console.log(`\nMesh nodes (${nodes.length})`);
for (const n of nodes) console.log(`  ${n.name.padEnd(36)} ${n.materials.join(", ")}`);
if (groups.length) console.log(`\nGroup nodes (${groups.length})\n  ${groups.join("\n  ")}`);
console.log(`\nMaterials (${materials.length})\n  ${materials.join("\n  ")}`);
console.log(`\nTextures (${textures.length})`);
for (const t of textures) console.log(`  ${t.name.padEnd(36)} ${t.size ? t.size.join("×") : "?"}  ${t.type}`);
console.log(warnings.length ? `\nWarnings\n  - ${warnings.join("\n  - ")}\n` : "\nNo warnings.\n");

if (out) {
  const draft = {
    note: "Draft from asset:inspect. Map each slot to the real node or material names below, or mark it unsupported with a reason.",
    file,
    triangles: tris,
    dimensionsMetres: dims,
    slots: Object.fromEntries(SLOTS.map((s) => [s, { supported: false, reason: "Not mapped yet." }])),
    visibility: { wheels: {}, body: {} },
    inventory: { meshNodes: nodes, groupNodes: groups, materials, textures },
    warnings,
  };
  writeFileSync(out, JSON.stringify(draft, null, 2));
  console.log(`Draft manifest written to ${out}\n`);
}
