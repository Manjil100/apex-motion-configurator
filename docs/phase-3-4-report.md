# Phase 3 and 4 report

## Phase 3: Porsche 911. Waiting on a licensed model

No code can make the 911 real until a model is bought. Recommended: HKV Studios' 2026 Porsche 911 GT3 (992.2) on CGTrader, US$149, Royalty Free licence, ships GLB at three detail levels. Before buying, confirm in writing with the seller that a browser-based configurator is covered. Using it means changing the 911 catalogue entry from Carrera T to GT3. No marketplace licence covers Porsche's own design and trademark rights; a paid launch needs Porsche's permission.

## Phase 4: customisation engine. Done

- `lib/customisation/capabilities.ts` decides, per vehicle, which options its model can show. Without a model every option stays selectable and says whether it is shown on the material sample or only saved and priced. With a model, an option the manifest does not map is switched off with a reason shown under it.
- Share links and saved builds are cleaned on load: unavailable options are removed and the user is told which.
- `asset.visibility` in the manifest swaps wheel sets and switches body parts on and off by node name.
- Interior trim finishes apply through the `interior_trim` slot. Carbon fibre is an approximation (dark satin, no weave) and says so.
- Body paint is upgraded from glTF's standard material to a physical material so clearcoat works.

## Asset pipeline. New

`asset:inspect`, `asset:optimise` and `asset:fixture` in `tools/asset-pipeline/`. Optimisation keeps node and material names and does not merge identically-looking materials with different names.

## First real GLB through the loader

`/dev/loader-test` loads a generated, compressed test model (blocks with named parts, not a vehicle, labelled as a placeholder). Not served in production.

## Tested

| Check | Result |
| --- | --- |
| Lint, typecheck, production build | Pass |
| 31 unit tests, including 9 new for availability, share-link cleaning and part visibility | Pass |
| Inspect, optimise and re-inspect the test model: 0.17 MB to 0.03 MB, 276 triangles kept, all names kept | Pass |
| Browser, test model: GLB fetched (200), Meshopt and WebP decoded, no load error | Pass |
| Paint, calipers, leather, stitching, trim each change the rendered frame | Pass |
| Alternative wheel shows; switching back restores the original frame exactly | Pass, 0 pixels different |
| Rear spoiler and front splitter appear | Pass |
| Unmapped wheels (mesh, forged) and body parts (side skirts, diffuser) disabled | Pass |
| Catalogue cars request no GLB at all | Pass |
| Console and page errors | None |

## Not tested

- A real car model. The fixture proves the path; a real file will bring naming, scale and size problems the fixture cannot.
- Memory release when leaving a configurator by in-app navigation.
- Interior camera. Needs a model with a cabin and a look-around camera mode, which is not built yet.
- Real GPUs and phones, as before.
