#!/usr/bin/env node
/**
 * Shrink a GLB for the web.
 *
 *   npm run asset:optimise -- in.glb out.glb [--ratio 0.5] [--error 0.001] [--texture 2048]
 *
 * Removes duplicates and unused data, simplifies geometry towards `ratio` of
 * its triangles within `error` (fraction of the model's size), resizes
 * textures to at most `texture` px and re-encodes them as WebP, then applies
 * Meshopt compression. Node and material names are kept, so a manifest still
 * matches. Always re-inspect and look at the result: simplification can
 * damage thin parts such as badges, grilles and stitching.
 */
import { statSync } from "node:fs";
import { dedup, meshopt, prune, simplify, textureCompress, weld } from "@gltf-transform/functions";
import sharp from "sharp";
import { createIO, mb, MeshoptEncoder, MeshoptSimplifier, triangles } from "./io.mjs";

const args = process.argv.slice(2);
const [input, output] = args.filter((a) => !a.startsWith("--") && !/^[0-9.]+$/.test(a));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
if (!input || !output) {
  console.error("Usage: npm run asset:optimise -- in.glb out.glb [--ratio 0.5] [--error 0.001] [--texture 2048]");
  process.exit(1);
}
const ratio = flag("ratio", 0.5);
const error = flag("error", 0.001);
const size = flag("texture", 2048);

const io = await createIO();
const doc = await io.read(input);
const before = triangles(doc);

await doc.transform(
  // keepUniqueNames: two identical-looking materials with different names must stay
  // separate, or a manifest that maps one of them would silently change both.
  dedup({ keepUniqueNames: true }),
  prune({ keepLeaves: true }),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio, error }),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [size, size] }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);

await io.write(output, doc);
const after = triangles(doc);
console.log(`Triangles  ${before.toLocaleString()} → ${after.toLocaleString()}`);
console.log(`File size  ${mb(statSync(input).size)} → ${mb(statSync(output).size)}`);
console.log(`Written    ${output}`);
