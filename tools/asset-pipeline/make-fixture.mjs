#!/usr/bin/env node
/**
 * Builds the loader test fixture: an assembly of labelled blocks with named
 * nodes and materials laid out like a manifest expects. It is NOT a vehicle
 * and is never shown as one. It exists so the GLB loading path, slot mapping,
 * part visibility, compression and disposal can be tested end to end.
 *
 *   npm run asset:fixture
 */
import { Document } from "@gltf-transform/core";
import sharp from "sharp";
import { createIO } from "./io.mjs";

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene("Fixture");

function box(w, h, d) {
  const [x, y, z] = [w / 2, h / 2, d / 2];
  const faces = [
    [[1, 0, 0], [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]]],
    [[-1, 0, 0], [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]]],
    [[0, 1, 0], [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]]],
    [[0, -1, 0], [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]]],
    [[0, 0, 1], [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]]],
    [[0, 0, -1], [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]]],
  ];
  const pos = [], nor = [], uv = [], idx = [];
  faces.forEach(([n, verts], f) => {
    verts.forEach((v) => (pos.push(...v), nor.push(...n)));
    uv.push(0, 1, 1, 1, 1, 0, 0, 0);
    const o = f * 4;
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  const acc = (arr, type) => doc.createAccessor().setArray(arr).setType(type).setBuffer(buffer);
  return doc
    .createPrimitive()
    .setAttribute("POSITION", acc(new Float32Array(pos), "VEC3"))
    .setAttribute("NORMAL", acc(new Float32Array(nor), "VEC3"))
    .setAttribute("TEXCOORD_0", acc(new Float32Array(uv), "VEC2"))
    .setIndices(acc(new Uint16Array(idx), "SCALAR"));
}

const mat = (name, color, metal = 0, rough = 0.6) =>
  doc.createMaterial(name).setBaseColorFactor([...color, 1]).setMetallicFactor(metal).setRoughnessFactor(rough);

// A small grain texture on the leather, so texture compression is exercised too.
const noise = Buffer.alloc(256 * 256 * 3);
for (let i = 0; i < noise.length; i++) noise[i] = 200 + Math.floor(Math.random() * 55);
const grain = await sharp(noise, { raw: { width: 256, height: 256, channels: 3 } }).png().toBuffer();
const grainTex = doc.createTexture("Fixture_Leather_Grain").setImage(grain).setMimeType("image/png");

const M = {
  paint: mat("Fixture_Paint", [0.05, 0.05, 0.06], 0.1, 0.3),
  glass: mat("Fixture_Glass", [0.6, 0.7, 0.8], 0, 0.05).setAlpha(0.25).setAlphaMode("BLEND"),
  wheel: mat("Fixture_Wheel", [0.1, 0.1, 0.11], 0.6, 0.4),
  wheelAlt: mat("Fixture_Wheel_Alt", [0.75, 0.76, 0.78], 1, 0.25),
  caliper: mat("Fixture_Caliper", [0.07, 0.07, 0.08], 0.2, 0.3),
  leather: mat("Fixture_Leather", [0.08, 0.08, 0.09], 0, 0.8).setBaseColorTexture(grainTex),
  stitch: mat("Fixture_Stitch", [0.23, 0.23, 0.25], 0, 0.9),
  trim: mat("Fixture_Trim", [0.02, 0.02, 0.02], 0.1, 0.1),
};

function part(name, size, at, material, parent = scene) {
  const mesh = doc.createMesh(name).addPrimitive(box(...size).setMaterial(material));
  const node = doc.createNode(name).setMesh(mesh).setTranslation(at);
  parent.addChild(node);
  return node;
}
const group = (name) => {
  const node = doc.createNode(name);
  scene.addChild(node);
  return node;
};

part("Fixture_Body", [1.9, 0.62, 4.4], [0, 0.6, 0], M.paint);
part("Fixture_Door_L", [0.04, 0.5, 1.2], [0.97, 0.62, 0.2], M.paint);
part("Fixture_Door_R", [0.04, 0.5, 1.2], [-0.97, 0.62, 0.2], M.paint);
part("Fixture_Cabin_Glass", [1.6, 0.48, 2.0], [0, 1.15, -0.1], M.glass);
part("Fixture_Seat_L", [0.5, 0.45, 0.55], [0.4, 1.12, -0.3], M.leather);
part("Fixture_Seat_R", [0.5, 0.45, 0.55], [-0.4, 1.12, -0.3], M.leather);
part("Fixture_Seat_Stitch_L", [0.04, 0.02, 0.5], [0.4, 1.355, -0.3], M.stitch);
part("Fixture_Seat_Stitch_R", [0.04, 0.02, 0.5], [-0.4, 1.355, -0.3], M.stitch);
part("Fixture_Dash", [1.5, 0.12, 0.25], [0, 1.2, 0.75], M.trim);

const corners = [[0.98, 0.34, 1.35], [-0.98, 0.34, 1.35], [0.98, 0.34, -1.35], [-0.98, 0.34, -1.35]];
const std = group("Fixture_Wheels_Standard");
const alt = group("Fixture_Wheels_Alt");
corners.forEach(([x, y, z], i) => {
  part(`Fixture_Wheel_Standard_${i}`, [0.26, 0.68, 0.68], [x, y, z], M.wheel, std);
  part(`Fixture_Wheel_Alt_${i}`, [0.28, 0.72, 0.72], [x, y + 0.02, z], M.wheelAlt, alt);
  part(`Fixture_Caliper_${i}`, [0.06, 0.22, 0.16], [x + Math.sign(x) * 0.16, y + 0.1, z], M.caliper);
});
part("Fixture_Rear_Spoiler", [1.6, 0.06, 0.32], [0, 1.08, -2.0], M.paint);
part("Fixture_Front_Splitter", [1.8, 0.04, 0.2], [0, 0.29, 2.25], M.trim);

const io = await createIO();
const out = "tools/asset-pipeline/fixtures/loader-test.raw.glb";
await io.write(out, doc);
console.log(`Fixture written to ${out}`);
